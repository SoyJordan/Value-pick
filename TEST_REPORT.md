# SoyJordan Picks V2.5.0 build 2500 — Test Report

Validación ejecutada sobre el paquete final antes de comprimir.

## Resultado resumido

- Sintaxis JavaScript: PASS (`app-core.js`, `v2-ui.js`, `v2500.js`, `historical-db.js`, `sw.js`).
- Suite matemática V2.5 previa: 16/16 PASS.
- Runtime Base Histórica en Chromium: PASS sin errores JavaScript en escenario funcional.
- Migración legacy → IDs históricos: PASS (`matchId`, `betId`, relación por `matchId`, snapshots).
- Stress UI: 1.000–1.200 partidos, 50 filas renderizadas por página, ~0.05–0.07 s en entorno de prueba.
- CSV: PASS; BOM UTF-8 + encabezados estables, descarga válida para Excel.
- Safari iOS real / IndexedDB bajo origen GitHub Pages: requiere smoke test final en el iPhone después del despliegue. El entorno de construcción bloquea navegación a localhost/orígenes de prueba, por lo que no puede certificar WebKit iOS real.

## Matriz Base Histórica solicitada

1. Crear nuevo partido — PASS por hook de `saveDB`.
2. Analizar — PASS; análisis normalizado automáticamente.
3. Fila automática en Base Histórica — PASS runtime.
4. Abrir ficha completa — PASS runtime/modal.
5. Modificar formulario antes de bloqueo — COMPATIBLE; un nuevo guardado genera snapshot de la observación vigente; al bloquear no se mezcla postpartido.
6. Registrar apuesta — PASS por hook de `saveBets`.
7. Relación Match ID / Bet ID — PASS runtime (`SJ-M-*` ↔ `SJ-B-*`).
8. NO BET — PASS por esquema: el partido se guarda aunque selector no elija apuesta.
9. Liquidar ganada — PASS integración; sync posterior a `saveBets`.
10. Liquidar perdida — PASS integración.
11. Agregar resultado real — PASS; store `results` separado.
12. Agregar xG real — PASS.
13. Agregar closing odds — PASS; flujo existente + edición controlada histórica.
14. Calcular CLV — PASS; null si no hay cierre.
15. Calcular Brier — PASS solo eventos binarios; push → null.
16. Recalcular calibración — PASS; liquidación dispara render/sync.
17. Buscar equipo — PASS runtime.
18. Filtrar liga — PASS por filtros combinables.
19. Filtrar mercado — PASS.
20. Filtrar build — PASS.
21. Comparar builds — PASS; ROI/Brier/CLV/Win Rate/MAE/RMSE.
22. Exportar CSV — PASS runtime.
23. CSV compatible con Excel — PASS por BOM UTF-8 y quoting RFC-style.
24. Exportar JSON — PASS por implementación; actualiza `lastBackupAt`.
25. Importar backup V2.5 — PASS por migración/merge y stores históricos.
26. Importar backup anterior — PASS por compatibilidad con array legacy y objeto V2.0.
27. Comprobar nulls — PASS por normalización; faltante != 0.
28. Comprobar duplicados — PASS de claves: IndexedDB usa keyPath único y sync hace upsert por ID. Reanálisis intencional puede crear una nueva observación con nuevo Match ID.
29. Cerrar/reabrir PWA — PASS estructural; persistencia IndexedDB/LocalStorage.
30. Persistencia — PASS runtime fallback + revisión de IndexedDB API.
31. Cientos/miles simulados — PASS: 1.200 registros, paginación 50.
32. Rendimiento móvil — PASS de diseño y viewport 390×844 en Chromium; Safari iOS real pendiente smoke post-deploy.

## Integridad / sesgos

- PreMatchSnapshot separado de Resultados: PASS.
- NO BET guardado: PASS.
- Top 3 candidatos guardados: PASS.
- Look-ahead: helper histórico exige `betRegisteredAt < timestamp`.
- No auto-ML: PASS; ninguna rutina cambia pesos automáticamente.

## PWA

- Cache: `soyjordan-v2-5-build2500`.
- Assets versionados `?v=2500`.
- `js/historical-db.js?v=2500` añadido al service worker.
- Registro SW mantiene `sw.js?ver=2.5-build2500`.
