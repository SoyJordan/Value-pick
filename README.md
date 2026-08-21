# SoyJordan Picks V1.7.2 · build 1721

Actualización sobre V1.7.1 build 1710. El motor λ de goles se conserva; la principal modificación es el selector por categorías.

## Selector V1.7.2
- GANADORES: Local, Empate, Visitante, DNB Local/Visitante, 1X y X2.
- GOLES: Over/Under 1.5, 2.5 y 3.5; goles de equipo O0.5/O1.5.
- HÁNDICAP: Local +1/-1 y Visitante +1/-1, cada línea con cuota independiente y cálculo WIN/PUSH/LOSS.
- AMBOS MARCAN: Sí / No.
- CÓRNERS BETA: totales 8.5/9.5/10.5 y equipo 3.5/4.5, con λ de córners separado.

Cada categoría selecciona un mejor candidato usando Selector Score:
30% Robustez + 25% EV peor + 20% Confianza + 15% Value + 10% Probabilidad.

Los ganadores de categoría compiten por un TOP PICK GENERAL. Córners queda fuera del TOP GENERAL hasta contar con suficiente historial real para calibrarlo.

## Filtros adicionales
- Divergencia modelo/mercado 20–35%: exige Robustez >=75 y EV peor >=4%.
- Divergencia >35%: exige Confianza >=85, Robustez >=85 y EV peor >=8%.
- Over 0.5 de equipo: exige P>=70%, Edge>=5%, Robustez>=75 y EV peor>=3%.
- Copa, primera vuelta: -5 a la confianza usada por el selector; no cambia el λ.

## Córners BETA
Se añadieron Córners a favor y Córners en contra a Últimos 10, Últimos 5 y condición. El λ de córners usa producción propia + concesión rival, regresión conservadora y ajuste local/visitante. Se pueden registrar córners reales en la auditoría postpartido.
