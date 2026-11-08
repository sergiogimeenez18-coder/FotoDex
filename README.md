# FotoDex

FotoDex es una aplicación web móvil instalable (PWA) para registrar observaciones de animales.

## Funciones disponibles en esta versión

- Capturar una foto con la cámara del móvil o seleccionarla desde la galería.
- Reducir las imágenes a un máximo de 1920 px y guardarlas como JPEG optimizado antes de almacenarlas.
- Crear, editar, consultar y eliminar fichas con nombre común y científico, grupo, hábitat, país, lugar, fecha y notas.
- Guardar las fichas e imágenes en IndexedDB del navegador. La ubicación precisa es opcional y permanece en el dispositivo.
- Explorar la colección con búsqueda, filtros por grupo, estado, hábitat, país y fichas sin nombre científico, además de ordenar por fecha de captura o nombre.
- Explorar una lista principal de 853 nombres del documento aportado: 620 aves, 152 mamíferos, 78 reptiles y 3 de otros grupos, con carga progresiva para mantener ágil la colección en móvil.
- Añadir especies propias a la lista desde la app; las copias de seguridad incluyen esas especies y los datos científicos consultados.
- Consultar en GBIF nombres científicos y clasificación; las coincidencias deben revisarse y solo se guardan al aceptarlas.
- Crear una cuenta e iniciar sesión con correo y contraseña; guardar nuevas capturas en Supabase.
- Elegir si una captura es privada, visible para seguidores o pública; la foto vive en un bucket privado.
- Seguir a otros usuarios, dar me gusta y comentar capturas compartidas.
- Ver notificaciones de nuevos seguidores, me gusta y comentarios en tus capturas.
- Buscar exploradores por nombre visible o nombre de usuario y seguir/dejar de seguir desde los resultados.
- Pedir hasta tres sugerencias de identificación animal a partir de una copia reducida de la foto; la persona elige cuál aplicar y revisa los datos antes de guardar.
- Descargar y restaurar copias JSON de las capturas guardadas en el dispositivo; las ubicaciones precisas se excluyen a menos que se elija incluirlas.
- Migrar voluntariamente las capturas locales antiguas a la cuenta; durante la migración se guardan como privadas.
- Instalar la aplicación y abrir su interfaz básica sin conexión después de cargarla.
- Instalar FotoDex desde el navegador compatible o consultar los pasos para añadirla a la pantalla de inicio en Safari.

## Limitaciones actuales

La lista de animales contiene nombres comunes aportados por el usuario; los nombres científicos y hábitats están pendientes de enriquecerse con fuentes fiables. La identificación asistida requiere iniciar sesión y configurar `OPENAI_API_KEY` como secreto de la función Edge `identify-animal` en Supabase. La función limita cada cuenta a 25 identificaciones al día para controlar el gasto. La clave nunca va en el navegador ni en el repositorio. La suscripción de ChatGPT no incluye uso de la API; OpenAI factura ese uso por separado. FotoDex solo manda una copia JPEG reducida cuando se pulsa **Identificar animal**; no manda coordenadas GPS. Las sugerencias pueden ser erróneas y deben revisarse. Las copias descargadas incluyen las fotos; el GPS exacto se excluye salvo que se marque la casilla para incluirlo. Al restaurar una copia, las capturas se añaden al dispositivo como privadas y no se sincronizan automáticamente. Las publicaciones con la etiqueta «ejemplo» son contenido ilustrativo, no identificaciones científicas confirmadas.

Las capturas guardadas sin sesión solo existen en ese navegador y pueden perderse al borrar los datos del sitio. La ubicación GPS exacta se guarda en una tabla privada y las políticas de seguridad permiten verla solo al dueño; el país y lugar aproximado siguen los permisos de visibilidad de la captura.

El esquema de nube está en `supabase/initial-schema.sql`. El proyecto Supabase FotoDex está activo y sus tablas tienen RLS habilitado. La app usa una clave publicable; nunca se debe añadir una clave `secret` o `service_role` al código del navegador.

La función de identificación está en `supabase/functions/identify-animal/index.ts` y usa la API Responses de OpenAI con `gpt-5.4-mini`. Para activarla, crea una clave de API de OpenAI y añádela en **Supabase → Edge Functions → Secrets** con el nombre `OPENAI_API_KEY`. No pegues esa clave en GitHub ni en el chat. No se realiza ninguna llamada de identificación mientras no se pulse el botón.

## Preparar el acceso por correo

En Supabase, abre **Authentication → URL Configuration** y configura como **Site URL** y URL de redirección:

`https://sergiogimeenez18-coder.github.io/FotoDex/`

La confirmación por correo depende de esos ajustes y del proveedor de correo configurado en el proyecto.

## Publicar con GitHub Pages

Configura GitHub Pages para desplegar desde la rama principal y la carpeta raíz. La web usa rutas relativas para funcionar bajo la ruta `/FotoDex/` del proyecto.
