# Base visual compartida - etapa 1

Fecha: 2026-11-13. Rama: `observatorio-directorio-proyectos`.

## Alcance y entorno

Se conservan cambios previos del usuario, datos, contratos, calculos, rutas y orden de los paneles. No se encontraron archivos AGENTS.md en el repositorio ni en los directorios antecesores inspeccionados.

Versiones instaladas: Next.js 15.1.3, React 19.0.0, Tailwind 3.4.19, TypeScript 5.9.3, ESLint 9.39.4 y lucide-react 0.468.0. Gestor npm, con package-lock existente; no se instalaron ni actualizaron dependencias.

Frontend: `cd frontend` y `npm run dev -- --hostname 127.0.0.1 --port 3004`. El puerto se eligio para no interferir con 3000. Backend: `cd backend` y `uvicorn app.main:app --reload --port 8000` con el entorno Python existente. Una primera consulta desde el sandbox no tuvo acceso; repetida con permiso de red local, GET `127.0.0.1:8000/health` devolvio `{"status":"ok","service":"observatorio-api"}`. Las cinco rutas usan sus loaders locales existentes; no se agregaron mocks ni se modifico la API.

## Diagnostico confirmado antes de editar

Fuente: Chrome headless a escala 1, deviceScaleFactor 1, viewport CSS, capturas PNG y medidas computadas en `diagnostico-visual-antes.json`.

- `html` y `body`: 16 px, interlineado 24 px, fuente system-ui/sans-serif de Tailwind. No hay fuente web externa ni errores de descarga de tipografias. No se encontraron zoom ni transformaciones de escala globales.
- `max-w-7xl` limita contenedores a 1280 px incluyendo padding. A viewport 1440, el contenido de directorio dispone de 1216 px. Con filtros de 300/310 px, analitica de 320 px y dos separaciones de 24 px, quedan 548/538 px para resultados.
- Investigadores divide esos 538 px en dos tarjetas; unidades hace lo mismo con 548 px. La escala pequena no proviene de la resolucion fisica de la captura.
- Navegacion y filtros usan 14 px, muchas etiquetas y metricas usan 12 px. Los titulos principales de directorio se renderizan como h2 de 24 px, sin h1.
- `ResearcherProfileCard` usa alturas h-5/h-10, overflow oculto y clamp en nombre/filiacion. `ResearchUnitCard` recorta el titulo a dos lineas. Estas restricciones comprimen nombres y metadatos reales.
- En movil los tres logotipos sin redistribucion producen un ancho de pagina de aproximadamente 398 px. Publicaciones llega a 482 px e investigadores a 502 px por minimos intrinsecos en grid y controles.
- Header no identifica la ruta activa ni provee identificacion textual legible del observatorio; la navegacion depende de desplazamiento horizontal.
- La regla global `a { color: inherit }`, fuera de capas Tailwind, anula colores utilitarios de enlaces. Se elimina esa interferencia manteniendo el reset de decoracion en la capa base.
- Favicon 404 preexistente. No se observo excepcion React en la linea base. Los elementos fuera del viewport en pestañas con overflow-x-auto no implican por si solos desbordamiento de pagina.

## Base implementada

- `site-container`: maximo 90rem (1440 px con fuente base de 16 px), padding lateral 16/24/32 px. Header, Footer y las cinco rutas comparten alineacion; fondos blancos y Hero siguen ocupando todo el ancho.
- `directory-layout`: una columna cuando no hay espacio; a partir de 1280 px conserva filtros, resultados y analitica en su orden original, con laterales 16rem/17rem y centro minmax(0,1fr). Min-width 0 en los hijos evita minimos intrinsecos excesivos.
- `result-grid`: tarjetas distribuidas segun ancho disponible, no segun el viewport externo. `kpi-grid`: indicadores adaptables, sin anchos fijos que corten valores.
- Fuente de cuerpo 1rem, metadatos 0.875rem, etiquetas 0.8125rem; interlineado general 1.5. Se conserva la fuente existente. Titulos h1 de directorio 1.875rem/2.25rem y secciones 1.5rem. Descripciones limitadas a 70ch. Gris secundario #5F6F85 para mantener contraste tambien sobre #F5F8FC.
- Espaciado de 4/8 px y separacion principal 32 px; tarjetas existentes mantienen sus superficies, bordes y padding de 16/20 px.
- Controles principales de al menos 2.75rem; etiquetas de busqueda accesibles, labels existentes conservados y foco visible. Variante de tinta celeste #007A9E para texto pequeno sobre blanco, conservando #00A6D6 en graficos y acentos.
- Header con tres logotipos originales, nombre textual, ruta activa con borde y aria-current, menu movil mediante disclosure, Enter/Tab/Escape y retorno de foco. No es un modal y no atrapa el foco. Cierra al activar un enlace o salir del encabezado. En movil no es sticky para no ocupar permanentemente una parte excesiva de la pantalla.
- Enlace para saltar al contenido. Se eliminan alturas/clamps de identificacion de investigadores y titulos de unidades/proyectos; el resumen largo de proyectos conserva su truncamiento intencional y enlace al detalle.
- Ajustes de redistribucion en metricas de investigadores y paginacion, sin modificar su contenido ni calculos.

## Archivos intervenidos

- Base: `frontend/app/globals.css`, `frontend/tailwind.config.ts`, `frontend/app/layout.tsx`.
- Compartidos: Header, Footer, SectionHeader, Badge, SearchBar y KpiCard en `frontend/components`.
- Adaptacion: las cinco paginas de listado/inicio, ResearcherProfileCard, ResearchUnitCard, ProjectResultCard, ProjectFilters, ResearchUnitFilters, ProjectStats y ResearchUnitStats.
- Evidencia: este informe, JSON de medidas/validacion, capturas y entradas en CHANGELOG/bitacora.

## Validacion

- `npm run lint`: correcto, sin advertencias ni errores. `npm run typecheck`: correcto. `npm run build`: correcto, incluye lint/tipos y preparacion standalone. `git diff --check`: correcto.
- Chrome: cinco rutas por cinco viewports CSS (320, 360, 768, 1280, 1440), 25 configuraciones sin desbordamiento horizontal de pagina. Fuente raiz/cuerpo de 16 px, titulos de directorio 30/36 px y metadatos auxiliares de 13 px. Capturas revisadas antes/despues, no solo generadas.
- A 1440 px: el contenedor pasa de 1280 a 1425 px efectivos debido a la barra vertical de 15 px; contenido util 1361 px. Las columnas laterales usan 256/272 px y dejan 785 px al centro, frente a 538 px previos en investigadores.
- Texto ampliado al 200% mediante font-size raiz de 32 px, comprobado en las cinco rutas a 320 y 1440 px. En movil tambien se abre el menu: no desborda la pagina ni oculta titulos. No se uso transform ni zoom CSS para simular el resultado. Esta prueba es de ampliacion de texto, no de zoom nativo de la interfaz de Chrome.
- Enter abre menu; Tab accede a enlaces; Escape cierra y devuelve foco. Foco visible de 2 px, enlace de salto visible al tabular y ruta activa con aria-current, verificados. Acceso a los cinco destinos mediante enlaces del Header correcto.
- Formularios: busqueda sin coincidencias en cuatro directorios, conservacion de query params, muestra de filtros (anio de publicacion, ORCID, estado de proyecto y tipo de unidad), enlace limpiar y pagina 2 de publicaciones comprobados. No se afirma haber probado cada combinacion posible de filtros.
- Cero excepciones y mensajes de error/advertencia capturados en las 25 configuraciones finales. Se observaron 404 transitorios de hot reload al editar/reiniciar; se repitio la matriz en una instancia limpia antes de aceptar resultados. El favicon ausente preexistente se registra en la linea base; no se agrega ni se oculta.
- Contraste calculado por luminancia relativa: azul #004B9B/blanco 8.47:1; azul oscuro/blanco 11.01:1; gris #5F6F85/blanco 5.12:1 y sobre fondo #F5F8FC 4.81:1; tinta celeste/blanco 4.91:1. El celeste decorativo #00A6D6/blanco es 2.83:1 y no se usa en las nuevas etiquetas de texto pequeno. Son comprobaciones parciales, no una declaracion de conformidad WCAG integral.

Evidencia completa: `diagnostico-visual-antes.json`, `diagnostico-visual-despues.json` y `validacion-base-visual.json`. El campo `clipped` detecta tambien el truncamiento intencional de resumenes de proyectos; no equivale por si solo a una regresion. No se verificaron exhaustivamente lectores de pantalla, otros motores de navegador ni todas las fichas individuales, fuera del alcance de cinco rutas de esta etapa.

## Capturas y reproducibilidad

`docs/screenshots/base-visual-antes-{home,produccion-cientifica,investigadores,proyectos,unidades}-{360,1440}.png` y sus equivalentes `despues`.

Se usan los mismos viewports de 360x1000 y 1440x1000 CSS, fuente normal, misma base y DPR 1. Las capturas son del viewport inicial, no composiciones de toda la pagina. Se miden ademas 320, 768 y 1280 px. JSON conserva detalle por ruta/ancho, fuentes, anchos y errores.

Limitacion de captura: algunas tomas de la primera sesion headless omitieron parcialmente la pintura del Header sticky al alternar viewports, pese a estilos visibles y sin excepciones. Se descartaron esas tomas y se regenero toda la serie final en pestanas nuevas por ruta/viewport, con captura de vista (`fromSurface: false`) tras cargar fuentes y completar cuadros de pintura. La segunda sesion confirmo el encabezado completo. No se oculto el Header ni se modifico CSS para producir la captura.

## Pendientes fuera de alcance

1. Prioridad alta: `frontend/app/unidades/page.tsx`, funcion `asPercentBar`, transforma conteos con `value * 12` y el ChartCard imprime ese valor. La presentacion puede confundirse con conteos reales. No se cambia porque afecta indicadores/calculos, excluidos en esta etapa.
2. Prioridad alta: filtro de unidades `has_ciei` reconoce `si` pero las opciones incluyen `Sí`; revisar la normalizacion en otra intervencion. No se modifica la regla de negocio aqui.
3. Prioridad media: buscador Home no define name/action y el login sigue simulado. Se preservan estos comportamientos preexistentes, no se presentan como implementados.
4. Prioridad media: investigadores muestra hasta 60 resultados sin paginacion completa; conservar funcionamiento actual hasta encargo especifico.
5. Prioridad baja: favicon ausente y noticias de ejemplo preexistentes. No se ocultan los fallos ni se alteran datos para la validacion.

Inicio reutiliza getPublicationsSummary, getResearcherSummary, getProjectStats y getResearchUnitStats. El acceso de proyectos muestra total, el KPI muestra activos; proyectos y unidades calculan sus indicadores sobre resultados filtrados mientras Home usa el conjunto completo. Estas diferencias de cobertura no deben corregirse inventando valores.

## Siguiente etapa recomendada

Redisenar el directorio de Produccion Cientifica con filtros progresivos, mejor agrupacion de metadatos y acciones y una jerarquia mas clara del resultado bibliografico. Mantener contratos y separar explicitamente totales institucionales de indicadores de resultados filtrados. Validar la propuesta antes de trasladar patrones al resto de directorios.
