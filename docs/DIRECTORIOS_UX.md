# Patrón Compartido de Directorios

Fecha: 2026-11-14. Rama: `feat/directorios-ux`. Sin commit, despliegue, cambios de dependencias ni backend. Se preserva el trabajo previo de `feat/produccion-cientifica-ux`.

## Diagnóstico Verificable

- Next.js 15.1.3, React/React DOM 19.0.0, TypeScript y Tailwind existentes; npm/lockfile conservados. No se encontraron instrucciones AGENTS.md dentro del repositorio.
- Las tres páginas usaban `.directory-layout`: a 1440 px CSS, columnas de 256 / 785 / 272 px. `body` computado: 16 px. La estrechez procede de la distribución, no de un escalado global.
- Investigadores: CSV institucional + perfiles/filiaciones/fotografías curadas + agregados JSON del Excel. 308 investigadores actuales, 256 con ORCID, 3505 vínculos y 2369 publicaciones únicas. El corte `slice(0,60)` carecía de paginación. Los indicadores son globales.
- Proyectos: JSON derivado de OpenProject, 31 proyectos, 185 participaciones (no personas únicas). Los indicadores y distribuciones describen todas las coincidencias filtradas.
- Unidades: JSON curado, 30 unidades, 18 comités de ética y 10 redes. Los indicadores de unidades son filtrados; los de CIEI globales. La transformación `min(100,max(6,n*12))` reemplazaba el conteo impreso, por ejemplo 16 por 100. El filtro de UI «Sí» no coincidía con la comprobación «si».
- Todos los filtros/orden/paginación del nuevo listado se resuelven en servidor sobre el conjunto completo. El cliente recibe opciones, estado de URL y markup de la página; no el catálogo para calcular métricas.
- Línea base: `directorios-antes.json` y seis capturas `screenshots/directorios-{investigadores,proyectos,unidades}-antes-{360,1440}.png`.
- Resultado medido a 1440 px: filtros 272 px + resultados 1065 px, frente a 785 px útiles previos para resultados. Tarjetas de investigadores/unidades de 524,5 px, máximo dos columnas; proyectos usa los 1065 px. Sin cambiar el tamaño raíz de lectura ni ocultar overflow.

## Implementación

- Reutilización de `SectionHeader`, `KpiCard` variante directory, `Badge`, tarjetas específicas y loaders reales. `ProjectFilters`, `ResearchUnitFilters`, `ProjectStats` y `ResearchUnitStats` se adaptan a los componentes comunes y siguen utilizados, sin duplicar formularios.
- `components/directories/`: resumen con ayuda accesible, formulario común con borrador y transición, filtros plegables en móvil, barra y etiquetas activas, orden, paginación, estado vacío, carga/error/reintento y distribuciones numéricas secundarias.
- `lib/directoryQuery.ts`: normalización, whitelist de parámetros y órdenes, URL, limpieza independiente de consulta, retorno seguro, orden estable con ausentes al final y paginación. `directoryConfigs.ts` adapta etiquetas/opciones al contrato específico; no es un renderer universal de registros.
- Dos columnas desde 64 rem: 17 rem de filtros y resultados flexibles con `min-width:0`. Tarjetas de investigadores/unidades en máximo dos columnas desde 48 rem de espacio efectivo de resultados. KPIs: una/dos/cuatro columnas según espacio real. Se conserva la escala de lectura compartida.
- Investigadores: nombre y ORCID enlazados, avatar real/iniciales, filiación curada, áreas expandibles y tres métricas sin pequeñas cajas. Disponibilidad numérica obtenida del CSV original mediante `getResearcherListMetrics`, sin cambiar el modelo histórico. Ranking secundario calculado con el orden existente de publicaciones, no evaluación integral de calidad.
- Proyectos: títulos completos; estados y tipos explícitos; se omiten del listado pipeline inferido, preparación técnica y presupuesto individual. Se conservan datos y cronograma de ficha. Presupuesto secundario agrupado por año/moneda, no financiamiento captado; duración ausente identificada desde los registros, no desde el cero normalizado del promedio.
- Unidades: nombres completos, IPRESS/red/líneas, vínculos explícitos con CIEI. No se atribuye acreditación al centro. Conteos sin transformación visual; denominador y escala de barras identificados, alternativa textual presente.
- Estadísticas y capacidades de revisión conservadas en secciones secundarias; filtros especializados en Más filtros. Los filtros sin opciones ni valor aplicado no se presentan como controles vacíos.
- Cambios de consulta/filtro/orden reinician página. Paginar conserva estado. Las etiquetas sincronizan formulario/resultados mediante remount con clave canónica. El router de Next administra transiciones; no hay fetches manuales paralelos que sobrescriban resultados.
- Las fichas solo cambian su enlace de retorno, validado y limitado a su propio directorio. No se rediseñan perfiles, Expertise, producción científica, portada ni encabezado global.

## Validación

Resultados ejecutados:

- Lint y TypeScript correctos, sin advertencias. Versiones instaladas: Tailwind 3.4.19 y TypeScript 5.9.3; sin actualizaciones.
- Siete pruebas nuevas de URL/orden/paginación/datos reales/Sí-No y siete pruebas existentes de publicaciones correctas.
- `npm run build` correcto, incluyendo lint/tipos y preparación standalone. Desarrollo detenido antes de compilar; sin ejecución simultánea.
- Navegador en desarrollo: 30 combinaciones (tres rutas × cinco anchos CSS × texto 100%/200%), 45 vistas contrastadas con los loaders completos y cero errores de consola. Anchos: 320/360/768/1280/1440. Evidencia: `directorios-validacion.json`.
- Flujos: Enter/Buscar, filtros combinados, retirada individual, limpieza conservando consulta, orden del conjunto completo, página/recarga/atrás/adelante, retorno desde ficha, vacío, página fuera de rango y últimas consultas bajo latencia. Panel móvil conserva borrador y se cierra al aplicar; ayudas Enter/Escape y foco de retorno comprobados.
- Standalone, estadísticas expandidas: quince comprobaciones sin overflow, campos etiquetados, Tab al botón Buscar con foco visible, ORCID válido y conteos de redes/tipos iguales a la fuente. Cero errores de consola. Evidencia: `directorios-secundarios.json`.
- Error/reintento: tres fallos EIO inducidos con preload de pruebas en otro proceso; pantalla de error distinta de vacío, detalles internos no expuestos y reintento por Enter con consulta conservada. Fuentes intactas. Errores del log aislado esperados, no del servidor normal. Evidencia: `directorios-errores.json`.
- Producción: diecisiete accesos directos/recargas/navegaciones internas en cinco rutas y ficha de publicación, sin errores ni chunks fallidos. Evidencia: `next-runtime-directorios-production.json`.
- Desarrollo reiniciado después del build: las mismas diecisiete comprobaciones correctas, sin errores ni chunks fallidos (`next-runtime-directorios-development.json`). Servidor disponible en `http://localhost:3000/`; log `/tmp/observatorio-directorios-dev.log`. Los dos servidores temporales standalone fueron detenidos.
- Capturas anteriores/posteriores con iguales viewports 360/1440 revisadas, más tres de resultados móviles. Se ajustó el runner para esperar la ficha real, abrir Más filtros antes de enfocar y esperar estados tras clics. Interrupciones iniciales no se cuentan como validaciones aprobadas. Se endurecieron los toggles con actualizaciones funcionales de estado.
- Muestra de contraste computado: doce pares texto/fondo (título, ayuda, botón y etiqueta de indicador en las tres rutas), mínimo 5,12:1. Evidencia `directorios-contraste.json`; no es auditoría exhaustiva de todos los estados ni certificación WCAG.

Scripts reproducibles:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test:directory-query
npm run test:publication-query
# Con Chrome CDP en 9225 y el servidor disponible:
TEST_BASE_URL=http://127.0.0.1:3000 npm run test:directories
```

Para compilar, detener primero el servidor de desarrollo del proyecto; ejecutar `npm run build` y después `npm run dev`. Nunca ejecutar build/dev simultáneamente. Las salidas existentes `.next-dev`/`.next` se conservan separadas. Las pruebas de error usan exclusivamente un proceso standalone aislado con un preload de pruebas y una bandera temporal, sin editar archivos de datos.

## Límites y Pendientes

1. No existe frontera autorizada público/gestión; plegar información no es protegerla. `public/data` y fichas preexistentes conservan metadatos administrativos, equipo/presupuesto y contactos. Se requiere una política explícita y control de acceso real, fuera de esta etapa. No se inventan permisos.
2. Unidades: 29 registros dicen «Listo mínimo», pero `readyUnits` busca «lista» y devuelve 0. Se muestra como regla histórica, junto a la distribución real, sin redefinir preparación. `registeredCiei` significa estado consignado (incluye «No registrado»); el contador de pendientes incluye acciones recomendadas. No se anuncian como registro positivo ni exclusivamente faltantes críticos.
3. La página existente `/unidades/ciei` no se rediseña: su título es H2 y conserva escalado incorrecto en sus propios gráficos. Se registra como deuda previa, no como regresión del listado de unidades. La corrección Sí/si del loader beneficia sus filtros existentes.
4. El modelo histórico de investigadores normaliza ciertas métricas ausentes a cero; el listado comprueba disponibilidad de sus tres métricas, pero el orden y las fichas conservan reglas anteriores. No se corrigen métricas, Expertise ni relaciones institucionales en este encargo.
5. `region` no es un filtro soportado por el loader de unidades; no se agrega un selector ficticio. Etapas de proyectos no están documentadas como campo fuente explícito; no se infiere avance visual en el listado.
6. No se eliminan componentes. Los filtros e indicadores específicos delegan en la base común; las tarjetas conservan responsabilidades propias por tipo de registro.
7. Las comprobaciones son parciales, no certificación WCAG integral. Ampliación de texto 200% mediante tamaño raíz no equivale a probar todas las combinaciones de zoom del navegador, lectores de pantalla o dispositivos físicos.
8. **Identidad discordante, prioridad alta:** `researchers_observatory.csv:3` y `researcher_photo_manifest.csv:3` identifican `orcid:0000-0003-4593-2509` como **Yersin Silva Silva**, mientras `researcher_profiles_curated.csv:3` lo presenta como **Cristian Díaz-Vélez**. Iniciales YS/CD también diferentes. Ya se observaba en la captura anterior. Se respeta la prioridad curada existente sin reasignar métricas ni inventar identidades. Revisar pipeline/fuentes antes de interpretar ese perfil; esta revisión no determina cuál identidad es correcta mediante fuentes externas.

## Inventario de Esta Etapa

- Rutas: `frontend/app/{investigadores,proyectos,unidades}/page.tsx`, `loading.tsx`, `error.tsx`; fichas `[id]/page.tsx` solo para retorno.
- Tarjetas/adaptadores reutilizados: `ResearcherProfileCard`, `ProjectResultCard`, `ResearchUnitCard`, `ProjectFilters`, `ResearchUnitFilters`, `ProjectStats`, `ResearchUnitStats` en `frontend/components/`.
- Nuevos compartidos: `frontend/components/directories/Directory.module.css`, `DirectoryFilterFields.tsx`, `DirectoryWorkspace.tsx`, `DirectorySummary.tsx`, `DirectoryResults.tsx`, `DirectoryState.tsx`.
- Presentación/estado: `frontend/lib/directoryQuery.ts`, `directoryConfigs.ts`, disponibilidad original del listado en `researchers.ts` y corrección Sí/si en `researchUnits.ts`. Sin cambios de backend, esquema ni archivos CSV/JSON/Excel.
- Pruebas: `scripts/test-directory-query.mjs`, `check-directories.mjs`, `check-directory-secondary.mjs`, `check-directory-errors.mjs`, helpers de `scripts/lib/`, fixture aislada `scripts/fixtures/directory-read-error.cjs`; dos comandos en `package.json`. Lockfile intacto.
- Documentación: este informe, CHANGELOG, las tres bitácoras y registro de capturas. Cambios anteriores de Producción Científica, Header/base visual y aislamiento de Next conservados, no atribuidos a esta etapa.

## Capturas

En `docs/screenshots/`:

- `directorios-investigadores-{antes,despues}-{360,1440}.png`.
- `directorios-proyectos-{antes,despues}-{360,1440}.png`.
- `directorios-unidades-{antes,despues}-{360,1440}.png`.
- `directorios-{investigadores,proyectos,unidades}-resultados-360.png`.

Siguiente etapa: corregir identidades curadas y acordar definiciones de preparación/registro; después adaptar el catálogo CIEI y establecer control de acceso real a gestión. La base común queda disponible sin universalizar tarjetas ni cargar catálogos completos en el cliente.
