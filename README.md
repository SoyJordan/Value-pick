# SoyJordan Picks V1.6.2.5.1

Actualización visual y operativa sobre V1.6.1. El motor matemático V1.6 se mantiene sin cambios.

## Cambios V1.6.2.5.1
- Botón para descargar una captura PNG limpia del resultado.
- Historial rediseñado con tarjetas acordes a la interfaz.
- Selector visual de picks para registrar apuestas reales.
- Confirmación de apuesta que bloquea el análisis prepartido.
- Estado PENDIENTE / GANADA / PERDIDA / PUSH conservado en apuestas.
- Bank compacto y sticky con Bank, P/L y Disponible.
- Logo único SoyJordan Picks e iconos PWA.
- Backup actualizado a V1.6.2.5.1 y compatibilidad con datos V1.6.1.

## Instalación en GitHub Pages
Sube todos los archivos de esta carpeta al mismo nivel del repositorio: `index.html`, `manifest.json`, `sw.js`, `logo.svg`, `icon-192.png` e `icon-512.png`.


## Corrección V1.6.2.5
- Captura iPhone/Safari reescrita para usar Canvas → dataURL directamente.
- Eliminada dependencia de canvas.toBlob/fetch/ObjectURL para generar la captura.
- Vista previa aparece antes de guardar/compartir.
- En caso de fallo muestra el detalle técnico exacto.


## Corrección V1.6.2.5
- Captura con diagnóstico λ completo usando las claves reales de `diagnostics`.
- Impactos de ausencias leídos desde `absenceImpact`.
- Tabla de auditoría completa: Pick, Prob., Justa, Cuota, Edge, EV, Value, Conf., Robustez, EV peor y Decisión.
- Altura dinámica corregida para que no se corten los últimos mercados.
- Ancho de columnas reajustado para evitar corte lateral.
- Motor matemático V1.6 sin cambios.


## V1.6.2.5 — Auditoría postpartido
- Botón **Registrar resultado real** en cada análisis del historial.
- Guarda marcador real y xG real opcional sin modificar el pronóstico prepartido.
- Evalúa automáticamente el mejor pick del modelo como GANADA / PERDIDA / PUSH.
- Calcula error absoluto de λ local, visitante y total de goles.
- Panel de historial con partidos auditados, W/L/P del top pick y MAE de λ.
- La captura PNG incluye el resultado real y la comparación con el λ cuando ya existe auditoría.
- Puede liquidar apuestas pendientes del partido automáticamente, previa confirmación.
- El motor matemático sigue siendo V1.6; esta versión solo amplía auditoría/interfaz.


## V1.6.2.7
- Corrige el problema real de caché: el service worker anterior seguía usando CACHE v1.6.2.5.
- Navegación/index ahora usa estrategia network-first para recibir siempre la versión nueva.
- xG real acepta punto o coma decimal en iPhone.
- Columnas Local/Visitante de la captura movidas más a la izquierda.
- Se agrega marcador visible `build 1627` para verificar que el iPhone cargó la versión correcta.
- Motor matemático V1.6 sin cambios.
