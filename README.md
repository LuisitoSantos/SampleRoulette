# Sample Roulette

Ruleta personal en una sola pantalla para descubrir grabaciones y preparar vídeos de **Sunday Sample**. La interfaz está disponible en español e inglés, con accesos a Spotify e Instagram en la cabecera. No hay cuentas ni inicio de sesión; las preferencias y el historial de sorteos se guardan localmente en cada navegador.

## Desarrollo

Requisitos: Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
npm test
npm run build
```

En desarrollo, Vite sirve la aplicación en `http://localhost:5173` y proxifica `/api/musicbrainz` para añadir el `User-Agent` solicitado por MusicBrainz. La carpeta `functions/` contiene el endpoint equivalente para Cloudflare Pages.

## Funciones

- Ruleta con filtros de época y género aplicados a la búsqueda de MusicBrainz. No se ofrecen filtros de procedencia o vocal/instrumental porque el proveedor no devuelve esos datos de forma fiable.
- Cada sorteo se guarda en el historial local. Los descartes se evitan durante la sesión actual; las canciones marcadas como utilizadas **no** se bloquean en sorteos posteriores.
- Una sola vista de ruleta, sin navegación lateral ni pantallas de biblioteca o gestión de contenido.
- Enlaces de búsqueda de YouTube generados a partir del título y artista; la app no afirma que un resultado de búsqueda sea la grabación exacta.
- Ficha PNG, miniatura vertical para Instagram y exportación MP4 real local: 1080×1920, 30 fps, 6 segundos, H.264 y efectos sonoros sintéticos AAC. No se incorpora audio de canciones.
- PWA instalable con caché limitada a los recursos estáticos locales. La API musical y los datos privados no se almacenan en el service worker.

## MusicBrainz y portadas

La app hace una búsqueda de grabaciones por etiquetas de género y, cuando se elige, rango de años. MusicBrainz devuelve metadatos, no audio. La selección aleatoria ocurre entre hasta 100 resultados de la búsqueda; no existe un endpoint de “dame una canción aleatoria global”. Se vuelve a escoger una etiqueta al hacer cada sorteo.

El acceso público de MusicBrainz no requiere API key y es gratuito para uso no comercial. MusicBrainz pide un `User-Agent` identificable y limita cada aplicación a un promedio máximo de una solicitud por segundo por IP. El proveedor del cliente espera al menos un segundo entre solicitudes en esa pestaña; esto basta para el uso personal normal, pero no es un limitador global si muchas personas usan la misma instalación pública simultáneamente. Si Sample Roulette se abre al público, añade una cola distribuida/cache compartida o sirve un catálogo propio que respete sus condiciones antes de promocionarla.

El proxy de Pages añade el `User-Agent`, valida las consultas permitidas y permite caché HTTP breve. En Cloudflare el contacto del `User-Agent` apunta al origen publicado de la propia app; en desarrollo apunta a localhost. Si MusicBrainz contacta con quien mantiene la app, el deployment debe mostrar un canal de contacto adecuado.

La portada se solicita al **Cover Art Archive** cuando el resultado incluye un lanzamiento asociado. Puede no existir y los derechos dependen de cada imagen y origen. En ese caso la interfaz y el vídeo usan su composición tipográfica alternativa. No se descarga ni reproduce la grabación original.

Límites de metadatos: MusicBrainz no siempre tiene año, lanzamiento, tags o portada; su búsqueda de recording tampoco entrega de manera fiable procedencia del artista ni condición vocal/instrumental. Por eso la ruleta solo filtra por época y género, y los resultados sin esos metadatos simplemente no coincidirán al aplicar el filtro correspondiente. El código no rellena valores inventándolos. El catálogo semilla ficticio anterior solo se conserva para reconocer datos locales de una versión previa; no se usa para nuevos sorteos.

Fuentes oficiales: [API de MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API), [búsqueda](https://musicbrainz.org/doc/MusicBrainz_API/Search), [rate limits y User-Agent](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting), [Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive/API) y [licencia de datos](https://musicbrainz.org/doc/About/Data_License).

## Números de Sunday Sample

El número de **Sunday Sample** sigue el ordinal del sorteo guardado en este navegador y también se usa para el MP4. No se comparte ni sincroniza con otros dispositivos.

## Cloudflare Pages

La app actual no necesita Supabase, secretos ni variables de entorno.

1. Sube el repositorio a GitHub o GitLab y conéctalo desde **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Selecciona el preset de Vite, rama de producción y configura **Build command** `npm run build` y **Build output directory** `dist` (directorio raíz del proyecto).
3. No añadas variables de Supabase, Spotify o YouTube. MusicBrainz no utiliza API key.
4. Despliega. Pages publica un origen HTTPS `*.pages.dev`; añade el dominio propio desde **Custom domains** si quieres.
5. `functions/api/musicbrainz.ts` se despliega como Pages Function (`/api/musicbrainz`). Cloudflare Pages proporciona el fallback SPA automáticamente cuando no hay un `404.html` de nivel superior; no añadas una regla `/* /index.html 200` porque Pages la detecta como un posible bucle.

Para ejecutar localmente el Function de Cloudflare además de la app, puedes probar el build con Wrangler (`npx wrangler pages dev dist`); el modo normal `npm run dev` utiliza el proxy de Vite. Pages Functions consumen las cuotas de Workers de tu cuenta; consulta sus límites actuales antes de abrir el sitio al público.

## Supabase (no se usa en esta versión)

No crees un proyecto Supabase para desplegar el modo personal actual. Se conserva `supabase/migrations/202610190001_initial_schema.sql` como punto de partida si más adelante quieres autenticación o sincronización compartida; ejecutar la migración por sí solo no conecta la app. La aplicación no solicita login ni lee variables de Supabase.

## Vídeo y solución de problemas

La exportación MP4 requiere `VideoEncoder`, `AudioEncoder`, H.264 y AAC vía WebCodecs. Está pensada para navegadores Chromium recientes en escritorio y HTTPS; no se garantiza compatibilidad universal y no se pudo probar la codificación en todos los dispositivos. El exportador comprueba soporte y muestra un error útil cuando falta. La generación es local y usa memoria durante seis segundos de vídeo. El audio contiene únicamente clics/tono de ruleta sintetizados y una señal de revelación, sin música protegida.

- Si MusicBrainz limita la llamada (503), espera un momento y vuelve a intentarlo; no pulses varias veces seguidas.
- Si no salen resultados, quita los filtros de época o género. MusicBrainz puede carecer de etiquetas o año.
- Si no aparece una portada, puede no estar en Cover Art Archive o el servidor puede impedir CORS; se usa la composición tipográfica.
- Los datos permanecen en el perfil del navegador. El historial se guarda en `localStorage`; borrar los datos del navegador también lo elimina.
- Si el navegador no puede exportar MP4, usa Chrome/Edge actualizado en escritorio. No se ha configurado renderizado remoto; requeriría infraestructura de servidor y proteger recursos temporales.

## Estructura

- `src/ui/`: aplicación y estilos.
- `src/model.ts`, `src/storage.ts`: lógica y estado local.
- `src/musicbrainz.ts`: proveedor y validación de grabaciones.
- `functions/api/musicbrainz.ts`: proxy de producción para Pages.
- `src/video.ts`: composición Canvas, WebCodecs MP4 y ficha PNG.
- `supabase/migrations/`: esquema futuro, no conectado al cliente actual.


## Anuncios Adsterra

Se han conectado los snippets proporcionados para un banner inferior de 728×90, una unidad nativa lateral y un banner lateral de 160×300, cada uno aislado en su propio iframe. El banner inferior queda fijo y se adapta a pantallas móviles; los laterales aparecen solo en pantallas de 1800 px o más para no tapar el contenido. Gestiona la aprobación y los códigos desde tu cuenta Adsterra; no reutilices un mismo código para varias ubicaciones.
