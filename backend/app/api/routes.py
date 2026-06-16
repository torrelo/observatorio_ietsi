from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query

from app.schemas.entities import ClinicalTrial, HomeSummary, Page, Project, Publication, ResearchUnit, Researcher, SearchResponse, SearchResult
from app.services.seed_data import CLINICAL_TRIALS, HOME_SUMMARY, PROJECTS, PUBLICATIONS, RESEARCHERS, UNITS, filter_sort_paginate, get_item, search_all

router = APIRouter()

PageParam = Annotated[int, Query(ge=1)]
PageSizeParam = Annotated[int, Query(ge=1, le=100)]
SortOrderParam = Annotated[str, Query(pattern="^(asc|desc)$")]


@router.get("/home/summary", response_model=HomeSummary, tags=["Home"])
def get_home_summary():
    return HOME_SUMMARY


@router.get("/publications", response_model=Page[Publication], tags=["Publications"])
def list_publications(
    q: str | None = None,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "year",
    sort_order: SortOrderParam = "desc",
    year: int | None = None,
    quartile: str | None = None,
    publication_type: str | None = None,
    thematic_area: str | None = None,
    open_access: bool | None = None,
):
    return filter_sort_paginate(
        PUBLICATIONS,
        q,
        ["title", "abstract", "thematic_area", "study_type", "doi", "pmid", "keywords"],
        page,
        page_size,
        sort_by,
        sort_order,
        {"year": year, "quartile": quartile, "publication_type": publication_type, "thematic_area": thematic_area, "open_access": open_access},
    )


@router.get("/publications/{item_id}", response_model=Publication, tags=["Publications"])
def get_publication(item_id: int):
    return _find_or_404(PUBLICATIONS, item_id, "Publicacion")


@router.get("/researchers", response_model=Page[Researcher], tags=["Researchers"])
def list_researchers(
    q: str | None = None,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "full_name",
    sort_order: SortOrderParam = "asc",
    specialty: str | None = None,
    academic_degree: str | None = None,
    international_collaboration: bool | None = None,
):
    return filter_sort_paginate(
        RESEARCHERS,
        q,
        ["full_name", "specialty", "affiliation", "renacyt_code", "orcid", "keywords"],
        page,
        page_size,
        sort_by,
        sort_order,
        {"specialty": specialty, "academic_degree": academic_degree, "international_collaboration": international_collaboration},
    )


@router.get("/researchers/{item_id}", response_model=Researcher, tags=["Researchers"])
def get_researcher(item_id: int):
    return _find_or_404(RESEARCHERS, item_id, "Investigador")


@router.get("/projects", response_model=Page[Project], tags=["Projects"])
def list_projects(
    q: str | None = None,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "start_date",
    sort_order: SortOrderParam = "desc",
    status: str | None = None,
    project_type: str | None = None,
    thematic_line: str | None = None,
    ethics_status: str | None = None,
):
    return filter_sort_paginate(
        PROJECTS,
        q,
        ["project_code", "title", "summary", "thematic_line", "status"],
        page,
        page_size,
        sort_by,
        sort_order,
        {"status": status, "project_type": project_type, "thematic_line": thematic_line, "ethics_status": ethics_status},
    )


@router.get("/projects/{item_id}", response_model=Project, tags=["Projects"])
def get_project(item_id: int):
    return _find_or_404(PROJECTS, item_id, "Proyecto")


@router.get("/units", response_model=Page[ResearchUnit], tags=["Research Units"])
def list_units(
    q: str | None = None,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "name",
    sort_order: SortOrderParam = "asc",
    unit_type: str | None = None,
    network: str | None = None,
    region: str | None = None,
):
    return filter_sort_paginate(
        UNITS,
        q,
        ["name", "description", "network", "region", "province", "district"],
        page,
        page_size,
        sort_by,
        sort_order,
        {"unit_type": unit_type, "network": network, "region": region},
    )


@router.get("/units/{item_id}", response_model=ResearchUnit, tags=["Research Units"])
def get_unit(item_id: int):
    return _find_or_404(UNITS, item_id, "Unidad")


@router.get("/clinical-trials", response_model=Page[ClinicalTrial], tags=["Clinical Trials"])
def list_clinical_trials(
    q: str | None = None,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "start_date",
    sort_order: SortOrderParam = "desc",
    phase: str | None = None,
    status: str | None = None,
    sponsor: str | None = None,
):
    return filter_sort_paginate(
        CLINICAL_TRIALS,
        q,
        ["registry_code", "title", "phase", "status", "sponsor"],
        page,
        page_size,
        sort_by,
        sort_order,
        {"phase": phase, "status": status, "sponsor": sponsor},
    )


@router.get("/clinical-trials/{item_id}", response_model=ClinicalTrial, tags=["Clinical Trials"])
def get_clinical_trial(item_id: int):
    return _find_or_404(CLINICAL_TRIALS, item_id, "Ensayo clinico")


@router.get("/search", response_model=SearchResponse, tags=["Search"])
def global_search(q: str = Query(..., min_length=2), limit: Annotated[int, Query(ge=1, le=100)] = 20):
    results = [SearchResult(**item) for item in search_all(q, limit)]
    return SearchResponse(query=q, total=len(results), results=results)


@router.get("/search/global", response_model=list[SearchResult], tags=["Search"])
def legacy_global_search(q: str = Query(..., min_length=2), limit: Annotated[int, Query(ge=1, le=100)] = 20):
    return [SearchResult(**item) for item in search_all(q, limit)]


def _find_or_404(items: list[dict[str, Any]], item_id: int, label: str):
    item = get_item(items, item_id)
    if item:
        return item
    raise HTTPException(status_code=404, detail=f"{label} no encontrada")
