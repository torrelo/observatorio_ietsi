from datetime import date, datetime
from math import ceil
from typing import Any

from app.schemas.entities import Page


NAMES = [
    "Mariana Torres Salcedo",
    "Jorge Salazar Rivas",
    "Rosa Medina Alvarez",
    "Luis Quispe Ramos",
    "Ana Valdivia Paredes",
    "Carlos Huaman Soto",
    "Patricia Rojas Velarde",
    "Elena Bustamante Leon",
    "Victor Chang Mori",
    "Natalia Flores Cardenas",
    "Diego Fernandez Luna",
    "Maria Paredes Aguilar",
    "Cecilia Vargas Ochoa",
    "Fernando Tello Caceres",
    "Gabriela Inga Rivera",
    "Renato Salas Mendez",
    "Lucia Carrion Vega",
    "Miguel Arce Palacios",
    "Fiorella Nuñez Rios",
    "Hugo Castillo Benites",
]

SPECIALTIES = [
    "Endocrinologia",
    "Infectologia",
    "Cardiologia",
    "Oncologia",
    "Epidemiologia",
    "Gestion de servicios de salud",
    "Nefrologia",
    "Pediatria",
    "Salud digital",
    "Medicina intensiva",
]

NETWORKS = [
    ("Red Prestacional Rebagliati", "Lima", "Lima", "Jesus Maria"),
    ("Red Prestacional Almenara", "Lima", "Lima", "La Victoria"),
    ("Red Prestacional Sabogal", "Callao", "Callao", "Bellavista"),
    ("Red Asistencial Arequipa", "Arequipa", "Arequipa", "Arequipa"),
    ("Red Asistencial La Libertad", "La Libertad", "Trujillo", "Trujillo"),
    ("Red Asistencial Cusco", "Cusco", "Cusco", "Wanchaq"),
    ("Red Asistencial Piura", "Piura", "Piura", "Piura"),
    ("Red Asistencial Lambayeque", "Lambayeque", "Chiclayo", "Chiclayo"),
]

HOSPITALS = [
    "Hospital Nacional Edgardo Rebagliati Martins",
    "Hospital Nacional Guillermo Almenara Irigoyen",
    "Hospital Nacional Alberto Sabogal Sologuren",
    "Hospital Nacional Carlos Alberto Seguín Escobedo",
    "Hospital Victor Lazarte Echegaray",
    "Hospital Nacional Adolfo Guevara Velasco",
    "Hospital III Jose Cayetano Heredia",
    "Hospital Almanzor Aguinaga Asenjo",
]

THEMATIC_AREAS = [
    "Enfermedades cronicas",
    "Enfermedades infecciosas",
    "Salud digital",
    "Oncologia",
    "Gestion sanitaria",
    "Salud materno infantil",
    "Seguridad del paciente",
    "Medicina personalizada",
]

KEYWORD_TERMS = [
    "diabetes",
    "hipertension",
    "telemedicina",
    "resistencia antimicrobiana",
    "oncologia",
    "cohorte",
    "ensayo clinico",
    "salud digital",
    "gestion sanitaria",
    "biobanco",
    "farmacovigilancia",
    "calidad asistencial",
]

JOURNALS = [
    "Revista Peruana de Medicina Experimental y Salud Publica",
    "BMJ Open",
    "Lancet Regional Health - Americas",
    "PLOS ONE",
    "BMC Health Services Research",
    "International Journal of Infectious Diseases",
    "Frontiers in Public Health",
    "Journal of Clinical Epidemiology",
]

FUNDERS = [
    ("IETSI - Fondo concursable institucional", "Institucional"),
    ("PROCIENCIA", "Publico competitivo"),
    ("CONCYTEC", "Publico competitivo"),
    ("OPS", "Cooperacion internacional"),
    ("Recursos ordinarios EsSalud", "Institucional"),
]


def _simple_ref(item: dict[str, Any], name_field: str = "name") -> dict[str, Any]:
    return {"id": item["id"], "name": item[name_field]}


KEYWORDS = [{"id": i + 1, "term": term, "vocabulary": "MeSH/CRIS"} for i, term in enumerate(KEYWORD_TERMS)]

FUNDING_SOURCES = [
    {"id": i + 1, "name": name, "funding_type": funding_type, "country": "Peru", "website": None}
    for i, (name, funding_type) in enumerate(FUNDERS)
]

JOURNAL_RECORDS = [
    {
        "id": i + 1,
        "name": name,
        "issn": f"20{i + 10:02}-1{i + 33:03}",
        "publisher": ["INS", "BMJ", "Elsevier", "PLOS", "Springer"][i % 5],
        "subject_area": THEMATIC_AREAS[i % len(THEMATIC_AREAS)],
        "quartile": f"Q{(i % 4) + 1}",
        "impact_factor": round(1.8 + (i % 6) * 0.9, 1),
    }
    for i, name in enumerate(JOURNALS)
]

INSTITUTIONS = [
    {
        "id": i + 1,
        "name": hospital,
        "institution_type": "Hospital EsSalud",
        "country": "Peru",
        "region": NETWORKS[i % len(NETWORKS)][1],
        "ror_id": None,
    }
    for i, hospital in enumerate(HOSPITALS)
]

UNITS = [
    {
        "id": i + 1,
        "name": f"{['Unidad', 'Centro', 'Nodo'][i % 3]} de Investigacion {THEMATIC_AREAS[i % len(THEMATIC_AREAS)]} {NETWORKS[i % len(NETWORKS)][1]}",
        "unit_type": ["Unidad hospitalaria", "Centro especializado", "Nodo regional"][i % 3],
        "network": NETWORKS[i % len(NETWORKS)][0],
        "region": NETWORKS[i % len(NETWORKS)][1],
        "province": NETWORKS[i % len(NETWORKS)][2],
        "district": NETWORKS[i % len(NETWORKS)][3],
        "description": f"Unidad orientada a investigacion aplicada en {THEMATIC_AREAS[i % len(THEMATIC_AREAS)].lower()} dentro de EsSalud.",
        "infrastructure": ["Comite tecnico", "Data mart clinico", "Sala de investigacion", "Repositorio documental"][: 2 + (i % 3)],
        "latitude": round(-12.04 + i * 0.43, 5),
        "longitude": round(-77.03 + i * 0.21, 5),
        "institution": INSTITUTIONS[i % len(INSTITUTIONS)],
        "researchers": [],
        "projects": [],
        "publications": [],
        "clinical_trials": [],
    }
    for i in range(15)
]

RESEARCHERS = [
    {
        "id": i + 1,
        "full_name": f"{['Dra.', 'Dr.', 'Mg.', 'Lic.'][i % 4]} {NAMES[i % len(NAMES)]} {i + 1}",
        "orcid": f"0000-000{(i % 9) + 1}-{1000 + i:04d}-{2000 + i:04d}",
        "renacyt_code": f"RENACYT-{['II', 'III', 'IV', 'V'][i % 4]}-{1000 + i}",
        "scopus_author_id": f"SCOPUS-{700000 + i}",
        "specialty": SPECIALTIES[i % len(SPECIALTIES)],
        "academic_degree": ["Doctorado", "Maestria", "Especialidad medica", "Licenciatura"][i % 4],
        "affiliation": HOSPITALS[i % len(HOSPITALS)],
        "biography": f"Investigador de EsSalud con experiencia en {SPECIALTIES[i % len(SPECIALTIES)].lower()} y estudios multicentricos.",
        "photo_url": None,
        "h_index": 4 + (i % 22),
        "citation_count": 80 + i * 37,
        "international_collaboration": i % 3 == 0,
        "publications": [],
        "projects": [],
        "research_units": [_simple_ref(UNITS[i % len(UNITS)])],
        "clinical_trials": [],
        "keywords": [KEYWORDS[i % len(KEYWORDS)], KEYWORDS[(i + 3) % len(KEYWORDS)]],
    }
    for i in range(50)
]

PROJECTS = [
    {
        "id": i + 1,
        "project_code": f"ESS-IETSI-202{4 + (i % 3)}-{i + 1:03d}",
        "title": f"Proyecto multicentrico sobre {THEMATIC_AREAS[i % len(THEMATIC_AREAS)].lower()} en asegurados de EsSalud",
        "summary": f"Estudio institucional para generar evidencia aplicada en {THEMATIC_AREAS[i % len(THEMATIC_AREAS)].lower()}.",
        "project_type": ["Clinico", "Implementacion", "Servicios de salud", "Innovacion tecnologica"][i % 4],
        "status": ["Formulacion", "Aprobacion etica", "En ejecucion", "Analisis", "Publicado"][i % 5],
        "thematic_line": THEMATIC_AREAS[i % len(THEMATIC_AREAS)],
        "funding_type": FUNDING_SOURCES[i % len(FUNDING_SOURCES)]["funding_type"],
        "budget": float(120000 + i * 18500),
        "start_date": date(2024 + (i % 3), (i % 12) + 1, 1),
        "end_date": date(2025 + (i % 3), (i % 12) + 1, 28),
        "ethics_status": ["No aplica", "En revision", "Aprobado", "Observado"][i % 4],
        "expected_outputs": ["Articulo indexado", "Informe tecnico", "Dataset institucional"],
        "sdg": ["ODS 3", "ODS 9"] if i % 2 == 0 else ["ODS 3"],
        "results_summary": "Resultados preliminares disponibles para gestion institucional." if i % 5 in (3, 4) else None,
        "principal_investigator": _simple_ref(RESEARCHERS[i % len(RESEARCHERS)], "full_name"),
        "coinvestigators": [
            _simple_ref(RESEARCHERS[(i + 1) % len(RESEARCHERS)], "full_name"),
            _simple_ref(RESEARCHERS[(i + 2) % len(RESEARCHERS)], "full_name"),
        ],
        "publications": [],
        "research_unit": _simple_ref(UNITS[i % len(UNITS)]),
        "funding": FUNDING_SOURCES[i % len(FUNDING_SOURCES)],
    }
    for i in range(30)
]

PUBLICATIONS = [
    {
        "id": i + 1,
        "title": f"{['Factores asociados a', 'Efectividad de', 'Perfil epidemiologico de', 'Modelo predictivo para'][i % 4]} {THEMATIC_AREAS[i % len(THEMATIC_AREAS)].lower()} en poblacion asegurada de EsSalud",
        "abstract": f"Estudio realizado en redes asistenciales de EsSalud para evaluar resultados en {THEMATIC_AREAS[i % len(THEMATIC_AREAS)].lower()}.",
        "year": 2020 + (i % 7),
        "publication_type": ["Articulo original", "Revision sistematica", "Reporte breve", "Carta cientifica"][i % 4],
        "journal_id": JOURNAL_RECORDS[i % len(JOURNAL_RECORDS)]["id"],
        "journal": JOURNAL_RECORDS[i % len(JOURNAL_RECORDS)],
        "doi": f"10.5588/essalud.obs.{2020 + (i % 7)}.{i + 1:04d}",
        "pmid": str(38000000 + i) if i % 3 != 0 else None,
        "quartile": f"Q{(i % 4) + 1}",
        "impact_factor": round(1.6 + (i % 9) * 0.55, 2),
        "study_type": ["Cohorte retrospectiva", "Ensayo pragmatico", "Transversal analitico", "Vigilancia multicentrica"][i % 4],
        "thematic_area": THEMATIC_AREAS[i % len(THEMATIC_AREAS)],
        "funding_source": FUNDING_SOURCES[i % len(FUNDING_SOURCES)]["id"],
        "funding": FUNDING_SOURCES[i % len(FUNDING_SOURCES)],
        "open_access": i % 2 == 0,
        "citation_count": 3 + i * 2,
        "altmetric_score": round(5 + i * 0.8, 1),
        "authors": [
            _simple_ref(RESEARCHERS[i % len(RESEARCHERS)], "full_name"),
            _simple_ref(RESEARCHERS[(i + 7) % len(RESEARCHERS)], "full_name"),
            _simple_ref(RESEARCHERS[(i + 13) % len(RESEARCHERS)], "full_name"),
        ],
        "keywords": [KEYWORDS[i % len(KEYWORDS)], KEYWORDS[(i + 2) % len(KEYWORDS)]],
        "projects": [_simple_ref(PROJECTS[i % len(PROJECTS)], "title")],
        "research_units": [_simple_ref(UNITS[i % len(UNITS)])],
        "created_at": datetime(2026, 1, 1),
        "updated_at": datetime(2026, 6, 1),
    }
    for i in range(100)
]

CLINICAL_TRIALS = [
    {
        "id": i + 1,
        "registry_code": f"PER-ESSALUD-CT-{2024 + i % 3}-{i + 1:03d}",
        "title": f"Ensayo clinico fase {['II', 'III', 'IV'][i % 3]} en {THEMATIC_AREAS[i % len(THEMATIC_AREAS)].lower()}",
        "phase": ["II", "III", "IV"][i % 3],
        "status": ["Reclutando", "Activo", "Completado", "Suspendido"][i % 4],
        "sponsor": ["EsSalud", "IETSI", "Cooperacion OPS", "Industria farmaceutica"][i % 4],
        "start_date": date(2024 + i % 3, (i % 12) + 1, 15),
        "end_date": date(2025 + i % 3, (i % 12) + 1, 15),
        "researchers": [_simple_ref(RESEARCHERS[i % len(RESEARCHERS)], "full_name")],
        "research_units": [_simple_ref(UNITS[i % len(UNITS)])],
    }
    for i in range(10)
]


def get_item(items: list[dict[str, Any]], item_id: int) -> dict[str, Any] | None:
    return next((item for item in items if item["id"] == item_id), None)


for publication in PUBLICATIONS:
    publication_ref = _simple_ref(publication, "title")
    for author in publication["authors"]:
        researcher = get_item(RESEARCHERS, author["id"])
        if researcher is not None:
            researcher["publications"].append(publication_ref)
    for project_ref in publication["projects"]:
        project = get_item(PROJECTS, project_ref["id"])
        if project is not None:
            project["publications"].append(publication_ref)
    for unit_ref in publication["research_units"]:
        unit = get_item(UNITS, unit_ref["id"])
        if unit is not None:
            unit["publications"].append(publication_ref)

for project in PROJECTS:
    project_ref = _simple_ref(project, "title")
    principal = get_item(RESEARCHERS, project["principal_investigator"]["id"])
    if principal is not None:
        principal["projects"].append(project_ref)
    for coinvestigator in project["coinvestigators"]:
        researcher = get_item(RESEARCHERS, coinvestigator["id"])
        if researcher is not None:
            researcher["projects"].append(project_ref)
    unit = get_item(UNITS, project["research_unit"]["id"])
    if unit is not None:
        unit["projects"].append(project_ref)

for trial in CLINICAL_TRIALS:
    trial_ref = _simple_ref(trial, "title")
    for researcher_ref in trial["researchers"]:
        researcher = get_item(RESEARCHERS, researcher_ref["id"])
        if researcher is not None:
            researcher["clinical_trials"].append(trial_ref)
    for unit_ref in trial["research_units"]:
        unit = get_item(UNITS, unit_ref["id"])
        if unit is not None:
            unit["clinical_trials"].append(trial_ref)

DATASETS = [
    {
        "id": i + 1,
        "title": f"Dataset institucional {THEMATIC_AREAS[i % len(THEMATIC_AREAS)]}",
        "description": "Conjunto de datos anonimizado para investigacion y gestion institucional.",
        "access_level": ["Abierto", "Restringido", "Embargado"][i % 3],
        "license": "CC BY 4.0" if i % 3 == 0 else None,
        "repository_url": None,
        "project_id": PROJECTS[i % len(PROJECTS)]["id"],
    }
    for i in range(12)
]

HOME_SUMMARY = {
    "kpis": [
        {"label": "Publicaciones indexadas", "value": "12,458", "trend": "+18% anual"},
        {"label": "Proyectos activos", "value": "684", "trend": "+42 nuevos"},
        {"label": "Investigadores registrados", "value": "2,145", "trend": "312 RENACYT"},
        {"label": "Unidades de investigacion", "value": "58", "trend": "18 regiones"},
        {"label": "Ensayos clinicos", "value": "36", "trend": "10 activos"},
        {"label": "Financiamiento captado", "value": "S/ 48.2M", "trend": "+24%"},
    ],
    "trends": [
        {"label": "Salud digital", "value": 82},
        {"label": "Enfermedades cronicas", "value": 76},
        {"label": "IAAS y antimicrobianos", "value": 68},
    ],
    "news": [],
    "map_regions": [],
}


def paginate(items: list[dict[str, Any]], page: int, page_size: int) -> Page:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    total = len(items)
    start = (page - 1) * page_size
    return Page(items=items[start : start + page_size], total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


def filter_sort_paginate(
    items: list[dict[str, Any]],
    q: str | None,
    fields: list[str],
    page: int,
    page_size: int,
    sort_by: str,
    sort_order: str,
    filters: dict[str, Any] | None = None,
) -> Page:
    filtered = items
    if q:
        needle = q.lower()
        filtered = [item for item in filtered if needle in _search_blob(item, fields)]
    for key, value in (filters or {}).items():
        if value is None:
            continue
        filtered = [item for item in filtered if str(item.get(key, "")).lower() == str(value).lower()]
    reverse = sort_order.lower() == "desc"
    if filtered and sort_by in filtered[0]:
        filtered = sorted(filtered, key=lambda item: item.get(sort_by) or "", reverse=reverse)
    return paginate(filtered, page, page_size)


def search_all(q: str, limit: int = 20) -> list[dict[str, Any]]:
    needle = q.lower()
    results = []
    for item in PUBLICATIONS:
        if needle in _search_blob(item, ["title", "abstract", "thematic_area", "keywords"]):
            results.append({"entity": "publication", "id": item["id"], "title": item["title"], "subtitle": item["journal"]["name"], "url": f"/publications/{item['id']}"})
    for item in RESEARCHERS:
        if needle in _search_blob(item, ["full_name", "specialty", "affiliation", "keywords"]):
            results.append({"entity": "researcher", "id": item["id"], "title": item["full_name"], "subtitle": item["specialty"], "url": f"/researchers/{item['id']}"})
    for item in PROJECTS:
        if needle in _search_blob(item, ["title", "summary", "thematic_line", "project_code"]):
            results.append({"entity": "project", "id": item["id"], "title": item["title"], "subtitle": item["status"], "url": f"/projects/{item['id']}"})
    for item in UNITS:
        if needle in _search_blob(item, ["name", "network", "region", "description"]):
            results.append({"entity": "unit", "id": item["id"], "title": item["name"], "subtitle": item["region"], "url": f"/units/{item['id']}"})
    return results[:limit]


def _search_blob(item: dict[str, Any], fields: list[str]) -> str:
    values = []
    for field in fields:
        value = item.get(field)
        if isinstance(value, list):
            values.extend(str(part) for part in value)
        elif isinstance(value, dict):
            values.extend(str(part) for part in value.values())
        elif value is not None:
            values.append(str(value))
    return " ".join(values).lower()
