# FotoDex

FotoDex es una aplicación web móvil instalable (PWA) para registrar observaciones de animales.

## Funciones disponibles en esta versión

- Capturar una foto con la cámara del móvil o seleccionarla desde la galería.
- Reducir las imágenes a un máximo de 1920 px y guardarlas como JPEG optimizado antes de almacenarlas.
- Crear, editar, consultar y eliminar fichas con nombre común y científico, grupo, hábitat, país, lugar, fecha y notas.
- Guardar las fichas e imágenes en IndexedDB del navegador. La ubicación precisa es opcional y permanece en el dispositivo.
- Explorar la colección con búsqueda y filtros por grupo, estado de captura, hábitat y país.
- Ver fichas de especies introductorias, progreso personal y ejemplos visuales de la comunidad.
- Crear una cuenta e iniciar sesión con correo y contraseña; guardar nuevas capturas en Supabase.
- Elegir si una captura es privada, visible para seguidores o pública; la foto vive en un bucket privado.
- Seguir a otros usuarios, dar me gusta y comentar capturas compartidas.
- Instalar la aplicación y abrir su interfaz básica sin conexión después de cargarla.

## Limitaciones actuales

La identificación por IA todavía no está conectada. Las fichas del catálogo y las publicaciones con la etiqueta «ejemplo» son contenido ilustrativo, no identificaciones científicas confirmadas. Las capturas locales anteriores no se suben automáticamente al iniciar sesión; solo se sincronizan las que se creen o editen con una sesión activa.

Las capturas guardadas sin sesión solo existen en ese navegador y pueden perderse al borrar los datos del sitio. La ubicación GPS exacta se guarda en una tabla privada y las políticas de seguridad permiten verla solo al dueño; el país y lugar aproximado siguen los permisos de visibilidad de la captura.

El esquema de nube está en `supabase/initial-schema.sql`. El proyecto Supabase FotoDex está activo y sus tablas tienen RLS habilitado. La app usa una clave publicable; nunca se debe añadir una clave `secret` o `service_role` al código del navegador.

## Preparar el acceso por correo

En Supabase, abre **Authentication → URL Configuration** y configura como **Site URL** y URL de redirección:

`https://sergiogimeenez18-coder.github.io/FotoDex/`

La confirmación por correo depende de esos ajustes y del proveedor de correo configurado en el proyecto.

## Publicar con GitHub Pages

Configura GitHub Pages para desplegar desde la rama principal y la carpeta raíz. La web usa rutas relativas para funcionar bajo la ruta `/FotoDex/` del proyecto.
