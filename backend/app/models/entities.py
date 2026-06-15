from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Publication(Base):
    __tablename__ = "publications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), index=True)
    authors: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    affiliation: Mapped[str] = mapped_column(String(300))
    orcid: Mapped[str | None] = mapped_column(String(32), nullable=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    journal: Mapped[str] = mapped_column(String(250))
    quartile: Mapped[str] = mapped_column(String(8))
    doi: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pmid: Mapped[str | None] = mapped_column(String(40), nullable=True)
    impact_factor: Mapped[float | None] = mapped_column(Float, nullable=True)
    study_type: Mapped[str] = mapped_column(String(120))
    thematic_area: Mapped[str] = mapped_column(String(160), index=True)
    funding: Mapped[str | None] = mapped_column(String(200), nullable=True)
    open_access: Mapped[bool] = mapped_column(Boolean, default=False)
    citations: Mapped[int] = mapped_column(Integer, default=0)
    altmetrics: Mapped[int] = mapped_column(Integer, default=0)
    keywords: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(500), index=True)
    principal_investigator: Mapped[str] = mapped_column(String(180))
    co_investigators: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    unit: Mapped[str] = mapped_column(String(220), index=True)
    status: Mapped[str] = mapped_column(String(80), index=True)
    thematic_line: Mapped[str] = mapped_column(String(160), index=True)
    funding_source: Mapped[str] = mapped_column(String(160))
    amount: Mapped[float] = mapped_column(Float, default=0)
    start_date: Mapped[str] = mapped_column(String(20))
    end_date: Mapped[str] = mapped_column(String(20))
    ethics_committee: Mapped[str] = mapped_column(String(220))
    expected_outputs: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    sdgs: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    results: Mapped[str] = mapped_column(Text)
    pipeline_stage: Mapped[str] = mapped_column(String(80))


class Researcher(Base):
    __tablename__ = "researchers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    orcid: Mapped[str | None] = mapped_column(String(32), nullable=True)
    renacyt: Mapped[str | None] = mapped_column(String(60), nullable=True)
    specialty: Mapped[str] = mapped_column(String(140), index=True)
    academic_degrees: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    affiliation: Mapped[str] = mapped_column(String(220), index=True)
    research_lines: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    keywords: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    methodologies: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    scientific_output: Mapped[int] = mapped_column(Integer, default=0)
    publications: Mapped[int] = mapped_column(Integer, default=0)
    citations: Mapped[int] = mapped_column(Integer, default=0)
    h_index: Mapped[int] = mapped_column(Integer, default=0)
    international_collaboration: Mapped[bool] = mapped_column(Boolean, default=False)
    project_leadership: Mapped[int] = mapped_column(Integer, default=0)
    collaboration_network: Mapped[dict] = mapped_column(JSONB, default=dict)


class ResearchUnit(Base):
    __tablename__ = "research_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(220), index=True)
    unit_type: Mapped[str] = mapped_column(String(120), index=True)
    care_network: Mapped[str] = mapped_column(String(180), index=True)
    region: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[str] = mapped_column(String(80), index=True)
    description: Mapped[str] = mapped_column(Text)
    research_lines: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    linked_researchers: Mapped[int] = mapped_column(Integer, default=0)
    publications: Mapped[int] = mapped_column(Integer, default=0)
    projects: Mapped[int] = mapped_column(Integer, default=0)
    clinical_trials: Mapped[int] = mapped_column(Integer, default=0)
    infrastructure: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    productivity: Mapped[float] = mapped_column(Float, default=0)
    collaborations: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    internal_ranking: Mapped[int] = mapped_column(Integer)
