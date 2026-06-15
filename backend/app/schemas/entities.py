from pydantic import BaseModel, ConfigDict


class PublicationBase(BaseModel):
    title: str
    authors: list[str]
    affiliation: str
    orcid: str | None = None
    year: int
    journal: str
    quartile: str
    doi: str | None = None
    pmid: str | None = None
    impact_factor: float | None = None
    study_type: str
    thematic_area: str
    funding: str | None = None
    open_access: bool
    citations: int
    altmetrics: int
    keywords: list[str]


class Publication(PublicationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    code: str
    title: str
    principal_investigator: str
    co_investigators: list[str]
    unit: str
    status: str
    thematic_line: str
    funding_source: str
    amount: float
    start_date: str
    end_date: str
    ethics_committee: str
    expected_outputs: list[str]
    sdgs: list[str]
    results: str
    pipeline_stage: str


class Project(ProjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ResearcherBase(BaseModel):
    name: str
    orcid: str | None = None
    renacyt: str | None = None
    specialty: str
    academic_degrees: list[str]
    affiliation: str
    research_lines: list[str]
    keywords: list[str]
    methodologies: list[str]
    scientific_output: int
    publications: int
    citations: int
    h_index: int
    international_collaboration: bool
    project_leadership: int
    collaboration_network: dict


class Researcher(ResearcherBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ResearchUnitBase(BaseModel):
    name: str
    unit_type: str
    care_network: str
    region: str
    status: str
    description: str
    research_lines: list[str]
    linked_researchers: int
    publications: int
    projects: int
    clinical_trials: int
    infrastructure: list[str]
    productivity: float
    collaborations: list[str]
    internal_ranking: int


class ResearchUnit(ResearchUnitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class Kpi(BaseModel):
    label: str
    value: str
    trend: str


class HomeSummary(BaseModel):
    kpis: list[Kpi]
    trends: list[dict]
    news: list[dict]
    map_regions: list[dict]


class GlobalSearchResult(BaseModel):
    type: str
    id: int
    title: str
    subtitle: str
