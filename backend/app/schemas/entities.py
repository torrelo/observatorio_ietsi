from datetime import date, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class ListParams(BaseModel):
    q: str | None = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "id"
    sort_order: str = "asc"


class SimpleRef(BaseModel):
    id: int
    name: str


class Journal(BaseModel):
    id: int
    name: str
    issn: str | None = None
    publisher: str | None = None
    subject_area: str | None = None
    quartile: str | None = None
    impact_factor: float | None = None
    model_config = ConfigDict(from_attributes=True)


class FundingSource(BaseModel):
    id: int
    name: str
    funding_type: str
    country: str
    website: str | None = None
    model_config = ConfigDict(from_attributes=True)


class Keyword(BaseModel):
    id: int
    term: str
    vocabulary: str | None = None
    model_config = ConfigDict(from_attributes=True)


class Institution(BaseModel):
    id: int
    name: str
    institution_type: str
    country: str
    region: str | None = None
    ror_id: str | None = None
    model_config = ConfigDict(from_attributes=True)


class Publication(BaseModel):
    id: int
    title: str
    abstract: str | None = None
    year: int
    publication_type: str
    journal_id: int | None = None
    journal: Journal | None = None
    doi: str | None = None
    pmid: str | None = None
    quartile: str | None = None
    impact_factor: float | None = None
    study_type: str | None = None
    thematic_area: str | None = None
    funding_source: int | None = None
    funding: FundingSource | None = None
    open_access: bool
    citation_count: int
    altmetric_score: float
    authors: list[SimpleRef] = Field(default_factory=list)
    keywords: list[Keyword] = Field(default_factory=list)
    projects: list[SimpleRef] = Field(default_factory=list)
    research_units: list[SimpleRef] = Field(default_factory=list)
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class Researcher(BaseModel):
    id: int
    full_name: str
    orcid: str | None = None
    renacyt_code: str | None = None
    scopus_author_id: str | None = None
    specialty: str | None = None
    academic_degree: str | None = None
    affiliation: str | None = None
    biography: str | None = None
    photo_url: str | None = None
    h_index: int
    citation_count: int
    international_collaboration: bool
    publications: list[SimpleRef] = Field(default_factory=list)
    projects: list[SimpleRef] = Field(default_factory=list)
    research_units: list[SimpleRef] = Field(default_factory=list)
    clinical_trials: list[SimpleRef] = Field(default_factory=list)
    keywords: list[Keyword] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class Project(BaseModel):
    id: int
    project_code: str
    title: str
    summary: str | None = None
    project_type: str
    status: str
    thematic_line: str
    funding_type: str | None = None
    budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    ethics_status: str | None = None
    expected_outputs: list[str]
    sdg: list[str]
    results_summary: str | None = None
    principal_investigator: SimpleRef | None = None
    coinvestigators: list[SimpleRef] = Field(default_factory=list)
    publications: list[SimpleRef] = Field(default_factory=list)
    research_unit: SimpleRef | None = None
    funding: FundingSource | None = None
    model_config = ConfigDict(from_attributes=True)


class ResearchUnit(BaseModel):
    id: int
    name: str
    unit_type: str
    network: str
    region: str
    province: str | None = None
    district: str | None = None
    description: str | None = None
    infrastructure: list[str]
    latitude: float | None = None
    longitude: float | None = None
    institution: Institution | None = None
    researchers: list[SimpleRef] = Field(default_factory=list)
    projects: list[SimpleRef] = Field(default_factory=list)
    publications: list[SimpleRef] = Field(default_factory=list)
    clinical_trials: list[SimpleRef] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class ClinicalTrial(BaseModel):
    id: int
    registry_code: str
    title: str
    phase: str | None = None
    status: str
    sponsor: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    researchers: list[SimpleRef] = Field(default_factory=list)
    research_units: list[SimpleRef] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class SearchResult(BaseModel):
    entity: str
    id: int
    title: str
    subtitle: str | None = None
    url: str


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResult]
    engine: str = "postgres-compatible"


class Kpi(BaseModel):
    label: str
    value: str
    trend: str


class HomeSummary(BaseModel):
    kpis: list[Kpi]
    trends: list[dict]
    news: list[dict]
    map_regions: list[dict]
