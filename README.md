# SoyJordan Picks V1.6.3.1

Actualización de auditoría y selector de picks. El núcleo de estimación de λ se mantiene en V1.6; se corrigen cálculos de mercados con PUSH y el ranking del mejor pick.

## Cambios V1.6.3.1
- **Auditoría λ corregida:** si se registra xG real, el error absoluto compara `λ previsto vs xG real`. Si no hay xG, usa goles reales solo como respaldo y lo indica explícitamente.
- **MAE λ del historial:** ahora se calcula únicamente con partidos que tengan xG real registrado y muestra el tamaño de muestra `n`.
- **DNB corregido:** Local DNB y Visitante DNB ahora calculan EV, edge y cuota justa con WIN/PUSH/LOSS reales; antes el EV se estimaba sobre probabilidad condicionada y podía quedar sobredimensionado.
- **AH auditado:** la fórmula de hándicap asiático entero mantiene WIN/PUSH/LOSS, cuota justa `(1-PUSH)/WIN` y EV `WIN×cuota + PUSH − 1`. No se introdujo un sesgo artificial contra el underdog.
- **Nuevo ranking del mejor pick:** ya no se ordena solo por Value. Dentro de cada nivel de decisión usa 30% Value + 25% Confianza + 25% Robustez + 20% EV peor normalizado. `VALUE BET` tiene prioridad sobre `WATCH` y `NO BET`.
- **Transparencia:** la interfaz aclara que AH/DNB incorporan el PUSH en cuota justa y EV.
- **Ausencias:** conserva la agregación con rendimientos decrecientes de V1.6.2.9.
- **Caché/PWA:** build visible `1630`, cache y manifest actualizados a V1.6.3.1.

## Instalación en GitHub Pages
Reemplaza los 7 archivos del repositorio por los de esta carpeta: `index.html`, `manifest.json`, `sw.js`, `logo.svg`, `icon-192.png`, `icon-512.png` y `README.md`.


## Compatibilidad
- Conserva historial y backups de versiones V1.6.x.
- Mantiene las mejoras previas de captura PNG, historial, bank compacto, PWA, xG decimal y agregación de ausencias con rendimientos decrecientes.


## Hotfix V1.6.3.1
- Los registros prepartido bloqueados ya pueden cargarse al formulario como copia editable.
- El registro original conserva su bloqueo y no se sobrescribe.
- Al analizar/guardar la copia se crea un registro nuevo.
- Build visible: 1631.
