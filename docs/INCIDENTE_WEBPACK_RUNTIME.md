# Incidente de runtime Webpack / React Server Components

Fecha: 2026-11-13. Rama: `feat/produccion-cientifica-ux`.

## Alcance y protección

Se detiene el trabajo de rediseño. Se conservan los cambios anteriores de Producción Científica y su documentación. No se cambian datos, APIs, diseños ni dependencias. No se encontró AGENTS.md aplicable en el repositorio ni sus antecesores inspeccionados.

Frontend real: `frontend/`, npm/package-lock. Instalados Next 15.1.3, React 19.0.0 y React DOM 19.0.0. npm ls muestra una única versión deduplicada de React/React DOM; las versiones satisfacen los peerDependencies del Next instalado. Sin reinstalación ni actualización.

## Evidencia previa a la limpieza

- Proceso del usuario `npm run dev` PID 8629, Next CLI PID 8642 y servidor PID 8663; cwd de CLI y servidor confirmado mediante /proc como el frontend de este repositorio. Puerto 3000. stdout/stderr dirigidos a `/dev/pts/1`; no se dispone del historial de esa terminal desde esta sesión y no se intenta leerlo bloqueando el TTY.
- Configuración original: output standalone, sin distDir personalizado ni webpack personalizado. Desarrollo y build escribían `.next`.
- Mientras el dev seguía activo, `.next/BUILD_ID` y bundles hash de producción estaban presentes. No existía `.next/static/chunks/webpack.js` en el momento de inspección. Los manifiestos y archivos de servidor correspondían al artefacto de build previo, no a una salida dev limpia.
- GET `/produccion-cientifica` respondió 200 con HTML, pero Chrome nuevo sin caché no llegó a document.readyState complete. Se registra una comprobación parcial en `next-runtime-before-clean.json`. La siguiente recarga quedó bloqueada y se interrumpió la prueba previa; no se presenta como batería completada.
- GET `/` agotó 15 segundos sin recibir bytes. No se capturó en la sesión nueva la excepción exacta `options.factory ... undefined.call` reportada por el usuario. El estado observado fue carga bloqueada/incompleta.

## Interpretación y límites de causalidad

Está confirmado que un runtime dev seguía activo mientras la salida disponible en disco era de producción, compartiendo el mismo distDir. Esa condición permite que módulos/manifiestos en memoria y disco no pertenezcan a la misma compilación. No demuestra por sí sola qué módulo produjo exactamente la traza original ni permite reconstruir el historial del navegador afectado.

Se revisaron layout raíz, Header, imports/exports de Producción Científica y límites cliente/servidor. El componente cliente importa el tipo PublicationsFilters con import type; window solo aparece dentro de useEffect. Los helpers de URL no importan fs ni módulos de servidor. Los exports nombrados y la capitalización coinciden. No hay webpack/aliases personalizados fuera del alias TS @/* existente, ni indicio de duplicación/incompatibilidad de React. No se añade use client ni se desactiva SSR.

## Intervención

1. Se detuvo únicamente Next CLI PID 8642 mediante SIGTERM; se verificó que sus procesos asociados 8629/8641/8663 finalizaron. No se detuvieron otros servicios.
2. Con el proceso detenido, se verificó que `.next` era un directorio real, no un symlink, y se eliminó exclusivamente esa salida generada. Se conservaron fuentes, .env, lockfiles, node_modules y datos.
3. Reinicio mediante `npm run dev -- --hostname 127.0.0.1 --port 3000`. Inicio volvió a responder 200; las cinco rutas pasaron acceso directo/recarga/navegación interna, 15 casos sin excepciones ni chunks fallidos. Reporte `next-runtime-after-clean.json`.
4. Corrección preventiva mínima: distDir de desarrollo `.next-dev`, producción `.next`. Se añade la salida dev al .gitignore y sus tipos generados al tsconfig. Build/start/standalone mantienen sus rutas existentes.

La limpieza/reinicio resolvió el síntoma observado de carga incompleta. No se presenta como prueba suficiente de la causa exacta de la excepción original.

## Validación final

- `npm run lint`: sin errores ni advertencias. `npm run typecheck`: correcto. `npm run build`: correcto, con desarrollo detenido y salida de producción `.next`; preparación standalone correcta.
- Tras separar distDir: 17 comprobaciones (las cinco rutas por acceso directo/recarga/navegación interna y ficha `/produccion-cientifica/1` por acceso directo/recarga) correctas, sin errores de consola ni chunks fallidos. Reporte `next-runtime-after-hmr.json`.
- HMR real: se añadió y retiró temporalmente `data-runtime-check="hmr-probe"` en PublicationWorkspace, sin cambio visual. El mismo documento conservó una marca en window durante ambas actualizaciones; no hubo recarga completa. Ocho solicitudes hot-update JS/JSON respondieron 200 y no hubo excepciones. `next-runtime-hmr.json` conserva la evidencia. El archivo se restauró byte a byte (SHA256 `1bfedfad110c55e89f7efe5a0e8f68ef4261f59412a5dfb8e1e757f116a614e0`); no hay cambio permanente en componentes.
- Aislamiento de build: hashes de `.next-dev/build-manifest.json` y `.next-dev/static/chunks/webpack.js` idénticos antes/después del build de producción; `.next/BUILD_ID` generado. Reporte `next-runtime-build-isolation.json`. No se ejecutaron build y dev simultáneamente.
- Desarrollo reiniciado después de build en 3000; nueva batería sin caché de 17 casos, reporte `next-runtime-after-build.json`. Salida del servidor disponible en `/tmp/observatorio-next-dev-runtime.log`; se revisaron respuestas 200 y compilaciones correctas, sin la excepción reportada.
- `git diff --check`: correcto. Versiones y lockfile conservados. Los cambios preexistentes del rediseño permanecen; no se continúa ese trabajo.

Resultado: se recuperó el servidor y no se reproduce el fallo en las verificaciones posteriores, incluido HMR. La causa exacta del `factory.call` original sigue sin demostrarse; la condición confirmada de salida compartida se eliminó y queda cubierta por pruebas. No se afirma que borrar caché, por sí solo, explique la traza inicial.

## Archivos de esta corrección

- `frontend/next.config.ts`: separación de salidas dev/producción, sin webpack personalizado.
- `.gitignore`: ignorar `.next-dev`.
- `frontend/tsconfig.json`: incluir tipos generados de ambas salidas. `tsconfig.tsbuildinfo` se regenera por las comprobaciones existentes.
- `frontend/package.json`: script `test:next-runtime` añadido, sin dependencias nuevas.
- `frontend/scripts/check-next-runtime.mjs`: prueba Chrome/CDP reutilizable con caché desactivada, registro de excepciones/chunks/red y navegación.
- `docs/CHANGELOG.md`, `docs/README_TECNICO.md`, `docs/bitacora/produccion-cientifica.md`, este informe y JSON/capturas de evidencia.

## Uso y reproducción de la validación

El servidor se dejó repuesto en http://localhost:3000 con el script dev, iniciado mediante npm (PID padre 45375) y logs en `/tmp/observatorio-next-dev-runtime.log`. Para arrancarlo manualmente en otra sesión, detener primero ese servidor del proyecto; no usar pkill global.

```bash
cd frontend
npm run dev
```

En el navegador que sufrió el fallo, realizar una recarga completa sin caché (Ctrl+Shift+R) para descartar módulos del runtime anterior. No se cambian encabezados de caché de producción.

Para repetir la prueba de navegador, con Chrome aislado escuchando en 9225:

```bash
cd frontend
npm run test:next-runtime -- check
```

El runner requiere Node con WebSocket nativo y Chrome/CDP ya disponible; no instala paquetes. Admite TEST_BASE_URL y CHROME_DEBUG_URL. Conserva eventos y capturas en docs. El reporte previo a la limpieza es parcial por el bloqueo y se identifica como tal; las baterías posteriores sí se completaron. No se hizo commit, push ni despliegue.
