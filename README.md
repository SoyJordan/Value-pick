# SoyJordan Picks V1.7.9 · build 1793

## Cambios principales
- Ponderación del motor: **Últimos 10 50% + Últimos 5 20% + condición local/visitante 30%**.
- **Cuota mínima 1.35**: cuotas inferiores se ignoran; desde 1.35 todos los mercados se evalúan con las mismas reglas del selector.
- Se elimina el filtro especial de Over 0.5 por cuota/mercado: compite igual que los demás desde 1.35.
- **Divergencia modelo/mercado >35% no puede ser Top Pick General**.
- Divergencia 25–35% exige Conf≥80, Rob≥80 y EV peor≥5%.
- Bajas simplificadas: solo **impacto agregado ataque/defensa 0–100 por equipo**, sin jugadores individuales.
- Compatibilidad al cargar backups antiguos: las listas de jugadores se convierten a impacto agregado usando la fórmula anterior.
- **Pegado rápido P1–Pn**: calcula automáticamente Últimos 10, Últimos 5 y 5 de condición.
- Fecha del último partido opcional para calcular automáticamente días de descanso.
- Se mantienen H1X2 europeo, equivalencias 1X/X2, historial separado, apuestas elegidas, combinadas y NO BET protegido.


## Build 1793
- Combinadas: separa cuota teórica y cuota total real de la casa.
- Retorno y P&L usan la cuota real de la casa.
- Si una pata queda PUSH, la liquidación permite introducir la cuota efectiva final de la casa.


## Build 1793
- Permite editar la cuota real de la casa incluso en combinadas ya ganadas.
- Recalcula automáticamente P&L y bank al corregir esa cuota.
- Corrige auto-liquidación para usar cuota de casa cuando todas las patas ganan.
- Combinadas con PUSH quedan pendientes de cuota efectiva real.
- Marcadores internos y caché actualizados a build 1793.
