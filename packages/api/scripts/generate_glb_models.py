#!/usr/bin/env python3
"""
가구 GLB 3D 모델 생성 스크립트
- 각 가구 에셋에 대해 프로시저럴 박스 GLB 파일 생성
- 카테고리별 색상으로 구분
- PNG 썸네일 이미지 생성
- DB model_url / thumbnail_url 업데이트
"""
import asyncio
import os
import sys
import struct
import json
import math
import base64
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from app.config import settings
from PIL import Image, ImageDraw, ImageFont

# ── 출력 디렉토리 ─────────────────────────────────────────────────────────────
WEB_PUBLIC = Path(__file__).parent.parent.parent.parent / "packages" / "web" / "public"
MODELS_DIR = WEB_PUBLIC / "models"
THUMBS_DIR = WEB_PUBLIC / "thumbnails"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
THUMBS_DIR.mkdir(parents=True, exist_ok=True)

# ── 카테고리별 색상 (R, G, B 0.0~1.0) ──────────────────────────────────────
CATEGORY_COLORS = {
    "sofa":     (0.76, 0.60, 0.42),  # 따뜻한 베이지
    "table":    (0.55, 0.40, 0.28),  # 오크 우드
    "chair":    (0.45, 0.55, 0.65),  # 차분한 블루
    "bed":      (0.85, 0.75, 0.70),  # 부드러운 핑크베이지
    "storage":  (0.60, 0.60, 0.60),  # 중간 그레이
    "lighting": (0.95, 0.90, 0.60),  # 따뜻한 옐로우
    "bathroom": (0.80, 0.90, 0.95),  # 라이트 시안
    "kitchen":  (0.90, 0.90, 0.90),  # 라이트 그레이 (스테인리스)
    "curtain":  (0.82, 0.78, 0.72),  # 린넨 베이지
    "misc":     (0.70, 0.75, 0.70),  # 소프트 그린
}

CATEGORY_COLORS_HEX = {
    "sofa":     "#C2996A",
    "table":    "#8C6647",
    "chair":    "#7398A6",
    "bed":      "#D9BFBA",
    "storage":  "#999999",
    "lighting": "#F2E699",
    "bathroom": "#CCE6F2",
    "kitchen":  "#E6E6E6",
    "curtain":  "#D1C6B8",
    "misc":     "#B3BFB3",
}


def create_box_glb(slug: str, w: float, d: float, h: float, color: tuple[float, float, float]) -> bytes:
    """
    간단한 박스 GLB 파일 생성 (단위: mm → glTF unit 1mm 기준)
    w=width, d=depth, h=height (mm)
    """
    # mm 단위 그대로 사용 (1 Three.js unit = 1mm per CLAUDE.md)
    hw = w / 2.0
    hd = d / 2.0

    # 24개 버텍스 (각 면 4개, 법선 포함)
    # 순서: 오른쪽, 왼쪽, 위, 아래, 앞, 뒤
    faces = [
        # right (+X)
        [(hw, 0, -hd), (hw, h, -hd), (hw, h, hd), (hw, 0, hd)],
        # left (-X)
        [(-hw, 0, hd), (-hw, h, hd), (-hw, h, -hd), (-hw, 0, -hd)],
        # top (+Y)
        [(-hw, h, -hd), (-hw, h, hd), (hw, h, hd), (hw, h, -hd)],
        # bottom (-Y)
        [(-hw, 0, hd), (-hw, 0, -hd), (hw, 0, -hd), (hw, 0, hd)],
        # front (+Z)
        [(-hw, 0, hd), (-hw, h, hd), (hw, h, hd), (hw, 0, hd)],
        # back (-Z)
        [(hw, 0, -hd), (hw, h, -hd), (-hw, h, -hd), (-hw, 0, -hd)],
    ]
    normals = [
        (1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)
    ]

    positions = []
    norms = []
    for i, face in enumerate(faces):
        n = normals[i]
        for v in face:
            positions.extend(v)
            norms.extend(n)

    # 인덱스 (각 면 2개 삼각형)
    indices = []
    for i in range(6):
        base = i * 4
        indices += [base, base + 1, base + 2, base, base + 2, base + 3]

    # 바이너리 버퍼 패킹
    pos_bytes = struct.pack(f"{len(positions)}f", *positions)
    norm_bytes = struct.pack(f"{len(norms)}f", *norms)
    idx_bytes = struct.pack(f"{len(indices)}H", *indices)

    # 4바이트 정렬
    def pad4(b: bytes) -> bytes:
        r = len(b) % 4
        return b + b"\x00" * (4 - r if r else 0)

    pos_bytes = pad4(pos_bytes)
    norm_bytes = pad4(norm_bytes)
    idx_bytes = pad4(idx_bytes)

    pos_offset = 0
    norm_offset = len(pos_bytes)
    idx_offset = norm_offset + len(norm_bytes)
    total_bin = idx_offset + len(idx_bytes)
    bin_data = pos_bytes + norm_bytes + idx_bytes

    # AABB min/max
    px = [positions[i] for i in range(0, len(positions), 3)]
    py = [positions[i] for i in range(1, len(positions), 3)]
    pz = [positions[i] for i in range(2, len(positions), 3)]

    gltf = {
        "asset": {"version": "2.0", "generator": "SpacePlanner-gen"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{
            "name": slug,
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1},
                "indices": 2,
                "material": 0,
                "mode": 4,
            }]
        }],
        "materials": [{
            "name": f"mat_{slug}",
            "pbrMetallicRoughness": {
                "baseColorFactor": [color[0], color[1], color[2], 1.0],
                "metallicFactor": 0.1,
                "roughnessFactor": 0.8,
            },
            "doubleSided": False,
        }],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,  # FLOAT
                "count": len(positions) // 3,
                "type": "VEC3",
                "min": [min(px), min(py), min(pz)],
                "max": [max(px), max(py), max(pz)],
            },
            {
                "bufferView": 1,
                "componentType": 5126,
                "count": len(norms) // 3,
                "type": "VEC3",
            },
            {
                "bufferView": 2,
                "componentType": 5123,  # UNSIGNED_SHORT
                "count": len(indices),
                "type": "SCALAR",
            },
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": pos_offset, "byteLength": len(pos_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": norm_offset, "byteLength": len(norm_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": idx_offset, "byteLength": len(idx_bytes), "target": 34963},
        ],
        "buffers": [{"byteLength": total_bin}],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_bytes = pad4(json_bytes)

    # GLB 조립
    json_chunk = struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes
    bin_chunk = struct.pack("<II", len(bin_data), 0x004E4942) + bin_data
    header = struct.pack("<III", 0x46546C67, 2, 12 + len(json_chunk) + len(bin_chunk))

    return header + json_chunk + bin_chunk


def create_thumbnail(
    name: str, category_slug: str, w_mm: int, d_mm: int, h_mm: int
) -> Image.Image:
    """가구 썸네일 PNG 생성 (300x300 아이소메트릭 박스)"""
    size = 300
    img = Image.new("RGBA", (size, size), (248, 248, 248, 255))
    draw = ImageDraw.Draw(img)

    hex_color = CATEGORY_COLORS_HEX.get(category_slug, "#CCCCCC")
    r = int(hex_color[1:3], 16)
    g = int(hex_color[3:5], 16)
    b = int(hex_color[5:7], 16)
    face_top   = (min(r + 40, 255), min(g + 40, 255), min(b + 40, 255))
    face_front = (r, g, b)
    face_right = (max(r - 40, 0), max(g - 40, 0), max(b - 40, 0))

    # 비율 계산 (최대 200px 박스)
    max_dim = max(w_mm, d_mm, h_mm)
    scale = 100.0 / max_dim
    W = w_mm * scale
    D = d_mm * scale
    H = h_mm * scale

    cx, cy = size // 2, size // 2 + 20
    # 아이소메트릭 프로젝션
    angle = math.radians(30)
    cos_a, sin_a = math.cos(angle), math.sin(angle)

    def iso(x: float, y: float, z: float) -> tuple[int, int]:
        px = cx + (x - z) * cos_a
        py = cy - y - (x + z) * sin_a * 0.5
        return (int(px), int(py))

    # 바닥 기준점
    pts = {
        "FBL": iso(0, 0, 0),
        "FBR": iso(W, 0, 0),
        "BBR": iso(W, 0, D),
        "BBL": iso(0, 0, D),
        "FTL": iso(0, H, 0),
        "FTR": iso(W, H, 0),
        "BTR": iso(W, H, D),
        "BTL": iso(0, H, D),
    }

    # 앞면
    draw.polygon([pts["FBL"], pts["FBR"], pts["FTR"], pts["FTL"]], fill=face_front)
    # 오른면
    draw.polygon([pts["FBR"], pts["BBR"], pts["BTR"], pts["FTR"]], fill=face_right)
    # 윗면
    draw.polygon([pts["FTL"], pts["FTR"], pts["BTR"], pts["BTL"]], fill=face_top)

    # 테두리
    outline = (max(r - 80, 0), max(g - 80, 0), max(b - 80, 0))
    for edge in [
        ("FBL","FBR"),("FBR","FTR"),("FTR","FTL"),("FTL","FBL"),
        ("FBR","BBR"),("BBR","BTR"),("BTR","FTR"),
        ("FTL","BTL"),("BTL","BTR"),
    ]:
        draw.line([pts[edge[0]], pts[edge[1]]], fill=outline, width=2)

    # 이름 텍스트
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), name, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) // 2, size - 28), name, fill=(60, 60, 60, 255), font=font)

    return img


# ── 에셋 목록 (seed_assets.py와 동일) ─────────────────────────────────────
ASSETS_BY_CATEGORY = {
    "sofa": [
        {"name": "3인용 패브릭 소파", "slug": "sofa-fabric-3seat", "width_mm": 2100, "depth_mm": 850, "height_mm": 800},
        {"name": "2인용 가죽 소파", "slug": "sofa-leather-2seat", "width_mm": 1600, "depth_mm": 800, "height_mm": 750},
        {"name": "L자형 코너 소파", "slug": "sofa-corner-l", "width_mm": 2500, "depth_mm": 1600, "height_mm": 800},
        {"name": "원형 소파", "slug": "sofa-round", "width_mm": 1200, "depth_mm": 1200, "height_mm": 750},
        {"name": "1인용 암체어", "slug": "sofa-armchair", "width_mm": 750, "depth_mm": 750, "height_mm": 800},
    ],
    "table": [
        {"name": "원형 다이닝 테이블", "slug": "table-dining-round-4", "width_mm": 1200, "depth_mm": 1200, "height_mm": 750},
        {"name": "직사각 다이닝 테이블", "slug": "table-dining-rect-6", "width_mm": 1800, "depth_mm": 900, "height_mm": 750},
        {"name": "커피 테이블", "slug": "table-coffee", "width_mm": 1200, "depth_mm": 600, "height_mm": 400},
        {"name": "사이드 테이블", "slug": "table-side", "width_mm": 450, "depth_mm": 450, "height_mm": 550},
        {"name": "책상", "slug": "table-desk", "width_mm": 1400, "depth_mm": 700, "height_mm": 750},
    ],
    "chair": [
        {"name": "다이닝 체어", "slug": "chair-dining", "width_mm": 450, "depth_mm": 500, "height_mm": 900},
        {"name": "오피스 체어", "slug": "chair-office", "width_mm": 650, "depth_mm": 650, "height_mm": 1100},
        {"name": "바 스툴", "slug": "chair-barstool", "width_mm": 400, "depth_mm": 400, "height_mm": 750},
        {"name": "라운지 체어", "slug": "chair-lounge", "width_mm": 700, "depth_mm": 800, "height_mm": 900},
        {"name": "벤치", "slug": "chair-bench", "width_mm": 1200, "depth_mm": 400, "height_mm": 450},
    ],
    "bed": [
        {"name": "킹 사이즈 침대", "slug": "bed-king", "width_mm": 1800, "depth_mm": 2100, "height_mm": 500},
        {"name": "퀸 사이즈 침대", "slug": "bed-queen", "width_mm": 1500, "depth_mm": 2100, "height_mm": 500},
        {"name": "싱글 침대", "slug": "bed-single", "width_mm": 1000, "depth_mm": 2100, "height_mm": 450},
        {"name": "수납형 침대", "slug": "bed-storage-king", "width_mm": 1800, "depth_mm": 2100, "height_mm": 400},
        {"name": "벙커 침대", "slug": "bed-bunk", "width_mm": 1000, "depth_mm": 2100, "height_mm": 1800},
    ],
    "storage": [
        {"name": "4단 옷장", "slug": "storage-wardrobe-4", "width_mm": 1600, "depth_mm": 600, "height_mm": 2200},
        {"name": "책장 5단", "slug": "storage-bookshelf-5", "width_mm": 900, "depth_mm": 300, "height_mm": 2000},
        {"name": "TV 거실장", "slug": "storage-tv-console", "width_mm": 1800, "depth_mm": 400, "height_mm": 500},
        {"name": "서랍 체스트", "slug": "storage-chest-5", "width_mm": 800, "depth_mm": 450, "height_mm": 1200},
        {"name": "코너 선반", "slug": "storage-corner-shelf", "width_mm": 500, "depth_mm": 500, "height_mm": 1800},
    ],
    "lighting": [
        {"name": "실링 라이트", "slug": "light-ceiling", "width_mm": 600, "depth_mm": 600, "height_mm": 100},
        {"name": "펜던트 조명", "slug": "light-pendant", "width_mm": 300, "depth_mm": 300, "height_mm": 400},
        {"name": "플로어 램프", "slug": "light-floor", "width_mm": 350, "depth_mm": 350, "height_mm": 1700},
        {"name": "테이블 램프", "slug": "light-table", "width_mm": 250, "depth_mm": 250, "height_mm": 500},
        {"name": "벽 간접 조명", "slug": "light-wall", "width_mm": 200, "depth_mm": 100, "height_mm": 200},
    ],
    "bathroom": [
        {"name": "욕조 (프리스탠딩)", "slug": "bath-tub-freestanding", "width_mm": 1700, "depth_mm": 800, "height_mm": 600},
        {"name": "세면대 (스탠드형)", "slug": "bath-sink-stand", "width_mm": 600, "depth_mm": 450, "height_mm": 900},
        {"name": "양변기", "slug": "bath-toilet", "width_mm": 380, "depth_mm": 700, "height_mm": 800},
        {"name": "욕실 수납장", "slug": "bath-cabinet", "width_mm": 800, "depth_mm": 350, "height_mm": 1800},
        {"name": "샤워 부스", "slug": "bath-shower-booth", "width_mm": 900, "depth_mm": 900, "height_mm": 2100},
    ],
    "kitchen": [
        {"name": "주방 아일랜드", "slug": "kitchen-island", "width_mm": 1500, "depth_mm": 900, "height_mm": 900},
        {"name": "냉장고 (4도어)", "slug": "kitchen-fridge-4door", "width_mm": 900, "depth_mm": 750, "height_mm": 1800},
        {"name": "식기 세척기", "slug": "kitchen-dishwasher", "width_mm": 600, "depth_mm": 600, "height_mm": 850},
        {"name": "오픈 선반 (주방)", "slug": "kitchen-open-shelf", "width_mm": 900, "depth_mm": 300, "height_mm": 1500},
        {"name": "주방 조리대 세트", "slug": "kitchen-counter-set", "width_mm": 2400, "depth_mm": 600, "height_mm": 900},
    ],
    "curtain": [
        {"name": "린넨 커튼", "slug": "curtain-linen-2400", "width_mm": 1500, "depth_mm": 50, "height_mm": 2400},
        {"name": "블랙아웃 커튼", "slug": "curtain-blackout", "width_mm": 1500, "depth_mm": 50, "height_mm": 2400},
        {"name": "롤 블라인드", "slug": "curtain-roll-blind", "width_mm": 1200, "depth_mm": 80, "height_mm": 2000},
        {"name": "베네치안 블라인드", "slug": "curtain-venetian", "width_mm": 1200, "depth_mm": 80, "height_mm": 2000},
        {"name": "쉬어 커튼", "slug": "curtain-sheer", "width_mm": 1500, "depth_mm": 50, "height_mm": 2400},
    ],
    "misc": [
        {"name": "러그 (2x3m)", "slug": "misc-rug-2x3", "width_mm": 2000, "depth_mm": 3000, "height_mm": 10},
        {"name": "화분 (대형)", "slug": "misc-plant-large", "width_mm": 400, "depth_mm": 400, "height_mm": 1500},
        {"name": "TV (65인치)", "slug": "misc-tv-65", "width_mm": 1450, "depth_mm": 80, "height_mm": 850},
        {"name": "피아노 (업라이트)", "slug": "misc-piano-upright", "width_mm": 1500, "depth_mm": 600, "height_mm": 1200},
        {"name": "운동기구 (트레드밀)", "slug": "misc-treadmill", "width_mm": 900, "depth_mm": 1800, "height_mm": 1400},
    ],
}


async def update_db_urls(engine) -> None:
    """DB의 model_url, thumbnail_url 업데이트"""
    async with engine.connect() as conn:
        for cat_slug, assets in ASSETS_BY_CATEGORY.items():
            for asset in assets:
                slug = asset["slug"]
                model_url = f"/models/{slug}.glb"
                thumb_url = f"/thumbnails/{slug}.png"
                await conn.execute(
                    text(
                        "UPDATE assets SET model_url = :mu, thumbnail_url = :tu "
                        "WHERE slug = :slug"
                    ),
                    {"mu": model_url, "tu": thumb_url, "slug": slug},
                )
        await conn.commit()
    print("  DB URLs 업데이트 완료")


async def main() -> None:
    total = 0
    print(f"출력 디렉토리: {MODELS_DIR}")
    print(f"썸네일 디렉토리: {THUMBS_DIR}\n")

    for cat_slug, assets in ASSETS_BY_CATEGORY.items():
        color = CATEGORY_COLORS.get(cat_slug, (0.7, 0.7, 0.7))
        for asset in assets:
            slug = asset["slug"]
            w = asset["width_mm"]
            d = asset["depth_mm"]
            h = asset["height_mm"]
            name = asset["name"]

            # GLB 생성
            glb_path = MODELS_DIR / f"{slug}.glb"
            glb_bytes = create_box_glb(slug, w, d, h, color)
            glb_path.write_bytes(glb_bytes)

            # 썸네일 생성
            thumb_path = THUMBS_DIR / f"{slug}.png"
            img = create_thumbnail(name, cat_slug, w, d, h)
            img.save(thumb_path, "PNG")

            total += 1
            print(f"  [{cat_slug}] {slug} → {len(glb_bytes):,}B GLB + thumbnail")

    print(f"\n총 {total}개 에셋 생성 완료")

    # DB 업데이트
    print("\nDB URL 업데이트 중...")
    engine = create_async_engine(settings.DATABASE_URL)
    await update_db_urls(engine)
    await engine.dispose()

    print("\n✅ 완료!")
    print(f"  models/  → {len(list(MODELS_DIR.glob('*.glb')))}개 GLB")
    print(f"  thumbs/  → {len(list(THUMBS_DIR.glob('*.png')))}개 PNG")


if __name__ == "__main__":
    asyncio.run(main())
