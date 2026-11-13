#!/usr/bin/env python3
"""Convert OpenProject observatory workbook sheets to static JSON files."""

from __future__ import annotations

import json
from datetime import date, datetime
from pathlib import Path
from typing import Any

try:
    import openpyxl
except ImportError as exc:  # pragma: no cover
    raise SystemExit("openpyxl is required to convert projects_observatory.xlsx") from exc


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
WORKBOOK_PATH = DATA_DIR / "projects_observatory.xlsx"
OUTPUT_PATH = DATA_DIR / "projects_observatory.json"

SHEETS = {
    "projects": "01_projects_observatory",
    "researcher_links": "02_project_researcher_links",
    "match_summary": "08_match_researchers_summary",
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
        "projects": sheet_to_records(workbook, SHEETS["projects"]),
        "researcher_links": sheet_to_records(workbook, SHEETS["researcher_links"]),
        "match_summary": sheet_to_records(workbook, SHEETS["match_summary"]),
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {OUTPUT_PATH}")
    print(f"Projects: {len(payload['projects'])}")
    print(f"Project-researcher links: {len(payload['researcher_links'])}")
    print(f"Match summary rows: {len(payload['match_summary'])}")


if __name__ == "__main__":
    main()
