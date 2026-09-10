# SoyJordan Picks V2.5.0 · build 2500

Actualización evolutiva sobre V2.0 build 2000, lista para GitHub Pages.

## Motor V2.5
- Ventanas: Últimos 10 / Últimos 5 / condición = 50% / 30% / 20%.
- Nivel de Equipo 0–100 también en Liga, fuera del 50/30/20.
- Copa/interliga: Nivel de Liga + Nivel de Equipo con ajuste asimétrico y cap.
- Fuerza de oposición ponderada 50/30/20.
- Confirmación de λ con tiros, tiros al arco y ocasiones claras.
- Tendencia U5 vs U10 con peso contextual pequeño.
- Localía de competición opcional con fallback.
- De-vig cuando existe el conjunto completo de cuotas.
- Calibración por buckets, mercado, liga y modo; Brier y CLV.
- Fiabilidad de mercado STATIC / BLENDED / HISTORICAL.
- Stake con Kelly fraccionado 25% y cap absoluto 1.50% del bank.
- Drawdown, Profit Factor, rachas, exposición y volatilidad.
- Recalibración inmediata al liquidar apuestas.

## Base Histórica SoyJordan
Nueva sección dentro de Calibración que convierte cada análisis en una observación estructurada.

- IndexedDB principal + fallback LocalStorage.
- Vistas Partidos / Apuestas / Resultados / Comparar builds.
- `matchId` y `betId` automáticos.
- `modelVersion`, versiones de λ/selector/calibración y timestamps.
- Snapshot prepartido congelado y separado de resultados reales.
- Guarda NO BET y Top 3 candidatos para reducir selection bias.
- Búsqueda, filtros combinables y resumen dinámico.
- Error λ, MAE/RMSE, Brier, CLV, ROI y Profit Factor.
- Exportación Partidos/Apuestas/Resultados CSV y base completa JSON.
- Backup V2.5 general incluye también Base Histórica.
- Migración automática desde registros previos; ausencias de datos se representan como `null`, no cero.
- Paginación de 50 registros para móvil.
- Health dashboard de cobertura del dataset y fecha de último backup.

Ver `HISTORICAL_SCHEMA.md` para el esquema detallado.

## Compatibilidad
Mantiene las claves LocalStorage existentes y backups legacy en array/objeto V2.0. Los campos históricos nuevos se incorporan sin eliminar IDs antiguos.

## GitHub Pages
Sube el contenido de este ZIP a la raíz del repositorio. El service worker usa el cache `soyjordan-v2-5-build2500` y los assets llevan `?v=2500`. El nuevo archivo `js/historical-db.js` está incluido en el precache.
