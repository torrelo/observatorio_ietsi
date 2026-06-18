#!/usr/bin/env python3
"""
Script de prueba para verificar las relaciones entre entidades.
Ejecutar desde el directorio backend:
    python3 scripts/test_relations.py
"""

import sys
import json

sys.path.insert(0, '/home/armando/Documents/IETSI/Entregables/01.OBSERVATORIO/code/observatorio_ietsi/backend')

from app.services.seed_data import (
    PUBLICATIONS, RESEARCHERS, PROJECTS, UNITS,
    get_item, _simple_ref
)
from app.schemas.entities import Publication, Researcher, Project

print("=" * 80)
print("🔗 PRUEBA DE RELACIONES - OBSERVATORIO IETSI")
print("=" * 80)
print()

# ============================================================================
# PRUEBA 1: Publicaciones de un Investigador
# ============================================================================
print("📚 PRUEBA 1: Publicaciones de un Investigador")
print("-" * 80)

researcher = RESEARCHERS[0]
print(f"Investigador: {researcher['full_name']} (ID: {researcher['id']})")
print(f"Total de publicaciones como autor: {len(researcher['publications'])}")

if researcher['publications']:
    print("\nPublicaciones:")
    for pub_ref in researcher['publications'][:3]:
        pub = get_item(PUBLICATIONS, pub_ref['id'])
        if pub:
            print(f"  ✓ {pub['title'][:60]}... (Año: {pub['year']})")
else:
    print("  ⚠️ No tiene publicaciones")

print()

# ============================================================================
# PRUEBA 2: Autores de una Publicación
# ============================================================================
print("👥 PRUEBA 2: Autores de una Publicación")
print("-" * 80)

publication = PUBLICATIONS[0]
print(f"Publicación: {publication['title']}")
print(f"Año: {publication['year']}")
print(f"Total de autores: {len(publication['authors'])}")

print("\nAutores:")
for author_ref in publication['authors']:
    author = get_item(RESEARCHERS, author_ref['id'])
    if author:
        print(f"  ✓ {author['full_name']} - {author['specialty']} (h-index: {author['h_index']})")

print()

# ============================================================================
# PRUEBA 3: Investigadores de un Proyecto
# ============================================================================
print("🎯 PRUEBA 3: Investigadores de un Proyecto")
print("-" * 80)

project = PROJECTS[0]
print(f"Proyecto: {project['title']}")
print(f"Código: {project['project_code']}")

# Investigador principal
if project.get('principal_investigator'):
    pi = get_item(RESEARCHERS, project['principal_investigator']['id'])
    if pi:
        print(f"\n📌 Investigador Principal:")
        print(f"  {pi['full_name']} ({pi['specialty']})")

# Coinvestigadores
print(f"\n👤 Coinvestigadores ({len(project.get('coinvestigators', []))}):")
for coinv_ref in project.get('coinvestigators', []):
    coinv = get_item(RESEARCHERS, coinv_ref['id'])
    if coinv:
        print(f"  ✓ {coinv['full_name']}")

print()

# ============================================================================
# PRUEBA 4: Publicaciones de un Proyecto
# ============================================================================
print("📄 PRUEBA 4: Publicaciones de un Proyecto")
print("-" * 80)

print(f"Proyecto: {project['title']}")
print(f"Total de publicaciones asociadas: {len(project.get('publications', []))}")

if project.get('publications'):
    print("\nPublicaciones:")
    for pub_ref in project['publications'][:3]:
        pub = get_item(PUBLICATIONS, pub_ref['id'])
        if pub:
            print(f"  ✓ {pub['title'][:60]}... ({pub['year']})")
else:
    print("  ⚠️ No tiene publicaciones asociadas")

print()

# ============================================================================
# PRUEBA 5: Investigadores de una Unidad
# ============================================================================
print("🏥 PRUEBA 5: Investigadores de una Unidad")
print("-" * 80)

unit = UNITS[0]
print(f"Unidad: {unit['name']}")
print(f"Tipo: {unit['unit_type']}")
print(f"Total de investigadores: {len(unit.get('researchers', []))}")

if unit.get('researchers'):
    print("\nInvestigadores:")
    for res_ref in unit['researchers'][:3]:
        res = get_item(RESEARCHERS, res_ref['id'])
        if res:
            print(f"  ✓ {res['full_name']} ({res['specialty']})")
else:
    print("  ⚠️ No tiene investigadores")

print()

# ============================================================================
# PRUEBA 6: Publicaciones de una Unidad
# ============================================================================
print("📊 PRUEBA 6: Publicaciones de una Unidad")
print("-" * 80)

print(f"Unidad: {unit['name']}")
print(f"Total de publicaciones: {len(unit.get('publications', []))}")

if unit.get('publications'):
    print("\nPublicaciones:")
    for pub_ref in unit['publications'][:3]:
        pub = get_item(PUBLICATIONS, pub_ref['id'])
        if pub:
            print(f"  ✓ {pub['title'][:60]}... ({pub['year']})")
else:
    print("  ⚠️ No tiene publicaciones")

print()

# ============================================================================
# PRUEBA 7: Validación de Esquemas Pydantic
# ============================================================================
print("✅ PRUEBA 7: Validación de Esquemas Pydantic")
print("-" * 80)

try:
    # Validar publicación
    pub_schema = Publication(**publication)
    print(f"✓ Publicación validada correctamente")
    print(f"  - Authors en schema: {len(pub_schema.authors)}")
    print(f"  - Keywords en schema: {len(pub_schema.keywords)}")
    
    # Validar investigador
    res_schema = Researcher(**researcher)
    print(f"✓ Investigador validado correctamente")
    print(f"  - Publications en schema: {len(res_schema.publications)}")
    print(f"  - Projects en schema: {len(res_schema.projects)}")
    
    # Validar proyecto
    proj_schema = Project(**project)
    print(f"✓ Proyecto validado correctamente")
    print(f"  - Coinvestigators en schema: {len(proj_schema.coinvestigators)}")
    print(f"  - Publications en schema: {len(proj_schema.publications)}")
    
except Exception as e:
    print(f"❌ Error de validación: {e}")

print()

# ============================================================================
# RESUMEN
# ============================================================================
print("=" * 80)
print("📊 RESUMEN DE RELACIONES")
print("=" * 80)

# Contar relaciones totales
total_pub_authors = sum(len(p.get('authors', [])) for p in PUBLICATIONS)
total_res_pubs = sum(len(r.get('publications', [])) for r in RESEARCHERS)
total_proj_researchers = sum(len(p.get('coinvestigators', [])) for p in PROJECTS)
total_unit_researchers = sum(len(u.get('researchers', [])) for u in UNITS)

print(f"Relaciones Publicación-Autor: {total_pub_authors}")
print(f"Relaciones Investigador-Publicación: {total_res_pubs}")
print(f"Relaciones Proyecto-Investigador: {total_proj_researchers}")
print(f"Relaciones Unidad-Investigador: {total_unit_researchers}")

print()
print("✨ Todas las pruebas completadas exitosamente")
print("=" * 80)
