# Base Histórica SoyJordan — esquema V2.5 build 2500

## Almacenamiento

Canonical: IndexedDB `SoyJordanHistoricalV2500` (schemaVersion 1).
Fallback: `sjHistoricalFallbackV2500` en LocalStorage si IndexedDB no está disponible.

Object stores:
- `matches` — keyPath `matchId`
- `bets` — keyPath `betId`, relacionado por `matchId`
- `results` — keyPath `matchId`
- `meta` — estado de schema, sync y último backup

Las claves antiguas (`valuePickDB`, `sjBetsV161`, `sjCombosV161`, `sjBankV161`) se conservan para compatibilidad funcional.

## Partidos

Cada análisis se convierte en una observación histórica, incluso cuando termina en NO BET.
Campos principales: `matchId`, identificación, build/modelVersion, timestamps, nivel de equipo, λ, Top Pick/NO BET, probabilidad, cuota, EV, EV peor, robustez, confianza, score y candidatos Top 3.

`preMatchSnapshot` contiene los inputs originales, equipos U10/U5/condición, contexto, bajas, cuotas, auditoría de λ, probabilidades y candidatos. No se mezcla con datos postpartido.

## Apuestas

Cada apuesta recibe `betId` y `matchId`. Se conservan las claves legacy.
Campos principales: cuota disponible/seleccionada/tomada, probabilidad modelo, fair mercado cuando existe, edge, EV, EV peor, robustez, confianza, score, stake, resultado, P&L, closingOdds, CLV, Brier, build y timestamps.

`preMatchSnapshotFrozen` conserva evidencia prepartido. `auditLog` registra cambios controlados como closing odds y notas.

## Resultados

Separados del snapshot prepartido: marcador, total de goles, xG real, tiros/SOT/ocasiones reales opcionales y métricas de error λ.

- error local = GF real local − λ local
- error visitante = GF real visitante − λ visitante
- error total = goles reales − λ total

La comparación por build muestra MAE y RMSE cuando hay resultados suficientes.

## Sesgos

- Data leakage: postpartido nunca se escribe dentro de preMatchSnapshot.
- Look-ahead bias: se expone `historicalMarketReliabilityBefore(market, timestamp)` para usar solo apuestas anteriores.
- Selection bias: los NO BET se guardan como observaciones de Partidos.
- Survivorship bias: la capa histórica no depende de borrar picks malos para calcular su dataset.

No se implementa auto-ML ni cambio automático de pesos en build 2500.
