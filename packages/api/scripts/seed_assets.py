#!/usr/bin/env python3
"""
기본 에셋 시딩 스크립트
사용법: python scripts/seed_assets.py
Docker로 DB 실행 후 사용
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings
from app.models.asset import AssetCategory, Asset
from app.models.material import Material

CATEGORIES = [
    {"name": "소파", "slug": "sofa", "icon": "sofa", "sort_order": 1},
    {"name": "테이블", "slug": "table", "icon": "table", "sort_order": 2},
    {"name": "의자", "slug": "chair", "icon": "chair", "sort_order": 3},
    {"name": "침대", "slug": "bed", "icon": "bed", "sort_order": 4},
    {"name": "수납장", "slug": "storage", "icon": "storage", "sort_order": 5},
    {"name": "조명", "slug": "lighting", "icon": "lightbulb", "sort_order": 6},
    {"name": "욕실", "slug": "bathroom", "icon": "bath", "sort_order": 7},
    {"name": "주방", "slug": "kitchen", "icon": "kitchen", "sort_order": 8},
    {"name": "커튼/블라인드", "slug": "curtain", "icon": "curtain", "sort_order": 9},
    {"name": "기타", "slug": "misc", "icon": "box", "sort_order": 10},
]

# 각 카테고리별 에셋 5개씩 = 50개
ASSETS_BY_CATEGORY = {
    "sofa": [
        {"name": "3인용 패브릭 소파", "slug": "sofa-fabric-3seat", "width_mm": 2100, "depth_mm": 850, "height_mm": 800, "style": "modern"},
        {"name": "2인용 가죽 소파", "slug": "sofa-leather-2seat", "width_mm": 1600, "depth_mm": 800, "height_mm": 750, "style": "classic"},
        {"name": "L자형 코너 소파", "slug": "sofa-corner-l", "width_mm": 2500, "depth_mm": 1600, "height_mm": 800, "style": "modern"},
        {"name": "원형 소파", "slug": "sofa-round", "width_mm": 1200, "depth_mm": 1200, "height_mm": 750, "style": "minimal"},
        {"name": "1인용 암체어", "slug": "sofa-armchair", "width_mm": 750, "depth_mm": 750, "height_mm": 800, "style": "modern"},
    ],
    "table": [
        {"name": "원형 다이닝 테이블 4인", "slug": "table-dining-round-4", "width_mm": 1200, "depth_mm": 1200, "height_mm": 750, "style": "modern"},
        {"name": "직사각 다이닝 테이블 6인", "slug": "table-dining-rect-6", "width_mm": 1800, "depth_mm": 900, "height_mm": 750, "style": "minimal"},
        {"name": "커피 테이블", "slug": "table-coffee", "width_mm": 1200, "depth_mm": 600, "height_mm": 400, "style": "modern"},
        {"name": "사이드 테이블", "slug": "table-side", "width_mm": 450, "depth_mm": 450, "height_mm": 550, "style": "minimal"},
        {"name": "책상", "slug": "table-desk", "width_mm": 1400, "depth_mm": 700, "height_mm": 750, "style": "modern"},
    ],
    "chair": [
        {"name": "다이닝 체어", "slug": "chair-dining", "width_mm": 450, "depth_mm": 500, "height_mm": 900, "style": "modern"},
        {"name": "오피스 체어", "slug": "chair-office", "width_mm": 650, "depth_mm": 650, "height_mm": 1100, "style": "modern"},
        {"name": "바 스툴", "slug": "chair-barstool", "width_mm": 400, "depth_mm": 400, "height_mm": 750, "style": "industrial"},
        {"name": "라운지 체어", "slug": "chair-lounge", "width_mm": 700, "depth_mm": 800, "height_mm": 900, "style": "classic"},
        {"name": "벤치", "slug": "chair-bench", "width_mm": 1200, "depth_mm": 400, "height_mm": 450, "style": "minimal"},
    ],
    "bed": [
        {"name": "킹 사이즈 침대", "slug": "bed-king", "width_mm": 1800, "depth_mm": 2100, "height_mm": 500, "style": "modern"},
        {"name": "퀸 사이즈 침대", "slug": "bed-queen", "width_mm": 1500, "depth_mm": 2100, "height_mm": 500, "style": "modern"},
        {"name": "싱글 침대", "slug": "bed-single", "width_mm": 1000, "depth_mm": 2100, "height_mm": 450, "style": "minimal"},
        {"name": "수납형 침대 (킹)", "slug": "bed-storage-king", "width_mm": 1800, "depth_mm": 2100, "height_mm": 400, "style": "modern"},
        {"name": "벙커 침대", "slug": "bed-bunk", "width_mm": 1000, "depth_mm": 2100, "height_mm": 1800, "style": "minimal"},
    ],
    "storage": [
        {"name": "4단 옷장", "slug": "storage-wardrobe-4", "width_mm": 1600, "depth_mm": 600, "height_mm": 2200, "style": "modern"},
        {"name": "책장 (5단)", "slug": "storage-bookshelf-5", "width_mm": 900, "depth_mm": 300, "height_mm": 2000, "style": "minimal"},
        {"name": "TV 거실장", "slug": "storage-tv-console", "width_mm": 1800, "depth_mm": 400, "height_mm": 500, "style": "modern"},
        {"name": "서랍 체스트 5단", "slug": "storage-chest-5", "width_mm": 800, "depth_mm": 450, "height_mm": 1200, "style": "modern"},
        {"name": "코너 선반", "slug": "storage-corner-shelf", "width_mm": 500, "depth_mm": 500, "height_mm": 1800, "style": "minimal"},
    ],
    "lighting": [
        {"name": "실링 라이트", "slug": "light-ceiling", "width_mm": 600, "depth_mm": 600, "height_mm": 100, "style": "modern"},
        {"name": "펜던트 조명", "slug": "light-pendant", "width_mm": 300, "depth_mm": 300, "height_mm": 400, "style": "industrial"},
        {"name": "플로어 램프", "slug": "light-floor", "width_mm": 350, "depth_mm": 350, "height_mm": 1700, "style": "modern"},
        {"name": "테이블 램프", "slug": "light-table", "width_mm": 250, "depth_mm": 250, "height_mm": 500, "style": "classic"},
        {"name": "벽 간접 조명", "slug": "light-wall", "width_mm": 200, "depth_mm": 100, "height_mm": 200, "style": "minimal"},
    ],
    "bathroom": [
        {"name": "욕조 (프리스탠딩)", "slug": "bath-tub-freestanding", "width_mm": 1700, "depth_mm": 800, "height_mm": 600, "style": "classic"},
        {"name": "세면대 (스탠드형)", "slug": "bath-sink-stand", "width_mm": 600, "depth_mm": 450, "height_mm": 900, "style": "modern"},
        {"name": "양변기", "slug": "bath-toilet", "width_mm": 380, "depth_mm": 700, "height_mm": 800, "style": "modern"},
        {"name": "욕실 수납장", "slug": "bath-cabinet", "width_mm": 800, "depth_mm": 350, "height_mm": 1800, "style": "minimal"},
        {"name": "샤워 부스", "slug": "bath-shower-booth", "width_mm": 900, "depth_mm": 900, "height_mm": 2100, "style": "modern"},
    ],
    "kitchen": [
        {"name": "주방 아일랜드", "slug": "kitchen-island", "width_mm": 1500, "depth_mm": 900, "height_mm": 900, "style": "modern"},
        {"name": "냉장고 (4도어)", "slug": "kitchen-fridge-4door", "width_mm": 900, "depth_mm": 750, "height_mm": 1800, "style": "modern"},
        {"name": "식기 세척기", "slug": "kitchen-dishwasher", "width_mm": 600, "depth_mm": 600, "height_mm": 850, "style": "modern"},
        {"name": "오픈 선반 (주방)", "slug": "kitchen-open-shelf", "width_mm": 900, "depth_mm": 300, "height_mm": 1500, "style": "industrial"},
        {"name": "주방 조리대 세트", "slug": "kitchen-counter-set", "width_mm": 2400, "depth_mm": 600, "height_mm": 900, "style": "modern"},
    ],
    "curtain": [
        {"name": "린넨 커튼 (2400 높이)", "slug": "curtain-linen-2400", "width_mm": 1500, "depth_mm": 50, "height_mm": 2400, "style": "minimal"},
        {"name": "블랙아웃 커튼", "slug": "curtain-blackout", "width_mm": 1500, "depth_mm": 50, "height_mm": 2400, "style": "modern"},
        {"name": "롤 블라인드", "slug": "curtain-roll-blind", "width_mm": 1200, "depth_mm": 80, "height_mm": 2000, "style": "minimal"},
        {"name": "베네치안 블라인드", "slug": "curtain-venetian", "width_mm": 1200, "depth_mm": 80, "height_mm": 2000, "style": "modern"},
        {"name": "쉬어 커튼", "slug": "curtain-sheer", "width_mm": 1500, "depth_mm": 50, "height_mm": 2400, "style": "classic"},
    ],
    "misc": [
        {"name": "러그 (2x3m)", "slug": "misc-rug-2x3", "width_mm": 2000, "depth_mm": 3000, "height_mm": 10, "style": "modern"},
        {"name": "화분 (대형)", "slug": "misc-plant-large", "width_mm": 400, "depth_mm": 400, "height_mm": 1500, "style": "minimal"},
        {"name": "TV (65인치)", "slug": "misc-tv-65", "width_mm": 1450, "depth_mm": 80, "height_mm": 850, "style": "modern"},
        {"name": "피아노 (업라이트)", "slug": "misc-piano-upright", "width_mm": 1500, "depth_mm": 600, "height_mm": 1200, "style": "classic"},
        {"name": "운동기구 (트레드밀)", "slug": "misc-treadmill", "width_mm": 900, "depth_mm": 1800, "height_mm": 1400, "style": "modern"},
    ],
}

MATERIALS = [
    # 벽 마감재
    {"name": "화이트 매트 도료", "category": "wall", "color_hex": "#F5F5F5", "sort_order": 1},
    {"name": "라이트 그레이 도료", "category": "wall", "color_hex": "#E0E0E0", "sort_order": 2},
    {"name": "웜 베이지 도료", "category": "wall", "color_hex": "#F5F0E8", "sort_order": 3},
    {"name": "딥 그레이 도료", "category": "wall", "color_hex": "#616161", "sort_order": 4},
    {"name": "네이비 블루 도료", "category": "wall", "color_hex": "#1A237E", "sort_order": 5},
    {"name": "테라코타 도료", "category": "wall", "color_hex": "#BF5A30", "sort_order": 6},
    {"name": "화이트 타일 (300x600)", "category": "wall", "color_hex": "#FAFAFA", "sort_order": 7},
    {"name": "그레이 벽돌 패턴", "category": "wall", "color_hex": "#9E9E9E", "sort_order": 8},
    {"name": "오크 우드 패널", "category": "wall", "color_hex": "#C8A96E", "sort_order": 9},
    {"name": "콘크리트 텍스처", "category": "wall", "color_hex": "#BDBDBD", "sort_order": 10},
    # 바닥 마감재
    {"name": "오크 원목마루 (내추럴)", "category": "floor", "color_hex": "#C8A96E", "sort_order": 1},
    {"name": "월넛 원목마루", "category": "floor", "color_hex": "#5D4037", "sort_order": 2},
    {"name": "화이트 원목마루", "category": "floor", "color_hex": "#F5F0E8", "sort_order": 3},
    {"name": "헤링본 파케이", "category": "floor", "color_hex": "#A1887F", "sort_order": 4},
    {"name": "대형 포슬린 타일 (화이트)", "category": "floor", "color_hex": "#FAFAFA", "sort_order": 5},
    {"name": "대형 포슬린 타일 (그레이)", "category": "floor", "color_hex": "#E0E0E0", "sort_order": 6},
    {"name": "테라코타 타일", "category": "floor", "color_hex": "#C2714F", "sort_order": 7},
    {"name": "블랙 스톤 타일", "category": "floor", "color_hex": "#212121", "sort_order": 8},
    {"name": "콘크리트 에폭시 (그레이)", "category": "floor", "color_hex": "#9E9E9E", "sort_order": 9},
    {"name": "카펫 (베이지)", "category": "floor", "color_hex": "#D7CCC8", "sort_order": 10},
    # 천장 마감재
    {"name": "화이트 석고보드", "category": "ceiling", "color_hex": "#FFFFFF", "sort_order": 1},
    {"name": "목재 빔 천장", "category": "ceiling", "color_hex": "#A1887F", "sort_order": 2},
    {"name": "블랙 매트 천장", "category": "ceiling", "color_hex": "#212121", "sort_order": 3},
    {"name": "콘크리트 노출 천장", "category": "ceiling", "color_hex": "#9E9E9E", "sort_order": 4},
    {"name": "라이트 그레이 천장", "category": "ceiling", "color_hex": "#F5F5F5", "sort_order": 5},
]


async def seed(db: AsyncSession) -> None:
    # 카테고리 생성
    cat_map: dict[str, AssetCategory] = {}
    for cat_data in CATEGORIES:
        cat = AssetCategory(**cat_data)
        db.add(cat)
        cat_map[cat_data["slug"]] = cat
    await db.flush()

    # 에셋 생성
    for cat_slug, assets_data in ASSETS_BY_CATEGORY.items():
        cat = cat_map.get(cat_slug)
        for asset_data in assets_data:
            asset = Asset(category_id=cat.id if cat else None, **asset_data, is_free=True)
            db.add(asset)

    # 마감재 생성
    for mat_data in MATERIALS:
        mat = Material(**mat_data, is_free=True)
        db.add(mat)

    await db.commit()
    print(f"Seeded: {len(CATEGORIES)} categories, 50 assets, {len(MATERIALS)} materials")


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        await seed(session)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
