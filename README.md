# SoyJordan Picks V1.7.1 · build 1710

## Modos
- **Liga:** conserva el motor V1.6.4 y el selector V1.6.3.3.
- **Copas / Interliga:** usa promedio goleador por liga, fuerza interliga y contexto de vuelta.

## V1.7.1 · Fuerza interliga
- Fuerza de liga 0–100 para cada equipo.
- Nivel del equipo dentro de su liga 0–100.
- Índice = 70% fuerza liga + 30% nivel equipo.
- La diferencia mueve el λ de forma simétrica y moderada: 0.35% por punto de índice, con límite ±12%.

## V1.7.1 · Resultado global
Solo modifica el cálculo en **Vuelta**:
- equipo que necesita 1 gol: +4% a su λ antes de ausencias/descanso;
- equipo que necesita 2 o más: +8%;
- el equipo que va ganando no recibe una reducción automática, para no sobreajustar el efecto de contragolpe.

El resultado muestra λ estructural, λ regularizado, índice interliga, ajuste interliga, λ tras fuerza interliga, ajuste por global y λ final.
