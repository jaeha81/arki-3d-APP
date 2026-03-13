from typing import Any

DEFAULT_PRICES: dict[str, dict[str, Any]] = {
    "flooring": {"name": "바닥재 (기본)", "unit": "m²", "unit_price": 35000},
    "paint": {"name": "페인트 (기본)", "unit": "m²", "unit_price": 12000},
    "furniture": {"name": "가구 (기본)", "unit": "개", "unit_price": 500000},
    "labor": {"name": "시공 인건비", "unit": "m²", "unit_price": 150000},
    "demolition": {"name": "철거비", "unit": "식", "unit_price": 500000},
}


def extract_bom(scene_data: dict[str, Any]) -> list[dict[str, Any]]:
    """씬 데이터에서 BOM(Bill of Materials) 추출"""
    items: list[dict[str, Any]] = []
    walls: list[dict[str, Any]] = scene_data.get("walls", [])
    rooms: list[dict[str, Any]] = scene_data.get("rooms", [])
    furniture: list[dict[str, Any]] = scene_data.get("furniture", [])

    # 바닥재: 방 면적 합산 (rooms 없으면 벽 bounding box 추정)
    total_area_mm2 = 0.0
    if rooms:
        for room in rooms:
            area = room.get("area", 0)
            total_area_mm2 += float(area)
    elif walls:
        # 벽 좌표에서 bounding box 계산
        xs: list[float] = (
            [float(w.get("start", {}).get("x", 0)) for w in walls]
            + [float(w.get("end", {}).get("x", 0)) for w in walls]
        )
        ys: list[float] = (
            [float(w.get("start", {}).get("y", 0)) for w in walls]
            + [float(w.get("end", {}).get("y", 0)) for w in walls]
        )
        if xs and ys:
            width = max(xs) - min(xs)
            depth = max(ys) - min(ys)
            total_area_mm2 = width * depth

    total_area_m2 = total_area_mm2 / 1_000_000
    if total_area_m2 > 0:
        items.append({
            "category": "flooring",
            "name": "바닥재",
            "quantity": round(total_area_m2 * 1.1, 2),  # 10% 여유
            "unit": "m²",
            "unit_price": DEFAULT_PRICES["flooring"]["unit_price"],
        })

    # 벽 페인트: 벽 면적 합산
    wall_area_m2 = 0.0
    for wall in walls:
        sx = float(wall.get("start", {}).get("x", 0))
        sy = float(wall.get("start", {}).get("y", 0))
        ex = float(wall.get("end", {}).get("x", 0))
        ey = float(wall.get("end", {}).get("y", 0))
        length_mm = ((ex - sx) ** 2 + (ey - sy) ** 2) ** 0.5
        height_mm = float(wall.get("height", 2700))
        wall_area_m2 += (length_mm * height_mm) / 1_000_000

    if wall_area_m2 > 0:
        items.append({
            "category": "paint",
            "name": "페인트/도배",
            "quantity": round(wall_area_m2, 2),
            "unit": "m²",
            "unit_price": DEFAULT_PRICES["paint"]["unit_price"],
        })

    # 가구
    for furn_item in furniture:
        items.append({
            "category": "furniture",
            "name": f"가구 ({furn_item.get('assetId', 'unknown')})",
            "quantity": 1.0,
            "unit": "개",
            "unit_price": DEFAULT_PRICES["furniture"]["unit_price"],
        })

    # 시공비 (바닥 면적 기준)
    if total_area_m2 > 0:
        items.append({
            "category": "labor",
            "name": "시공 인건비",
            "quantity": round(total_area_m2, 2),
            "unit": "m²",
            "unit_price": DEFAULT_PRICES["labor"]["unit_price"],
        })
        items.append({
            "category": "demolition",
            "name": "철거비",
            "quantity": 1.0,
            "unit": "식",
            "unit_price": DEFAULT_PRICES["demolition"]["unit_price"],
        })

    return items


def calculate_estimate(
    bom_items: list[dict[str, Any]],
    margin_rate: float = 0.15,
) -> dict[str, Any]:
    """BOM → 견적 계산 (자재비 + 시공비 + 관리비)"""
    material_cost = 0
    labor_cost = 0
    calculated_items: list[dict[str, Any]] = []

    for item in bom_items:
        total = int(item["quantity"] * item["unit_price"])
        calculated_items.append({**item, "total_price": total})
        if item["category"] in ("labor", "demolition"):
            labor_cost += total
        else:
            material_cost += total

    subtotal = material_cost + labor_cost
    margin = int(subtotal * margin_rate)
    total_cost = subtotal + margin

    return {
        "material_cost": material_cost,
        "labor_cost": labor_cost,
        "margin_rate": margin_rate,
        "total_cost": total_cost,
        "items": calculated_items,
    }
