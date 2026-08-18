# SoyJordan Picks V1.7.0 · build 1700

Modo Liga + Modo Copas/Interliga. El modo Liga conserva el motor V1.6.4. El modo Copas normaliza cada equipo con el promedio goleador de su propia liga y registra fase/ida-vuelta/global para auditoría.

# SoyJordan Picks V1.6.4

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


## Cambios V1.6.3.3
- **Auditoría transparente de AH/DNB:** muestra P(WIN), P(PUSH) y P(LOSS) para comprobar directamente cada mercado con devolución.
- **Etiquetado matemático:** en AH/DNB, la columna `Prob.` se identifica como P(WIN); la cuota justa sigue usando `(1-PUSH)/WIN` y el EV `WIN×cuota + PUSH−1`.
- **Sin sesgo retrospectivo:** no se modifican λ, Poisson, probabilidades base ni los umbrales del selector solo porque los dos AH +1 anteriores perdieron.
- **Captura:** los mercados AH/DNB incluyen W/P/L debajo del nombre del pick.
- **UI:** corregido el texto superpuesto bajo el diagnóstico de λ.
- **PWA:** versión V1.6.3.3, build visible 1633 y caché renovada.


## Cambios V1.6.4
- **Regularización de λ:** el motor conserva ataque, defensa rival y localía, pero evita que la debilidad defensiva rival infle desproporcionadamente a un ataque propio mediocre.
- **λ estructural:** `promedioLiga × ataqueAjustado × defensaRivalAjustada × factorSede`.
- **Ataque propio esperado:** `promedioLiga × ataqueAjustado`.
- **λ regularizado:** `ataquePropioEsperado + 0.55 × (λEstructural − ataquePropioEsperado)`.
- **Orden de ajustes:** después de regularizar se aplican ausencias ofensivas, ausencias defensivas del rival y descanso; el límite final de λ continúa entre 0.20 y 3.50.
- **Diagnóstico ampliado:** muestra λ estructural, λ regularizado y λ final para auditar el cambio.
- **Selector:** se conserva intacta la lógica V1.6.3.3 de un único VALUE BET por partido, priorizando probabilidad y usando EV peor, robustez y confianza como desempates.
- **PWA:** versión V1.6.4, build visible 1640 y caché renovada.
