#!/usr/bin/env python3
"""Convert research units and CIEI workbook sheets to static JSON."""

from __future__ import annotations

import json
from datetime import date, datetime
from pathlib import Path
from typing import Any

try:
    import openpyxl
except ImportError as exc:  # pragma: no cover
    raise SystemExit("openpyxl is required to convert research_centers_CIEI_observatory.xlsx") from exc


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
WORKBOOK_PATH = DATA_DIR / "research_centers_CIEI_observatory.xlsx"
OUTPUT_PATH = DATA_DIR / "research_units_observatory.json"

SHEETS = {
    "units": "01_research_units_observatory",
    "unit_ciei_links": "02_unit_ciei_links",
    "ethics_committees": "03_ethics_committees_ciei",
    "unit_staff_links": "04_unit_staff_links",
    "quality": "08_calidad_datos",
}


def clean_cell(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, str):
        text = value.strip()
        return text if text else None
    return value


def sheet_to_records(workbook: openpyxl.Workbook, sheet_name: str) -> list[dict[str, Any]]:
    if sheet_name not in workbook.sheetnames:
        return []
    sheet = workbook[sheet_name]
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [str(header).strip() if header is not None else f"column_{index}" for index, header in enumerate(rows[0])]
    records: list[dict[str, Any]] = []
    for row in rows[1:]:
        record = {headers[index]: clean_cell(row[index] if index < len(row) else None) for index in range(len(headers))}
        if any(value is not None for value in record.values()):
            records.append(record)
    return records


def main() -> None:
    if not WORKBOOK_PATH.exists():
        raise SystemExit(f"Workbook not found: {WORKBOOK_PATH}")

    workbook = openpyxl.load_workbook(WORKBOOK_PATH, read_only=True, data_only=True)
    payload = {
        "source_file": WORKBOOK_PATH.name,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "units": sheet_to_records(workbook, SHEETS["units"]),
        "unit_ciei_links": sheet_to_records(workbook, SHEETS["unit_ciei_links"]),
        "ethics_committees": sheet_to_records(workbook, SHEETS["ethics_committees"]),
        "unit_staff_links": sheet_to_records(workbook, SHEETS["unit_staff_links"]),
        "quality": sheet_to_records(workbook, SHEETS["quality"]),
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {OUTPUT_PATH}")
    print(f"Research units: {len(payload['units'])}")
    print(f"Unit-CIEI links: {len(payload['unit_ciei_links'])}")
    print(f"Ethics committees: {len(payload['ethics_committees'])}")
    print(f"Unit staff links: {len(payload['unit_staff_links'])}")
    print(f"Quality records: {len(payload['quality'])}")


if __name__ == "__main__":
    main()
