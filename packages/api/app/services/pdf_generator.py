from io import BytesIO
from typing import Any


def generate_estimate_pdf(estimate_data: dict[str, Any], project_name: str = "프로젝트") -> bytes:
    """견적서 PDF 생성 (reportlab 사용, 없으면 텍스트 fallback)"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle,
            HRFlowable,
        )

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=20,
            spaceAfter=6,
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=12,
            spaceAfter=4,
        )
        normal_style = styles["Normal"]

        story: list[Any] = []

        # 제목
        story.append(Paragraph("SpacePlanner 인테리어 견적서", title_style))
        story.append(Paragraph(f"프로젝트: {project_name}", normal_style))
        story.append(Spacer(1, 10 * mm))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
        story.append(Spacer(1, 5 * mm))

        # 내역 테이블
        items: list[dict[str, Any]] = estimate_data.get("items", [])
        table_data: list[list[str]] = [["항목", "수량", "단위", "단가(원)", "금액(원)"]]
        for item in items:
            table_data.append([
                str(item.get("name", "")),
                f"{item.get('quantity', 0):.1f}",
                str(item.get("unit", "")),
                f"{item.get('unit_price', 0):,}",
                f"{item.get('total_price', 0):,}",
            ])

        table = Table(
            table_data,
            colWidths=[80 * mm, 20 * mm, 20 * mm, 30 * mm, 30 * mm],
        )
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a90d9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ]))
        story.append(Paragraph("■ 견적 내역", heading_style))
        story.append(table)
        story.append(Spacer(1, 8 * mm))

        # 합계
        mat: int = estimate_data.get("material_cost", 0)
        lab: int = estimate_data.get("labor_cost", 0)
        rate: float = estimate_data.get("margin_rate", 0.15)
        total: int = estimate_data.get("total_cost", 0)
        margin = int((mat + lab) * rate)

        summary_data: list[list[str]] = [
            ["자재비", f"{mat:,}원"],
            ["시공비", f"{lab:,}원"],
            [f"관리비({int(rate * 100)}%)", f"{margin:,}원"],
            ["총 합계", f"{total:,}원"],
        ]
        summary_table = Table(summary_data, colWidths=[80 * mm, 40 * mm])
        summary_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, -1), (-1, -1), 12),
        ]))
        story.append(Paragraph("■ 합계", heading_style))
        story.append(summary_table)
        story.append(Spacer(1, 10 * mm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        story.append(Spacer(1, 3 * mm))
        story.append(
            Paragraph(
                "※ 본 견적은 참고용이며 현장 실측 후 변경될 수 있습니다.",
                normal_style,
            )
        )

        doc.build(story)
        return buffer.getvalue()

    except ImportError:
        # reportlab 미설치 시 텍스트 fallback
        total_cost: int = estimate_data.get("total_cost", 0)
        fallback = (
            f"SpacePlanner 견적서\n"
            f"프로젝트: {project_name}\n"
            f"총합계: {total_cost:,}원\n"
        )
        return fallback.encode("utf-8")
