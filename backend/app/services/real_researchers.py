from __future__ import annotations

import csv
import json
import math
import re
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT / "frontend" / "public" / "data"
RESEARCHERS_CSV = DATA_DIR / "researchers_observatory.csv"
LINKS_CSV = DATA_DIR / "researcher_publication_links.csv"
INDICATORS_JSON = DATA_DIR / "researcher_indicators_observatory.json"
PROFILES_CSV = DATA_DIR / "researcher_profiles_curated.csv"
AFFILIATIONS_CSV = DATA_DIR / "researcher_affiliations_normalized.csv"
PHOTO_MANIFEST_CSV = DATA_DIR / "researcher_photo_manifest.csv"

MISSING = {"", "nan", "none", "na", "n/a", "null", "undefined"}


def real_researchers_available() -> bool:
    return RESEARCHERS_CSV.exists() and LINKS_CSV.exists()


@lru_cache(maxsize=1)
def real_researchers() -> list[dict[str, Any]]:
    rows = _read_csv(RESEARCHERS_CSV)
    links_by_researcher: dict[str, list[dict[str, Any]]] = {}
    for link in real_researcher_publication_links():
        links_by_researcher.setdefault(link["researcher_id"], []).append(link)
    profiles = _index_by_researcher_id(_read_optional_csv(PROFILES_CSV))
    affiliations = _index_by_researcher_id(_read_optional_csv(AFFILIATIONS_CSV))
    photos = _index_by_researcher_id(_read_optional_csv(PHOTO_MANIFEST_CSV))
    return [
        _map_researcher(
            row,
            index + 1,
            links_by_researcher.get(_clean(row.get("researcher_id")), []),
            profiles.get(_clean(row.get("researcher_id"))),
            affiliations.get(_clean(row.get("researcher_id"))),
            photos.get(_clean(row.get("researcher_id"))),
        )
        for index, row in enumerate(rows)
    ]


@lru_cache(maxsize=1)
def real_researcher_publication_links() -> list[dict[str, Any]]:
    return [_map_link(row) for row in _read_csv(LINKS_CSV)]


@lru_cache(maxsize=1)
def real_researcher_indicators() -> dict[str, list[dict[str, Any]]]:
    if not INDICATORS_JSON.exists():
        return {}
    return json.loads(INDICATORS_JSON.read_text(encoding="utf-8"))


def list_real_researchers(
    q: str | None,
    page: int,
    page_size: int,
    sort_by: str,
    sort_order: str,
    filters: dict[str, Any] | None = None,
) -> dict[str, Any]:
    filters = filters or {}
    items = real_researchers()
    query = (q or "").strip().lower()
    if query:
        items = [
            item for item in items
            if query in " ".join([
                item["full_name"],
                item.get("orcid") or "",
                item.get("affiliation") or "",
                item.get("primary_institution") or "",
                item.get("primary_unit") or "",
                item.get("primary_network") or "",
                item.get("specialty") or "",
                " ".join(item.get("thematic_areas", [])),
            ]).lower()
        ]
    if filters.get("orcid") == "Con ORCID":
        items = [item for item in items if item.get("orcid")]
    if filters.get("orcid") == "Sin ORCID":
        items = [item for item in items if not item.get("orcid")]
    if filters.get("thematic_area"):
        value = str(filters["thematic_area"]).lower()
        items = [item for item in items if value in " ".join(item.get("thematic_areas", [])).lower()]
    if filters.get("institution"):
        value = str(filters["institution"]).lower()
        items = [item for item in items if value in str(item.get("primary_institution", "")).lower()]
    if filters.get("unit"):
        value = str(filters["unit"]).lower()
        items = [item for item in items if value in str(item.get("primary_unit", "")).lower()]
    if filters.get("network"):
        value = str(filters["network"]).lower()
        items = [item for item in items if value in str(item.get("primary_network", "")).lower()]
    if filters.get("country"):
        value = str(filters["country"]).lower()
        items = [item for item in items if value in str(item.get("country", "")).lower()]
    if filters.get("review_status"):
        value = str(filters["review_status"]).lower()
        items = [item for item in items if value in str(item.get("profile_review_status", "")).lower()]
    if filters.get("quartile"):
        key = {"Q1": "n_q1", "Q2": "n_q2", "Q3": "n_q3", "Q4": "n_q4", "Sin cuartil": "n_without_quartile"}.get(str(filters["quartile"]))
        if key:
            items = [item for item in items if item.get(key, 0) > 0]

    reverse = sort_order == "desc"
    items = sorted(items, key=lambda item: item.get(sort_by) or item.get("full_name") or "", reverse=reverse)
    total = len(items)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    return {"items": items[start:start + page_size], "total": total, "page": page, "page_size": page_size, "pages": math.ceil(total / page_size) if total else 0}


def get_real_researcher(item_id: str) -> dict[str, Any] | None:
    decoded = item_id
    for item in real_researchers():
        if item["researcher_id"] == decoded or str(item["id"]) == decoded:
            return item
    return None


def real_researcher_summary() -> dict[str, Any]:
    summary_rows = real_researcher_indicators().get("summary", [])
    by_label = {str(row.get("indicator", "")).lower(): row.get("value") for row in summary_rows}
    researchers = real_researchers()
    links = real_researcher_publication_links()
    unique_publications = len({link["publication_id"] for link in links})
    with_orcid = sum(1 for item in researchers if _is_valid_orcid(item.get("orcid")))
    normalized_profiles = sum(1 for item in researchers if item.get("primary_affiliation_normalized") and item.get("primary_affiliation_normalized") != "Filiación no disponible")
    pending_review = sum(1 for item in researchers if item.get("requires_manual_review"))
    return {
        "total_investigadores": len(researchers),
        "total_vinculos": _num(by_label.get("total vínculos investigador-publicación"), len(links)),
        "publicaciones_unicas": _num(by_label.get("publicaciones únicas con investigador institucional"), unique_publications),
        "investigadores_con_orcid": with_orcid,
        "investigadores_sin_orcid": len(researchers) - with_orcid,
        "investigadores_con_q1": _num(by_label.get("investigadores con publicaciones q1"), sum(1 for item in researchers if item.get("n_q1", 0) > 0)),
        "produccion_reciente": _num(by_label.get("investigadores con produccion reciente"), sum(1 for item in researchers if item.get("last_publication_year", 0) >= 2023)),
        "open_access_vinculadas": _num(by_label.get("publicaciones open access vinculadas a investigadores"), len({link["publication_id"] for link in links if link.get("open_access")})),
        "perfiles_con_filiacion_normalizada": normalized_profiles,
        "perfiles_pendientes_revision": pending_review,
        "investigadores_con_avatar_iniciales": sum(1 for item in researchers if item.get("avatar_initials")),
        "investigadores_con_photo_url": sum(1 for item in researchers if item.get("photo_url")),
    }


def real_researcher_analytics() -> dict[str, Any]:
    indicators = real_researcher_indicators()
    return {
        "top_researchers": indicators.get("top_researchers", real_researchers()[:10]),
        "by_year": indicators.get("by_year", []),
        "by_quartile": indicators.get("by_quartile", []),
        "by_thematic_area": indicators.get("by_thematic_area", []),
    }


def real_researcher_filters() -> dict[str, Any]:
    researchers = real_researchers()
    return {
        "orcid": ["Con ORCID", "Sin ORCID"],
        "thematic_area": sorted({area for item in researchers for area in item.get("thematic_areas", [])})[:100],
        "institution": sorted({item["primary_institution"] for item in researchers if item.get("primary_institution") and item.get("primary_institution") != "No disponible"})[:100],
        "unit": sorted({item["primary_unit"] for item in researchers if item.get("primary_unit") and item.get("primary_unit") != "No disponible"})[:100],
        "network": sorted({item["primary_network"] for item in researchers if item.get("primary_network") and item.get("primary_network") != "No disponible"})[:100],
        "country": sorted({item["country"] for item in researchers if item.get("country") and item.get("country") != "No disponible"})[:50],
        "review_status": sorted({item["profile_review_status"] for item in researchers if item.get("profile_review_status")})[:20],
        "quartile": ["Q1", "Q2", "Q3", "Q4", "Sin cuartil"],
        "first_year": sorted({item["first_publication_year"] for item in researchers if item.get("first_publication_year")}),
        "last_year": sorted({item["last_publication_year"] for item in researchers if item.get("last_publication_year")}, reverse=True),
    }


def real_researcher_publications(item_id: str, page: int, page_size: int) -> dict[str, Any]:
    researcher = get_real_researcher(item_id)
    if not researcher:
        return {"items": [], "total": 0, "page": page, "page_size": page_size, "pages": 0}
    links = [link for link in real_researcher_publication_links() if link["researcher_id"] == researcher["researcher_id"]]
    links = sorted(links, key=lambda item: item.get("year") or 0, reverse=True)
    total = len(links)
    start = (max(page, 1) - 1) * page_size
    return {"items": links[start:start + page_size], "total": total, "page": page, "page_size": page_size, "pages": math.ceil(total / page_size) if total else 0}


def _read_csv(path: Path) -> list[dict[str, str]]:
    csv.field_size_limit(sys.maxsize)
    with path.open(encoding="utf-8-sig", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        delimiter = _detect_delimiter(sample)
        reader = csv.reader(handle, delimiter=delimiter)
        rows = list(reader)
    if not rows:
        return []
    raw_headers = [header.strip().lstrip("\ufeff") for header in rows[0]]
    last_named_header = max((index for index, header in enumerate(raw_headers) if header), default=-1)
    headers = raw_headers[:last_named_header + 1] if last_named_header >= 0 else raw_headers
    return [
        dict(zip(headers, _normalize_csv_values(headers, values, delimiter), strict=False))
        for values in rows[1:]
        if any(value.strip() for value in values)
    ]


def _detect_delimiter(sample: str) -> str:
    first_line = next((line for line in sample.splitlines() if line.strip()), "")
    return max([";", ",", "\t"], key=lambda delimiter: first_line.count(delimiter))


def _normalize_csv_values(headers: list[str], values: list[str], delimiter: str) -> list[str]:
    if delimiter != "," or "deduplication_method" not in headers:
        return values
    try:
        main_journals_index = headers.index("main_journals")
    except ValueError:
        return values
    source_index = next((index for index, value in enumerate(values[main_journals_index + 1:], start=main_journals_index + 1) if _clean(value).endswith(".json")), -1)
    if source_index < 0:
        return values
    tail = ",".join(values[main_journals_index:source_index])
    fields = [field.strip() for field in re.sub(r"(\(\d+(?:\.\d+)?\)),(?=\S)", r"\1<<<FIELD>>>", tail).split("<<<FIELD>>>")]
    if len(fields) < 6:
        return values
    return [
        *values[:main_journals_index],
        fields[0],
        fields[1],
        fields[2],
        fields[3],
        fields[4],
        ",".join(fields[5:]),
        values[source_index],
        values[source_index + 1] if source_index + 1 < len(values) else "",
        values[source_index + 2] if source_index + 2 < len(values) else "",
    ]


def _read_optional_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    return _read_csv(path)


def _index_by_researcher_id(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    return {_clean(row.get("researcher_id")): row for row in rows if _clean(row.get("researcher_id"))}


def _map_researcher(row: dict[str, Any], numeric_id: int, links: list[dict[str, Any]], profile_row: dict[str, Any] | None = None, affiliation_row: dict[str, Any] | None = None, photo_row: dict[str, Any] | None = None) -> dict[str, Any]:
    areas = _split(row.get("main_thematic_areas"))
    profile = _build_profile(row, profile_row, affiliation_row, photo_row)
    return {
        "id": numeric_id,
        "researcher_id": _clean(row.get("researcher_id")),
        "full_name": profile["display_name"],
        "orcid": profile["orcid"],
        "renacyt_code": None,
        "scopus_author_id": None,
        "specialty": areas[0] if areas else "Sin area tematica",
        "academic_degree": None,
        "affiliation": profile["primary_affiliation_normalized"],
        "biography": None,
        "photo_url": profile["photo_url"],
        "avatar_initials": profile["avatar_initials"],
        "primary_affiliation_normalized": profile["primary_affiliation_normalized"],
        "primary_institution": profile["primary_institution"],
        "primary_unit": profile["primary_unit"],
        "primary_network": profile["primary_network"],
        "country": profile["country"],
        "email": profile["email"],
        "profile_review_status": profile["profile_review_status"],
        "requires_manual_review": profile["requires_manual_review"],
        "profile": profile,
        "h_index": _num(row.get("h_index_observatory"), 0),
        "citation_count": _num(row.get("total_citations"), 0),
        "international_collaboration": len(_split(row.get("top_coauthors"))) >= 5,
        "n_publications": _num(row.get("n_publications"), len(links)),
        "first_publication_year": _num(row.get("first_publication_year"), None),
        "last_publication_year": _num(row.get("last_publication_year"), None),
        "active_years": _num(row.get("active_years"), 0),
        "median_citations": _float(row.get("median_citations"), 0),
        "mean_citations": _float(row.get("mean_citations"), 0),
        "h_index_observatory": _num(row.get("h_index_observatory"), 0),
        "n_q1": _num(row.get("n_q1"), 0),
        "n_q2": _num(row.get("n_q2"), 0),
        "n_q3": _num(row.get("n_q3"), 0),
        "n_q4": _num(row.get("n_q4"), 0),
        "n_without_quartile": _num(row.get("n_without_quartile"), 0),
        "n_open_access": _num(row.get("n_open_access"), 0),
        "n_with_doi": _num(row.get("n_with_doi"), 0),
        "thematic_areas": areas,
        "main_journals": _split(row.get("main_journals")),
        "top_coauthors": _split(row.get("top_coauthors")),
        "updated_at": _optional(row.get("updated_at")),
        "publications": [{"id": link["publication_id"], "name": link["publication_title"]} for link in links[:50]],
        "projects": [],
        "research_units": [{"id": 1, "name": profile["primary_affiliation_normalized"]}] if profile["primary_affiliation_normalized"] != "Filiación no disponible" else [],
        "clinical_trials": [],
        "keywords": [{"id": i + 1, "term": area} for i, area in enumerate(areas[:10])],
    }


def _build_profile(row: dict[str, Any], profile_row: dict[str, Any] | None, affiliation_row: dict[str, Any] | None, photo_row: dict[str, Any] | None) -> dict[str, Any]:
    raw_affiliations = _split(row.get("affiliations"))
    primary_affiliation_normalized = (
        _optional((profile_row or {}).get("primary_affiliation_normalized"))
        or _optional((affiliation_row or {}).get("primary_affiliation_normalized"))
        or "Filiación no disponible"
    )
    primary_institution = _optional((profile_row or {}).get("primary_institution")) or _optional((affiliation_row or {}).get("primary_institution")) or "No disponible"
    primary_unit = _optional((profile_row or {}).get("primary_unit")) or _optional((affiliation_row or {}).get("primary_unit")) or primary_institution
    primary_network = _optional((profile_row or {}).get("primary_network")) or _optional((affiliation_row or {}).get("primary_network")) or "No disponible"
    country = _optional((profile_row or {}).get("country")) or _optional((affiliation_row or {}).get("primary_country")) or "Perú"
    display_name = _display((profile_row or {}).get("display_name") or row.get("researcher_name"), "Investigador sin nombre")
    avatar_initials = (
        _optional((photo_row or {}).get("avatar_initials"))
        or _optional((profile_row or {}).get("avatar_initials"))
        or _initials(display_name)
    )
    review_status = _optional((profile_row or {}).get("profile_review_status")) or ("requires_manual_review" if _bool((affiliation_row or {}).get("requires_manual_review")) else "auto_curated")
    return {
        "display_name": display_name,
        "orcid": _optional((profile_row or {}).get("orcid")) or _optional((affiliation_row or {}).get("orcid")) or _optional((photo_row or {}).get("orcid")) or _optional(row.get("orcid")),
        "photo_url": _optional((photo_row or {}).get("photo_url")) or _optional((profile_row or {}).get("photo_url")),
        "avatar_initials": avatar_initials,
        "primary_affiliation": _optional((profile_row or {}).get("primary_affiliation")) or _optional((affiliation_row or {}).get("primary_affiliation")) or (raw_affiliations[0] if raw_affiliations else "Filiación no disponible"),
        "primary_affiliation_normalized": primary_affiliation_normalized,
        "primary_institution": primary_institution,
        "primary_unit": primary_unit,
        "primary_network": primary_network,
        "country": country,
        "email": _optional((profile_row or {}).get("email")) or "No disponible",
        "profile_source": _optional((profile_row or {}).get("profile_source")),
        "profile_updated_at": _optional((profile_row or {}).get("profile_updated_at")) or _optional((affiliation_row or {}).get("updated_at")) or _optional(row.get("updated_at")),
        "profile_review_status": review_status,
        "requires_manual_review": review_status == "requires_manual_review" or _bool((affiliation_row or {}).get("requires_manual_review")),
        "affiliation_selection_method": _optional((affiliation_row or {}).get("affiliation_selection_method")),
        "affiliation_confidence": _float((affiliation_row or {}).get("affiliation_confidence"), 0),
        "photo_source": _optional((photo_row or {}).get("photo_source")),
        "photo_authorization_status": _optional((photo_row or {}).get("photo_authorization_status")),
        "photo_updated_at": _optional((photo_row or {}).get("photo_updated_at")),
    }


def _map_link(row: dict[str, str]) -> dict[str, Any]:
    return {
        "researcher_id": _clean(row.get("researcher_id")),
        "researcher_name": _display(row.get("researcher_name"), "Investigador sin nombre"),
        "orcid": _optional(row.get("orcid")),
        "publication_id": _clean(row.get("publication_id")),
        "publication_title": _display(row.get("publication_title"), "Titulo no disponible"),
        "year": _num(row.get("year"), None),
        "journal_title": _display(row.get("journal_title"), "Revista no disponible"),
        "journal_quartile": _quartile(row.get("journal_quartile")),
        "citation_count": _num(row.get("citation_count"), 0),
        "open_access": str(row.get("open_access", "")).lower() == "true",
        "thematic_category": _display(row.get("thematic_category"), "Sin categoria tematica"),
        "thematic_area": _display(row.get("thematic_area"), "Sin area tematica"),
        "thematic_subtheme": _display(row.get("thematic_subtheme"), "Sin subtema"),
        "study_type": _display(row.get("study_type"), "Sin tipo de estudio"),
        "doi": _optional(row.get("doi")),
        "author_position": _num(row.get("author_position"), None),
        "is_institutional_researcher": str(row.get("is_institutional_researcher", "")).lower() == "true",
        "n_authors_publication": _num(row.get("n_authors_publication"), None),
    }


def _split(value: Any) -> list[str]:
    if _missing(value):
        return []
    return [item.strip().rsplit(" (", 1)[0] for item in str(value).split("|") if not _missing(item.strip()) and item.strip() != ","]


def _missing(value: Any) -> bool:
    return value is None or str(value).strip().lower() in MISSING


def _clean(value: Any) -> str:
    return "" if _missing(value) else str(value).strip()


def _optional(value: Any) -> str | None:
    cleaned = _clean(value)
    return cleaned or None


def _display(value: Any, fallback: str) -> str:
    return _clean(value) or fallback


def _bool(value: Any) -> bool:
    return str(value).strip().lower() in {"true", "1", "si", "sí", "yes"}


def _initials(name: str) -> str | None:
    parts = [part for part in name.strip().split() if part]
    if not parts:
        return None
    return "".join(part[0].upper() for part in parts[:2])


def _is_valid_orcid(value: Any) -> bool:
    cleaned = _clean(value)
    parts = cleaned.split("-")
    if len(parts) != 4 or [len(part) for part in parts] != [4, 4, 4, 4]:
        return False
    return all(part.isdigit() for part in parts[:3]) and parts[3][:3].isdigit() and parts[3][3].upper() in "0123456789X"


def _num(value: Any, fallback: int | None = 0) -> int | None:
    if _missing(value):
        return fallback
    try:
        return int(float(str(value).replace(",", ".")))
    except ValueError:
        return fallback


def _float(value: Any, fallback: float = 0) -> float:
    if _missing(value):
        return fallback
    try:
        return float(str(value).replace(",", "."))
    except ValueError:
        return fallback


def _quartile(value: Any) -> str:
    cleaned = _clean(value).upper()
    return cleaned if cleaned in {"Q1", "Q2", "Q3", "Q4"} else "Sin cuartil"
