from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, Numeric, String, Table, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


publication_authors = Table(
    "publication_authors",
    Base.metadata,
    Column("publication_id", ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True),
    Column("researcher_id", ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
)

publication_keywords = Table(
    "publication_keywords",
    Base.metadata,
    Column("publication_id", ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True),
    Column("keyword_id", ForeignKey("keywords.id", ondelete="CASCADE"), primary_key=True),
)

publication_projects = Table(
    "publication_projects",
    Base.metadata,
    Column("publication_id", ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True),
    Column("project_id", ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
)

publication_research_units = Table(
    "publication_research_units",
    Base.metadata,
    Column("publication_id", ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True),
    Column("research_unit_id", ForeignKey("research_units.id", ondelete="CASCADE"), primary_key=True),
)

researcher_keywords = Table(
    "researcher_keywords",
    Base.metadata,
    Column("researcher_id", ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
    Column("keyword_id", ForeignKey("keywords.id", ondelete="CASCADE"), primary_key=True),
)

researcher_research_units = Table(
    "researcher_research_units",
    Base.metadata,
    Column("researcher_id", ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
    Column("research_unit_id", ForeignKey("research_units.id", ondelete="CASCADE"), primary_key=True),
)

project_coinvestigators = Table(
    "project_coinvestigators",
    Base.metadata,
    Column("project_id", ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("researcher_id", ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
)

clinical_trial_researchers = Table(
    "clinical_trial_researchers",
    Base.metadata,
    Column("clinical_trial_id", ForeignKey("clinical_trials.id", ondelete="CASCADE"), primary_key=True),
    Column("researcher_id", ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
)

clinical_trial_research_units = Table(
    "clinical_trial_research_units",
    Base.metadata,
    Column("clinical_trial_id", ForeignKey("clinical_trials.id", ondelete="CASCADE"), primary_key=True),
    Column("research_unit_id", ForeignKey("research_units.id", ondelete="CASCADE"), primary_key=True),
)

network_units = Table(
    "network_units",
    Base.metadata,
    Column("network_id", ForeignKey("research_networks.id", ondelete="CASCADE"), primary_key=True),
    Column("research_unit_id", ForeignKey("research_units.id", ondelete="CASCADE"), primary_key=True),
)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Institution(Base, TimestampMixin):
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(250), unique=True, index=True)
    institution_type: Mapped[str] = mapped_column(String(80), index=True)
    country: Mapped[str] = mapped_column(String(100), default="Peru")
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ror_id: Mapped[str | None] = mapped_column(String(80), nullable=True)

    research_units: Mapped[list["ResearchUnit"]] = relationship(back_populates="institution")


class Journal(Base, TimestampMixin):
    __tablename__ = "journals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(250), unique=True, index=True)
    issn: Mapped[str | None] = mapped_column(String(32), nullable=True)
    publisher: Mapped[str | None] = mapped_column(String(180), nullable=True)
    subject_area: Mapped[str | None] = mapped_column(String(160), nullable=True)
    quartile: Mapped[str | None] = mapped_column(String(8), nullable=True)
    impact_factor: Mapped[float | None] = mapped_column(Float, nullable=True)

    publications: Mapped[list["Publication"]] = relationship(back_populates="journal")


class FundingSource(Base, TimestampMixin):
    __tablename__ = "funding_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    funding_type: Mapped[str] = mapped_column(String(100), index=True)
    country: Mapped[str] = mapped_column(String(100), default="Peru")
    website: Mapped[str | None] = mapped_column(String(300), nullable=True)

    publications: Mapped[list["Publication"]] = relationship(back_populates="funding")
    projects: Mapped[list["Project"]] = relationship(back_populates="funding")


class Keyword(Base, TimestampMixin):
    __tablename__ = "keywords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    term: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    vocabulary: Mapped[str | None] = mapped_column(String(80), nullable=True)

    publications: Mapped[list["Publication"]] = relationship(secondary=publication_keywords, back_populates="keywords")
    researchers: Mapped[list["Researcher"]] = relationship(secondary=researcher_keywords, back_populates="keywords")


class ResearchNetwork(Base, TimestampMixin):
    __tablename__ = "research_networks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    network_type: Mapped[str] = mapped_column(String(100), index=True)
    scope: Mapped[str] = mapped_column(String(100), default="Nacional")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    units: Mapped[list["ResearchUnit"]] = relationship(secondary=network_units, back_populates="research_networks")


class Dataset(Base, TimestampMixin):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300), index=True)
    description: Mapped[str] = mapped_column(Text)
    access_level: Mapped[str] = mapped_column(String(80), default="Restringido", index=True)
    license: Mapped[str | None] = mapped_column(String(120), nullable=True)
    repository_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)

    project: Mapped["Project | None"] = relationship(back_populates="datasets")


class Publication(Base, TimestampMixin):
    __tablename__ = "publications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(600), index=True)
    abstract: Mapped[str | None] = mapped_column(Text, nullable=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    publication_type: Mapped[str] = mapped_column(String(100), index=True)
    journal_id: Mapped[int | None] = mapped_column(ForeignKey("journals.id"), nullable=True, index=True)
    doi: Mapped[str | None] = mapped_column(String(150), unique=True, nullable=True, index=True)
    pmid: Mapped[str | None] = mapped_column(String(60), unique=True, nullable=True, index=True)
    quartile: Mapped[str | None] = mapped_column(String(8), nullable=True, index=True)
    impact_factor: Mapped[float | None] = mapped_column(Float, nullable=True)
    study_type: Mapped[str | None] = mapped_column(String(140), nullable=True, index=True)
    thematic_area: Mapped[str | None] = mapped_column(String(180), nullable=True, index=True)
    funding_source: Mapped[int | None] = mapped_column(ForeignKey("funding_sources.id"), nullable=True, index=True)
    open_access: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)
    altmetric_score: Mapped[float] = mapped_column(Float, default=0)
    source: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    external_identifiers: Mapped[dict] = mapped_column(JSONB, default=dict)

    journal: Mapped["Journal | None"] = relationship(back_populates="publications")
    funding: Mapped["FundingSource | None"] = relationship(back_populates="publications")
    authors: Mapped[list["Researcher"]] = relationship(secondary=publication_authors, back_populates="publications")
    keywords: Mapped[list["Keyword"]] = relationship(secondary=publication_keywords, back_populates="publications")
    projects: Mapped[list["Project"]] = relationship(secondary=publication_projects, back_populates="publications")
    research_units: Mapped[list["ResearchUnit"]] = relationship(secondary=publication_research_units, back_populates="publications")


class Researcher(Base, TimestampMixin):
    __tablename__ = "researchers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(220), index=True)
    orcid: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True, index=True)
    renacyt_code: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    scopus_author_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    specialty: Mapped[str | None] = mapped_column(String(160), nullable=True, index=True)
    academic_degree: Mapped[str | None] = mapped_column(String(180), nullable=True)
    affiliation: Mapped[str | None] = mapped_column(String(250), nullable=True, index=True)
    biography: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    h_index: Mapped[int] = mapped_column(Integer, default=0)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)
    international_collaboration: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    publications: Mapped[list["Publication"]] = relationship(secondary=publication_authors, back_populates="authors")
    projects: Mapped[list["Project"]] = relationship(secondary=project_coinvestigators, back_populates="coinvestigators")
    principal_projects: Mapped[list["Project"]] = relationship(back_populates="principal_investigator")
    research_units: Mapped[list["ResearchUnit"]] = relationship(secondary=researcher_research_units, back_populates="researchers")
    clinical_trials: Mapped[list["ClinicalTrial"]] = relationship(secondary=clinical_trial_researchers, back_populates="researchers")
    keywords: Mapped[list["Keyword"]] = relationship(secondary=researcher_keywords, back_populates="researchers")


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_code: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(600), index=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    project_type: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[str] = mapped_column(String(100), index=True)
    thematic_line: Mapped[str] = mapped_column(String(180), index=True)
    funding_type: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    budget: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    ethics_status: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    expected_outputs: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    sdg: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    results_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    principal_investigator_id: Mapped[int | None] = mapped_column(ForeignKey("researchers.id"), nullable=True, index=True)
    research_unit_id: Mapped[int | None] = mapped_column(ForeignKey("research_units.id"), nullable=True, index=True)
    funding_source_id: Mapped[int | None] = mapped_column(ForeignKey("funding_sources.id"), nullable=True, index=True)

    principal_investigator: Mapped["Researcher | None"] = relationship(back_populates="principal_projects")
    coinvestigators: Mapped[list["Researcher"]] = relationship(secondary=project_coinvestigators, back_populates="projects")
    publications: Mapped[list["Publication"]] = relationship(secondary=publication_projects, back_populates="projects")
    research_unit: Mapped["ResearchUnit | None"] = relationship(back_populates="projects")
    funding: Mapped["FundingSource | None"] = relationship(back_populates="projects")
    datasets: Mapped[list["Dataset"]] = relationship(back_populates="project")


class ResearchUnit(Base, TimestampMixin):
    __tablename__ = "research_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(260), index=True)
    unit_type: Mapped[str] = mapped_column(String(120), index=True)
    network: Mapped[str] = mapped_column(String(180), index=True)
    region: Mapped[str] = mapped_column(String(120), index=True)
    province: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    infrastructure: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    institution_id: Mapped[int | None] = mapped_column(ForeignKey("institutions.id"), nullable=True, index=True)

    institution: Mapped["Institution | None"] = relationship(back_populates="research_units")
    researchers: Mapped[list["Researcher"]] = relationship(secondary=researcher_research_units, back_populates="research_units")
    projects: Mapped[list["Project"]] = relationship(back_populates="research_unit")
    publications: Mapped[list["Publication"]] = relationship(secondary=publication_research_units, back_populates="research_units")
    clinical_trials: Mapped[list["ClinicalTrial"]] = relationship(secondary=clinical_trial_research_units, back_populates="research_units")
    research_networks: Mapped[list["ResearchNetwork"]] = relationship(secondary=network_units, back_populates="units")


class ClinicalTrial(Base, TimestampMixin):
    __tablename__ = "clinical_trials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    registry_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(600), index=True)
    phase: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(100), index=True)
    sponsor: Mapped[str | None] = mapped_column(String(220), nullable=True, index=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    researchers: Mapped[list["Researcher"]] = relationship(secondary=clinical_trial_researchers, back_populates="clinical_trials")
    research_units: Mapped[list["ResearchUnit"]] = relationship(secondary=clinical_trial_research_units, back_populates="clinical_trials")
