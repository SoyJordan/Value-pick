# Value Pick V1.3 iOS Local

Esta versión cambia el motor a JavaScript para poder funcionar en el iPhone sin Python, APIs ni hosting permanente.

## Importante
Safari no permite instalar una PWA completa abriendo un archivo `file://`. Para usar "Añadir a pantalla de inicio" como una app, los archivos deben servirse desde un origen web seguro (HTTPS). Esta versión está preparada para ello.

## Datos
Los análisis se guardan en `localStorage` del iPhone. Usa **Datos > Exportar backup** periódicamente. Si borras los datos del navegador o cambias de dispositivo sin backup, puedes perder el historial.

## Modelo
Poisson + ponderación temporada/10/5 + xG/GF + xGA/GA + ajustes simples por ausencias. Es una versión inicial: los pesos y umbrales deben calibrarse con historial antes de considerarlos predictivamente fiables.

## Mercados
1X2, Over/Under 1.5/2.5/3.5, BTTS, DNB, goles de equipo y +0.5.
