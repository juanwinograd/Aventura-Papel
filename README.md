# El apocalipsis Vicente

Una aventura 2D para navegador basada en la historieta de la carpeta [`historieta/`](historieta/). Vicente, Fabrizio y Luca exploran viñetas, combinan once poderes y rescatan a Vicente de su propio apocalipsis. Incluye seis pantallas principales, una viñeta secreta y la historieta original para leer dentro del juego.

## Jugar en desarrollo

Requiere Node.js 20 o posterior.

```sh
npm ci
npm run dev
```

El servidor escucha en el puerto **3000**. Se puede cambiar con `PORT=otro_puerto npm run dev`. Abrir la raíz del servidor en el navegador. El juego funciona con archivos estáticos; no requiere base de datos, cuenta, claves ni servicios externos. No requiere compilación para desarrollo ni paquetes que cargar desde un CDN.

También se puede generar una edición descargable del juego en un solo archivo:

```sh
npm run build
```

El resultado es `dist/El-apocalipsis-Vicente.html`, con código, dibujos, estilos, fuente y efectos incluidos. Se puede descargar y abrir en un navegador de escritorio. Esta edición contiene el juego; el lector de las 12 páginas originales está disponible en la versión del repositorio para evitar que la descarga supere los 70 MB.

En el entorno de Codex, si el caché habitual de npm no es escribible:

```sh
npm ci --cache /workspace/.cache/npm --ignore-scripts --no-audit --no-fund
```

## Controles

| Acción | Control |
| --- | --- |
| Moverse | Flechas, WASD o clic en el suelo |
| Elegir personaje | 1 Vicente, 2 Fabrizio, 3 Luca; también sus tarjetas |
| Poderes | Z, X, C y V, o sus botones en el panel |
| Hablar, recoger, colocar o abrir regalos, avanzar | E o Espacio |
| Pausa y controles | Escape o botón de ayuda |

Los poderes apuntan en la última dirección de movimiento. Hay que mirar al objetivo y estar a su alcance. Las máquinas cercanas tienen prioridad para el rayo eléctrico. La tecla E muestra una acción contextual: al llevar un regalo, lo coloca si hay un mecanismo cerca y lo abre en los demás lugares. El tamaño pequeño y el campo de fuerza se cancelan pulsando su tecla otra vez. En el conducto no se puede crecer ni cambiar de personaje hasta salir.

«Una pista» ofrece ayuda específica para cada viñeta. «Ver viñetas» permite regresar a las pantallas desbloqueadas y buscar marcas pendientes. Tres marcas, encontradas en las viñetas 2, 3 y 4, abren el dibujo del cuartel y el nivel secreto. No hace falta encontrar el secreto para terminar la historia.

El progreso se guarda localmente en el navegador, al resolver acertijos o encontrar marcas. «Continuar mi aventura» restaura el último punto de control. Recargar no conserva objetos en tránsito ni efectos temporales: los objetos de acertijos pendientes vuelven a su sitio. Borrar los datos del navegador elimina el guardado. Si el navegador bloquea el almacenamiento, se informa en pantalla y se puede seguir jugando en esa pestaña. Nueva aventura pide confirmación antes de reemplazar el progreso.

## Validación

```sh
npm run check
npm test
npm run test:browser
npm run build
npm run test:download
```

- `check`: verifica la sintaxis de los módulos y del servidor.
- `test`: pruebas del motor con el runner de Node; regalos y contenido, poderes, recargas, movimiento restringido, teletransporte seguro, protección de NPC, puntos de control, guardado, aventura completa y nivel secreto.
- `test:browser`: inicia su propio servidor en el puerto 3107 y recorre el juego en Chromium con clics y teclas reales. Comprueba los once poderes, el final, las tres marcas, el nivel secreto, la continuación del guardado, pausa, sonido, lectura de la historieta y ausencia de desborde horizontal a 390 px. Guarda capturas en `test-results/`, una carpeta ignorada por Git.
- `test:download`: verifica el HTML generado, el movimiento, un poder, el guardado y la continuación. Sirve el archivo en el puerto 3108, corta la conexión después de la carga y comprueba que no se pidan recursos externos. La política del Chromium administrado impide navegar a `file://`; la apertura directa desde el sistema de archivos no pudo verificarse aquí.

Las pruebas del navegador usan `/usr/bin/chromium` si existe, o el navegador instalado por Playwright. En otra máquina, ejecutar `npx playwright install chromium` antes de las pruebas. Se puede indicar un ejecutable con `CHROMIUM_PATH` y cambiar el puerto de prueba con `TEST_PORT`.

## Diseño y alcance

- [Diseño de la aventura](docs/diseno-juego.md).
- [Lámina visual aprobada](docs/propuesta-visual.png).
- `src/engine.js`: reglas y estado del juego, independiente del dibujo y del navegador.
- `src/content.js`: pantallas, diálogos, acertijos y poderes.
- `src/art.js`: personajes y escenarios dibujados en Canvas, conservando las formas aprobadas.
- `src/app.js`: interfaz, controles, guardado y lectura de la historieta.
- `src/audio.js`: efectos breves sintetizados con Web Audio.

Vicente y Luca flotan sin piernas. Luca tiene un solo pelo doblado. Fabrizio tiene un resorte de pelo, uno de pierna y dos de brazos. Los dibujos originales no se modifican. La tipografía Patrick Hand está incluida bajo su licencia OFL en `assets/FONT-LICENSE.txt`.

Primera versión para una persona en computadora con teclado y mouse. La interfaz se adapta a pantallas angostas, pero no incluye controles táctiles completos ni multijugador. La duración de 10–15 minutos es un objetivo de diseño que debe ajustarse con una partida de la familia; las pruebas automáticas no miden esa experiencia. No se ha publicado un sitio público.
