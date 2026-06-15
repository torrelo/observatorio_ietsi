from fastapi import APIRouter, HTTPException, Query

from app.schemas.entities import GlobalSearchResult, HomeSummary, Project, Publication, ResearchUnit, Researcher
from app.services.seed_data import HOME_SUMMARY, PROJECTS, PUBLICATIONS, RESEARCHERS, UNITS, filter_items

router = APIRouter()


@router.get("/home/summary", response_model=HomeSummary)
def get_home_summary():
    return HOME_SUMMARY


@router.get("/publications", response_model=list[Publication])
def list_publications(q: str | None = None, year: int | None = None, quartile: str | None = None):
    items = filter_items(PUBLICATIONS, q, ["title", "authors", "affiliation", "thematic_area", "keywords"])
    if year:
        items = [item for item in items if item.year == year]
    if quartile:
        items = [item for item in items if item.quartile.lower() == quartile.lower()]
    return items


@router.get("/publications/{item_id}", response_model=Publication)
def get_publication(item_id: int):
    return _find_or_404(PUBLICATIONS, item_id, "Publicacion")


@router.get("/projects", response_model=list[Project])
def list_projects(q: str | None = None, status: str | None = None, thematic_line: str | None = None):
    items = filter_items(PROJECTS, q, ["code", "title", "principal_investigator", "unit", "thematic_line"])
    if status:
        items = [item for item in items if item.status.lower() == status.lower()]
    if thematic_line:
        items = [item for item in items if thematic_line.lower() in item.thematic_line.lower()]
    return items


@router.get("/projects/{item_id}", response_model=Project)
def get_project(item_id: int):
    return _find_or_404(PROJECTS, item_id, "Proyecto")


@router.get("/researchers", response_model=list[Researcher])
def list_researchers(q: str | None = None, specialty: str | None = None, renacyt: str | None = None):
    items = filter_items(RESEARCHERS, q, ["name", "specialty", "affiliation", "research_lines", "keywords"])
    if specialty:
        items = [item for item in items if specialty.lower() in item.specialty.lower()]
    if renacyt:
        items = [item for item in items if item.renacyt and renacyt.lower() in item.renacyt.lower()]
    return items


@router.get("/researchers/{item_id}", response_model=Researcher)
def get_researcher(item_id: int):
    return _find_or_404(RESEARCHERS, item_id, "Investigador")


@router.get("/units", response_model=list[ResearchUnit])
def list_units(q: str | None = None, region: str | None = None, unit_type: str | None = None):
    items = filter_items(UNITS, q, ["name", "care_network", "region", "research_lines"])
    if region:
        items = [item for item in items if item.region.lower() == region.lower()]
    if unit_type:
        items = [item for item in items if unit_type.lower() in item.unit_type.lower()]
    return items


@router.get("/units/{item_id}", response_model=ResearchUnit)
def get_unit(item_id: int):
    return _find_or_404(UNITS, item_id, "Unidad")


@router.get("/search/global", response_model=list[GlobalSearchResult])
def global_search(q: str = Query(..., min_length=2)):
    results: list[GlobalSearchResult] = []
    for publication in filter_items(PUBLICATIONS, q, ["title", "authors", "keywords", "thematic_area"]):
        results.append(GlobalSearchResult(type="publication", id=publication.id, title=publication.title, subtitle=publication.journal))
    for project in filter_items(PROJECTS, q, ["title", "principal_investigator", "unit", "thematic_line"]):
        results.append(GlobalSearchResult(type="project", id=project.id, title=project.title, subtitle=project.status))
    for researcher in filter_items(RESEARCHERS, q, ["name", "specialty", "affiliation", "keywords"]):
        results.append(GlobalSearchResult(type="researcher", id=researcher.id, title=researcher.name, subtitle=researcher.specialty))
    for unit in filter_items(UNITS, q, ["name", "region", "care_network", "research_lines"]):
        results.append(GlobalSearchResult(type="unit", id=unit.id, title=unit.name, subtitle=unit.region))
    return results


def _find_or_404(items: list, item_id: int, label: str):
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail=f"{label} no encontrada")
