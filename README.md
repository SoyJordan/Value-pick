# SoyJordan Picks V1.7.6 · build 1760

Actualización sobre V1.7.5.

## Cambios principales

- TOP PICK GENERAL ya no es obligatorio: exige Score ≥ 70, Confianza ≥ 75, Robustez ≥ 65 y EV peor positivo. Si ningún VALUE BET elegible cumple, muestra **NO BET**.
- Se mantiene la penalización V1.7.5/V1.7.6 contra picks direccionales que contradicen una brecha fuerte del λ.
- Borrado sincronizado: al borrar un análisis del Historial también se eliminan sus apuestas individuales asociadas.
- Si el análisis eliminado pertenecía a una combinada, la selección afectada se marca **ANULADA** (cuota efectiva 1.00 / PUSH) y la combinada se recalcula sin borrar las demás selecciones.
- Historial de apuestas, App vs Usuario, combinadas, P&L, ROI/Yield y bank se conservan.
- Backup actualizado a V1.7.6.
- Service Worker / caché: build 1760.

## Caso de prueba clave

Lens vs Auxerre: Auxerre +1 debe quedar protegido por la contradicción con λ y un VALUE marginal como Visitante Over 1.5 no debe convertirse en Top General si no alcanza los mínimos absolutos; el resultado esperado es **TOP PICK GENERAL: NO BET**.
