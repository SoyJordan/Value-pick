# SoyJordan Picks V1.7.5 · build 1750

Actualización sobre V1.7.4.

## Cambios principales
- Historial independiente de apuestas (`📊 Apuestas`).
- Estadísticas separadas para Top Pick de la app, apuestas reales del usuario y combinadas.
- Consolidado financiero que incluye apuestas individuales + combinadas: W/L/P, P&L, ROI/Yield y bank.
- La apuesta elegida y bloqueada por el usuario se guarda mediante `lockedBetId` y se liquida automáticamente al registrar el resultado real.
- El Top Pick de la app se audita por separado y no afecta el bank si no fue apostado realmente.
- Las combinadas se sincronizan automáticamente con los resultados reales de sus selecciones; cuando ya pueden resolverse pasan a las estadísticas y al bank.
- Selector V1.7.5: penalización por contradicción con la dirección del λ y filtros más exigentes cuando la brecha de λ es fuerte, para limitar Top Picks impulsados principalmente por cuotas/EV altos.
- Backup actualizado a V1.7.5 e incluye análisis, apuestas, combinadas y bank.
