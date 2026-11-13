import csv
import json
import sys
from functools import lru_cache
from math import ceil
from pathlib import Path
from statistics import median
from typing import Any

from app.schemas.entities import Page


REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = REPO_ROOT / "frontend" / "public" / "data"
PUBLICATIONS_CSV = DATA_DIR / "publications_observatory.csv"
INDICATORS_JSON = DATA_DIR / "publication_indicators_observatory.json"
MISSING_VALUES = {"", "nan", "none", "na", "n/a", "null", "undefined"}
csv.field_size_limit(sys.maxsize)


@lru_cache(maxsize=1)
def real_publications() -> list[dict[str, Any]]:
    if not PUBLICATIONS_CSV.exists():
        return []
    with PUBLICATIONS_CSV.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle, delimiter=";"))
    return [normalize_publication(row, index) for index, row in enumerate(rows) if clean(row.get("title"))]


@lru_cache(maxsize=1)
def indicator_workbook() -> dict[str, list[dict[str, Any]]]:
    if not INDICATORS_JSON.exists():
        return {}
    return json.loads(INDICATORS_JSON.read_text(encoding="utf-8"))


def list_real_publications(
    q: str | None,
    page: int,
    page_size: int,
    sort_by: str,
    sort_order: str,
    filters: dict[str, Any],
) -> Page[dict[str, Any]]:
    items = real_publications()
    query = (q or "").strip().lower()
    if query:
        items = [
            item for item in items
            if query in " ".join(
                str(value or "")
                for value in [
                    item.get("title"),
                    item.get("abstract"),
                    item.get("doi"),
                    item.get("pmid"),
                    item.get("journal", {}).get("name") if item.get("journal") else "",
                    item.get("study_type"),
                    item.get("thematic_area"),
                    item.get("source"),
                    " ".join(author["name"] for author in item.get("authors", [])),
                ]
            ).lower()
        ]

    for key, expected in filters.items():
        if expected is None or expected == "":
            continue
        expected_text = str(expected).strip().lower()
        items = [item for item in items if expected_text in filter_value(item, key).lower()]

    reverse = sort_order == "desc"
    items = sorted(items, key=lambda item: sort_value(item, sort_by), reverse=reverse)

    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    total = len(items)
    start = (page - 1) * page_size
    return Page(items=items[start:start + page_size], total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


def get_real_publication(item_id: int) -> dict[str, Any] | None:
    return next((item for item in real_publications() if item["id"] == item_id), None)


def real_publication_summary() -> dict[str, Any]:
    publications = real_publications()
    workbook_summary = {row.get("indicator"): to_number(row.get("value")) for row in indicator_workbook().get("summary", [])}
    coverage = real_publication_coverage()
    q1 = sum(1 for item in publications if item.get("quartile") == "Q1")
    q2 = sum(1 for item in publications if item.get("quartile") == "Q2")
    q3 = sum(1 for item in publications if item.get("quartile") == "Q3")
    q4 = sum(1 for item in publications if item.get("quartile") == "Q4")
    citation_values = [item["citation_count"] for item in publications if present(item.get("citation_count"))]
    included = int(workbook_summary.get("Publicaciones incluidas") or len(publications))

    return {
        "total_publicaciones": int(workbook_summary.get("Total publicaciones") or len(publications)),
        "publicaciones_incluidas": included,
        "publicaciones_indexadas": included,
        "con_doi": int(workbook_summary.get("Con DOI") or sum(1 for item in publications if present(item.get("doi")))),
        "con_issn": int(workbook_summary.get("Con ISSN de revista") or sum(1 for item in publications if present((item.get("journal") or {}).get("issn")))),
        "con_cuartil": int(workbook_summary.get("Con cuartil") or sum(1 for item in publications if present(item.get("quartile")))),
        "con_citas": next((int(item.get("present") or 0) for item in coverage if item.get("field") == "citation_count"), len(citation_values)),
        "publicaciones_q1": q1,
        "publicaciones_q2": q2,
        "publicaciones_q3": q3,
        "publicaciones_q4": q4,
        "publicaciones_q1_q2": q1 + q2,
        "citas_totales": int(workbook_summary.get("Total citas") or sum(citation_values)),
        "mediana_citas": workbook_summary.get("Mediana de citas") or (median(citation_values) if citation_values else 0),
        "acceso_abierto": int(workbook_summary.get("Acceso abierto") or sum(1 for item in publications if item.get("open_access"))),
        "investigadores_autores": len({author["name"] for item in publications for author in item.get("authors", [])}),
        "revistas_registradas": len({item["journal"]["name"] for item in publications if item.get("journal")}),
        "ultima_actualizacion": max((item.get("updated_at") or item.get("citation_retrieved_at") or "" for item in publications), default="No disponible"),
        "cobertura_doi": coverage_percent(coverage, "doi"),
        "cobertura_cuartil": coverage_percent(coverage, "journal_quartile"),
        "cobertura_citas": coverage_percent(coverage, "citation_count"),
    }


def real_publication_analytics() -> dict[str, Any]:
    publications = real_publications()
    workbook = indicator_workbook()
    by_journal = workbook.get("by_journal") or []
    return {
        "annual_evolution": analytics_rows(workbook.get("by_year"), "year", "publications") or count_by(publications, lambda item: str(item.get("year") or "No disponible")),
        "by_thematic_area": count_by(publications, lambda item: item.get("thematic_area") or "Sin area tematica"),
        "by_thematic_category": count_by(publications, lambda item: item.get("thematic_category") or "Sin categoria tematica"),
        "by_thematic_subtheme": count_by(publications, lambda item: item.get("thematic_subtheme") or "Sin subtema"),
        "by_study_type": analytics_rows(workbook.get("by_study_type"), "study_type", "publications") or count_by(publications, lambda item: item.get("study_type") or "No disponible"),
        "top_journals": [{"label": row.get("journal_title") or "Revista no disponible", "value": int(row.get("publications") or 0)} for row in by_journal[:10]],
        "open_access": analytics_rows(workbook.get("by_open_access"), "open_access", "publications", open_access_label) or count_by(publications, lambda item: item.get("open_access_status") or "No disponible"),
        "by_unit": count_by(publications, lambda item: item.get("research_units", [{}])[0].get("name", "EsSalud")),
        "quartiles": quartiles(workbook.get("by_quartile"), publications),
        "coverage": real_publication_coverage(),
    }


def real_publication_coverage() -> list[dict[str, Any]]:
    rows = indicator_workbook().get("coverage")
    if rows:
        return [
            {
                "field": row.get("field"),
                "label": field_label(str(row.get("field"))),
                "present": int(row.get("present") or 0),
                "missing": int(row.get("missing") or 0),
                "coverage_percent": float(row.get("coverage_percent") or 0),
            }
            for row in rows
        ]
    return []


def real_publication_filters() -> dict[str, list[str]]:
    publications = real_publications()
    return {
        "years": sorted(unique(str(item.get("year")) for item in publications if item.get("year")), reverse=True),
        "publication_types": sorted(unique(item.get("publication_type") for item in publications)),
        "journals": sorted(unique((item.get("journal") or {}).get("name") for item in publications)),
        "quartiles": ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"],
        "study_types": sorted(unique(item.get("study_type") for item in publications)),
        "thematic_areas": sorted(unique(item.get("thematic_area") for item in publications)),
        "sources": sorted(unique(item.get("source") for item in publications)),
        "funding_sources": sorted(unique(item.get("funding_source") for item in publications)),
    }


def normalize_publication(row: dict[str, str], index: int) -> dict[str, Any]:
    journal_title = clean(row.get("journal_title"))
    quartile = clean(row.get("journal_quartile"))
    impact_factor = to_number(row.get("journal_impact_factor"))
    return {
        "id": index + 1,
        "title": clean(row.get("title")) or "Titulo no disponible",
        "abstract": clean(row.get("abstract")),
        "year": int(to_number(row.get("year")) or 0),
        "publication_type": clean(row.get("publication_type_label")) or clean(row.get("publication_type")) or "No disponible",
        "journal_id": int(to_number(row.get("journal_id")) or index + 1),
        "journal": {
            "id": int(to_number(row.get("journal_id")) or index + 1),
            "name": journal_title,
            "issn": clean(row.get("journal_issn")),
            "subject_area": clean(row.get("journal_categories")),
            "quartile": quartile,
            "impact_factor": impact_factor,
        } if journal_title else None,
        "doi": clean(row.get("doi")),
        "pmid": clean(row.get("pmid")),
        "quartile": quartile,
        "impact_factor": impact_factor,
        "study_type": clean(row.get("study_type")),
        "thematic_area": clean(row.get("thematic_area")),
        "funding_source": None,
        "funding": None,
        "open_access": bool_value(row.get("open_access")) or False,
        "open_access_status": "Acceso abierto" if bool_value(row.get("open_access")) else "Restringido",
        "citation_count": int(to_number(row.get("citation_count")) or 0),
        "altmetric_score": to_number(row.get("altmetric_score")) or 0,
        "source": clean(row.get("source")),
        "external_identifiers": {
            "publication_id": clean(row.get("publication_id")),
            "openalex_id": clean(row.get("openalex_id")),
            "scopus_eid": clean(row.get("scopus_eid")),
        },
        "authors": people(row.get("authors"), index * 1000),
        "keywords": keywords(row, index),
        "projects": [],
        "research_units": [{"id": index + 1, "name": "EsSalud - produccion cientifica institucional"}],
        "created_at": clean(row.get("created_at")),
        "updated_at": clean(row.get("updated_at")),
    }


def filter_value(item: dict[str, Any], key: str) -> str:
    if key == "journal":
        return str((item.get("journal") or {}).get("name") or "")
    if key == "quartile":
        return str(item.get("quartile") or "Sin cuartil")
    if key == "author":
        return " ".join(author["name"] for author in item.get("authors", []))
    if key == "funding":
        return str(item.get("funding_source") or "")
    return str(item.get(key) or "")


def sort_value(item: dict[str, Any], key: str) -> Any:
    if key in {"citations", "citation_count"}:
        return item.get("citation_count") or 0
    if key == "title":
        return item.get("title") or ""
    if key == "quartile":
        return item.get("quartile") or "ZZ"
    return item.get("year") or 0


def analytics_rows(rows: list[dict[str, Any]] | None, label_key: str, value_key: str, formatter=str) -> list[dict[str, Any]] | None:
    if not rows:
        return None
    return [{"label": formatter(row.get(label_key)), "value": int(row.get(value_key) or 0)} for row in rows]


def quartiles(rows: list[dict[str, Any]] | None, publications: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if rows:
        counts = {clean(row.get("journal_quartile")) or "Sin cuartil": int(row.get("publications") or 0) for row in rows}
    else:
        counts = {item["label"]: item["value"] for item in count_by(publications, lambda item: item.get("quartile") or "Sin cuartil")}
    return [{"label": label, "value": counts.get(label, 0)} for label in ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"]]


def count_by(items: list[dict[str, Any]], selector) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}
    for item in items:
        label = str(selector(item) or "No disponible")
        counts[label] = counts.get(label, 0) + 1
    return [{"label": label, "value": value} for label, value in sorted(counts.items(), key=lambda pair: pair[1], reverse=True)]


def people(value: str | None, base_id: int) -> list[dict[str, Any]]:
    return [{"id": base_id + index + 1, "name": name.strip()} for index, name in enumerate((value or "").split("|")) if name.strip()]


def keywords(row: dict[str, str], index: int) -> list[dict[str, Any]]:
    terms = unique([row.get("thematic_area"), row.get("study_type")])
    return [{"id": index * 10 + idx + 1, "term": term, "vocabulary": "Clasificacion observatorio"} for idx, term in enumerate(terms)]


def clean(value: Any) -> str | None:
    text = str(value or "").strip()
    return None if text.lower() in MISSING_VALUES else text


def present(value: Any) -> bool:
    return clean(value) is not None


def to_number(value: Any) -> float | None:
    text = clean(value)
    if text is None:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def bool_value(value: Any) -> bool | None:
    text = (clean(value) or "").lower()
    if text in {"true", "1", "si", "sí", "yes"}:
        return True
    if text in {"false", "0", "no"}:
        return False
    return None


def unique(values) -> list[str]:
    return list({text for value in values if (text := clean(value))})


def field_label(field: str) -> str:
    return {
        "abstract": "Resumen",
        "doi": "DOI",
        "pmid": "PMID",
        "study_type": "Tipo de estudio",
        "thematic_area": "Area tematica",
        "funding_source": "Fuente de financiamiento",
        "funding": "Financiamiento",
        "open_access": "Acceso abierto",
        "citation_count": "Citas",
        "altmetric_score": "Altmetric",
        "journal_quartile": "Cuartil de revista",
        "journal_impact_factor": "Factor de impacto",
    }.get(field, field)


def coverage_percent(coverage: list[dict[str, Any]], field: str) -> float:
    item = next((row for row in coverage if row.get("field") == field), None)
    return float(item.get("coverage_percent", 0)) if item else 0


def open_access_label(value: Any) -> str:
    parsed = bool_value(value)
    if parsed is True:
        return "Acceso abierto"
    if parsed is False:
        return "Restringido"
    return "No disponible"
