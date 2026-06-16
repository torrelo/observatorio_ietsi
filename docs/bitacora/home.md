# Bitacora del modulo: Home

## Estado actual

El Home institucional funciona como puerta de entrada al observatorio. Presenta branding EsSalud, IETSI y Observatorio, Hero con imagen institucional de fondo, overlay azul, titulo principal, subtitulo y buscador global como accion central.

## Funcionalidades implementadas

- Header institucional con logos, menu principal e inicio de sesion simulado.
- Hero simplificado con buscador principal.
- Directorios principales como accesos de navegacion.
- Modulos complementarios.
- Indicadores clave compactos.
- Noticias y convocatorias.
- Footer reducido.

## Errores corregidos

- Reduccion de redundancia entre buscador de Header y buscador del Hero.
- Ajuste visual del Hero para mejorar contraste y legibilidad.
- Correcciones de hydration relacionadas con HTML invalido y formateo dependiente del entorno.

## Pendientes

- Generar captura `docs/screenshots/home-estado-actual.png`.
- Verificar fallback de datos si algun endpoint usado por el Home no responde.
- Mantener la pagina como resumen ejecutivo, evitando incorporar dashboards complejos.

## Capturas asociadas

- `docs/screenshots/home-buscador-unico.png`
- `docs/screenshots/home-hero-background.png`

## Observaciones tecnicas

El Home no debe convertirse en dashboard completo. La busqueda global vive en el Hero y la analitica avanzada debe ubicarse en modulos especializados.
