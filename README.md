# SoyJordan Picks V1.7.8 · build 1780

## Cambios principales
- El módulo HÁNDICAP usa exclusivamente **Hándicap 1X2 europeo**; se elimina el hándicap asiático de la interfaz y del cálculo nuevo.
- Se agregan las tres selecciones **1 / X / 2** para las líneas: Local +1 / Visitante -1, 0:0 y Local -1 / Visitante +1.
- En Hándicap 1X2 europeo **no existe PUSH**: se ajusta el marcador y gana únicamente 1, X o 2.
- Caso de prueba: Le Havre 0–1 Mónaco con `1 · Le Havre +1` debe liquidarse **PERDIDA**, porque el marcador ajustado es 1–1 y gana X.
- Probabilidad justa y EV del hándicap europeo se calculan sin componente PUSH.
- Migración automática de filas AH antiguas a interpretación H1X2 europea para el historial local existente, incluyendo recálculo de apuestas vinculadas y combinadas.
- Se mantienen NO BET protegido, selector jerárquico V1.7.6, historial separado de apuestas y combinadas.
- Backup y caché actualizados a V1.7.8 / build 1780.

- Eliminado Hándicap 0:0 por duplicar el mercado 1X2 normal.
- Detección de equivalencias 1X ↔ H1X2 Local +1 y X2 ↔ H1X2 Visitante +1; solo la mejor cuota compite por recomendación.
- Cuotas vacías verificadas: se ignoran y no generan filas, EV ni candidatos al Top Pick.
