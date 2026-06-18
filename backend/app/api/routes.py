from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query

from app.schemas.entities import ClinicalTrial, HomeSummary, Page, Project, Publication, ResearchUnit, Researcher, SearchResponse, SearchResult
from app.services.seed_data import (
    CLINICAL_TRIALS,
    HOME_SUMMARY,
    PROJECTS,
    PUBLICATIONS,
    RESEARCHERS,
    UNITS,
    filter_sort_paginate,
    get_item,
    publication_analytics,
    publication_summary,
    search_all,
)

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
    limit: Annotated[int | None, Query(ge=1, le=100)] = None,
    sort_by: str = "year",
    sort_order: SortOrderParam = "desc",
    sort: str | None = None,
    year: int | None = None,
    quartile: str | None = None,
    publication_type: str | None = None,
    author: str | None = None,
    unit: str | None = None,
    network: str | None = None,
    thematic_area: str | None = None,
    journal: str | None = None,
    open_access: bool | None = None,
    study_type: str | None = None,
    source: str | None = None,
    funding: str | None = None,
):
    if limit is not None:
        page_size = limit
    if sort:
        sort_by = sort.removeprefix("-")
        sort_order = "desc" if sort.startswith("-") else "asc"
    return filter_sort_paginate(
        PUBLICATIONS,
        q,
        ["title", "abstract", "thematic_area", "study_type", "doi", "pmid", "keywords", "authors", "journal"],
        page,
        page_size,
        sort_by,
        sort_order,
        {
            "year": year,
            "quartile": quartile,
            "publication_type": publication_type,
            "author": author,
            "unit": unit,
            "network": network,
            "thematic_area": thematic_area,
            "journal": journal,
            "open_access": open_access,
            "study_type": study_type,
            "source": source,
            "funding": funding,
        },
    )


@router.get("/publications/summary", tags=["Publications"])
def get_publications_summary():
    return publication_summary()


@router.get("/publications/analytics", tags=["Publications"])
def get_publications_analytics():
    return publication_analytics()


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


@router.get("/researchers/{item_id}/publications", response_model=Page[Publication], tags=["Researchers"])
def get_researcher_publications(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "year",
    sort_order: SortOrderParam = "desc",
):
    """Obtener todas las publicaciones de un investigador específico"""
    researcher = _find_or_404(RESEARCHERS, item_id, "Investigador")
    publication_ids = [pub["id"] for pub in researcher.get("publications", [])]
    publications = [pub for pub in PUBLICATIONS if pub["id"] in publication_ids]
    
    # Ordenar
    if sort_by == "year":
        publications = sorted(publications, key=lambda x: x.get("year", 0), reverse=(sort_order == "desc"))
    elif sort_by == "citation_count":
        publications = sorted(publications, key=lambda x: x.get("citation_count", 0), reverse=(sort_order == "desc"))
    
    # Paginar
    from math import ceil
    total = len(publications)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = publications[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


@router.get("/researchers/{item_id}/projects", response_model=Page[Project], tags=["Researchers"])
def get_researcher_projects(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "start_date",
    sort_order: SortOrderParam = "desc",
):
    """Obtener todos los proyectos de un investigador (como investigador principal o coinvestigador)"""
    researcher = _find_or_404(RESEARCHERS, item_id, "Investigador")
    project_ids = [proj["id"] for proj in researcher.get("projects", [])]
    projects = [proj for proj in PROJECTS if proj["id"] in project_ids]
    
    # Ordenar
    if sort_by == "start_date":
        projects = sorted(projects, key=lambda x: x.get("start_date"), reverse=(sort_order == "desc"))
    elif sort_by == "status":
        projects = sorted(projects, key=lambda x: x.get("status", ""))
    
    # Paginar
    from math import ceil
    total = len(projects)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = projects[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


@router.get("/publications/{item_id}/authors", response_model=Page[Researcher], tags=["Publications"])
def get_publication_authors(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "full_name",
    sort_order: SortOrderParam = "asc",
):
    """Obtener todos los autores de una publicación específica con sus detalles"""
    publication = _find_or_404(PUBLICATIONS, item_id, "Publicacion")
    author_ids = [author["id"] for author in publication.get("authors", [])]
    authors = [auth for auth in RESEARCHERS if auth["id"] in author_ids]
    
    # Ordenar
    if sort_by == "full_name":
        authors = sorted(authors, key=lambda x: x.get("full_name", ""), reverse=(sort_order == "desc"))
    elif sort_by == "h_index":
        authors = sorted(authors, key=lambda x: x.get("h_index", 0), reverse=(sort_order == "desc"))
    
    # Paginar
    from math import ceil
    total = len(authors)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = authors[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


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


@router.get("/projects/{item_id}/researchers", response_model=Page[Researcher], tags=["Projects"])
def get_project_researchers(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "full_name",
    sort_order: SortOrderParam = "asc",
):
    """Obtener todos los investigadores de un proyecto (principal y coinvestigadores)"""
    project = _find_or_404(PROJECTS, item_id, "Proyecto")
    
    researcher_ids = set()
    
    # Agregar investigador principal
    if "principal_investigator" in project and project["principal_investigator"]:
        researcher_ids.add(project["principal_investigator"]["id"])
    
    # Agregar coinvestigadores
    for coinv in project.get("coinvestigators", []):
        researcher_ids.add(coinv["id"])
    
    researchers = [res for res in RESEARCHERS if res["id"] in researcher_ids]
    
    # Ordenar
    if sort_by == "full_name":
        researchers = sorted(researchers, key=lambda x: x.get("full_name", ""), reverse=(sort_order == "desc"))
    elif sort_by == "h_index":
        researchers = sorted(researchers, key=lambda x: x.get("h_index", 0), reverse=(sort_order == "desc"))
    
    # Paginar
    from math import ceil
    total = len(researchers)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = researchers[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


@router.get("/projects/{item_id}/publications", response_model=Page[Publication], tags=["Projects"])
def get_project_publications(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "year",
    sort_order: SortOrderParam = "desc",
):
    """Obtener todas las publicaciones asociadas a un proyecto"""
    project = _find_or_404(PROJECTS, item_id, "Proyecto")
    pub_ids = [pub["id"] for pub in project.get("publications", [])]
    publications = [pub for pub in PUBLICATIONS if pub["id"] in pub_ids]
    
    # Ordenar
    if sort_by == "year":
        publications = sorted(publications, key=lambda x: x.get("year", 0), reverse=(sort_order == "desc"))
    elif sort_by == "citation_count":
        publications = sorted(publications, key=lambda x: x.get("citation_count", 0), reverse=(sort_order == "desc"))
    
    # Paginar
    from math import ceil
    total = len(publications)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = publications[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


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


@router.get("/units/{item_id}/researchers", response_model=Page[Researcher], tags=["Research Units"])
def get_unit_researchers(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "full_name",
    sort_order: SortOrderParam = "asc",
):
    """Obtener todos los investigadores de una unidad de investigación"""
    unit = _find_or_404(UNITS, item_id, "Unidad")
    researcher_ids = [res["id"] for res in unit.get("researchers", [])]
    researchers = [res for res in RESEARCHERS if res["id"] in researcher_ids]
    
    # Ordenar
    if sort_by == "full_name":
        researchers = sorted(researchers, key=lambda x: x.get("full_name", ""), reverse=(sort_order == "desc"))
    elif sort_by == "h_index":
        researchers = sorted(researchers, key=lambda x: x.get("h_index", 0), reverse=(sort_order == "desc"))
    
    # Paginar
    from math import ceil
    total = len(researchers)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = researchers[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


@router.get("/units/{item_id}/publications", response_model=Page[Publication], tags=["Research Units"])
def get_unit_publications(
    item_id: int,
    page: PageParam = 1,
    page_size: PageSizeParam = 20,
    sort_by: str = "year",
    sort_order: SortOrderParam = "desc",
):
    """Obtener todas las publicaciones de una unidad de investigación"""
    unit = _find_or_404(UNITS, item_id, "Unidad")
    pub_ids = [pub["id"] for pub in unit.get("publications", [])]
    publications = [pub for pub in PUBLICATIONS if pub["id"] in pub_ids]
    
    # Ordenar
    if sort_by == "year":
        publications = sorted(publications, key=lambda x: x.get("year", 0), reverse=(sort_order == "desc"))
    elif sort_by == "citation_count":
        publications = sorted(publications, key=lambda x: x.get("citation_count", 0), reverse=(sort_order == "desc"))
    
    # Paginar
    from math import ceil
    total = len(publications)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    items = publications[start : start + page_size]
    
    return Page(items=items, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


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
