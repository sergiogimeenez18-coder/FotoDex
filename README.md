# FotoDex

FotoDex es una aplicación web móvil instalable (PWA) para registrar observaciones de animales.

## Funciones disponibles en esta versión

- Capturar una foto con la cámara del móvil o seleccionarla desde la galería.
- Reducir las imágenes a un máximo de 1920 px y guardarlas como JPEG optimizado antes de almacenarlas.
- Crear, editar, consultar y eliminar fichas con nombre común y científico, grupo, hábitat, país, lugar, fecha y notas.
- Guardar las fichas e imágenes en IndexedDB del navegador. La ubicación precisa es opcional y permanece en el dispositivo.
- Explorar la colección con búsqueda y filtros por grupo, estado de captura, hábitat y país.
- Ver fichas de especies introductorias, progreso personal y ejemplos visuales de la comunidad.
- Instalar la aplicación y abrir su interfaz básica sin conexión después de cargarla.

## Limitaciones actuales

Esta versión es un prototipo local de un solo dispositivo. La identificación por IA, las cuentas, la sincronización, las amistades, los seguidores, el feed compartido, los comentarios y los «me gusta» reales aún no están conectados. El contenido de comunidad y varias fichas del catálogo son ejemplos; no deben tomarse como identificaciones científicas confirmadas.

Los datos del navegador no se sincronizan entre dispositivos y pueden perderse si se borran los datos del sitio. Para publicar capturas y habilitar la red social hace falta un backend con autenticación, base de datos y almacenamiento de imágenes.

## Publicar con GitHub Pages

Configura GitHub Pages para desplegar desde la rama principal y la carpeta raíz. La web usa rutas relativas para funcionar bajo la ruta `/FotoDex/` del proyecto.
