# Radio Labranza FM+ Platform

Base full-stack para una plataforma web multimedia de radio y TV digital en vivo.

## Estructura

- `apps/web`: Next.js App Router con Tailwind CSS, componentes estilo Shadcn/ui y Zustand para estado global de reproductores.
- `apps/api`: API NestJS modular preparada como referencia para WebSockets, Prisma y servicios en tiempo real.
- `prisma`: schema y seed compartidos.

## Vistas creadas

- `/`: portada operativa con video HLS simulado y reproductor global persistente.
- `/ranking`: ranking de canciones con votos y video flotante tipo Picture-in-Picture.
- `/tv`: senal principal de TV en vivo.
- `/noticias`, `/lo-nuevo`, `/mejores-momentos`, `/programas`, `/concursos`, `/frecuencia`: secciones publicas estilo radio digital.
- `/admin`: panel para crear noticias, programas y canciones del ranking.
- `/admin/noticias/nueva`: panel CMS para crear noticias con sidebar, dropzone y editor enriquecido simulado.
- `/admin/transmision`: panel para Icecast, HLS, relays, metadata, webhooks y monitoreo.

## Direcciones locales

- Web publica: `http://localhost:3000`
- Panel admin: `http://localhost:3000/admin`
- Panel transmision: `http://localhost:3000/admin/transmision`
- TV en vivo: `http://localhost:3000/tv`
- API: `http://localhost:3001`
- API health: `http://localhost:3001/health`
- Icecast: `http://localhost:8000`
- MediaMTX API: `http://localhost:9997/v3/paths/list`

Admin local:

- Email: `admin@radiolabranza.cl`
- Password: `Password123!`

## Arranque

1. Copiar `.env.example` a `.env`.
2. Instalar dependencias con `npm install`.
3. Ejecutar `npm run prisma:generate`.
4. Levantar servicios locales: `docker compose up -d postgres icecast mediamtx`.
5. Ejecutar `npm run prisma:migrate -- --name init`.
6. Ejecutar `npm run prisma:seed`.
7. API: `npm run api:dev`.
8. Web: `npm run web:dev`.

En Windows, usando las instalaciones locales de Icecast y MediaMTX:

```powershell
npm run local:stream
npm run api:dev
npm run web:dev
npm run local:check
```

Guia operativa completa: `OPERACION_LOCAL.md`.

## Prueba de transmision local

### Video con OBS Studio y MediaMTX

1. Abrir OBS Studio.
2. Ir a `Settings > Stream`.
3. Service: `Custom`.
4. Server: `rtmp://localhost:1935`.
5. Stream Key: `tv`.
6. Output recomendado: 1080p, 4500 Kbps video, AAC 160 Kbps audio, keyframe cada 2 segundos.
7. Iniciar transmision.
8. Abrir `http://localhost:8888/tv/index.m3u8` o la ruta `/tv` de la web.

### Audio con Icecast

Icecast local queda en:

- Player: `http://localhost:8000/radio`
- Admin: `http://localhost:8000/admin/`
- Usuario source: `source`
- Password source dev: `hackme-source`
- Usuario admin: `admin`
- Password admin dev: `hackme-admin`

Ejemplo FFmpeg:

```powershell
ffmpeg -re -i input.mp3 -content_type audio/mpeg -f mp3 icecast://source:hackme-source@localhost:8000/radio
```

## Backend

La API NestJS incluye modulos reales para:

- `GET /streaming`: configuracion completa de servidores, mounts, relays y metadata.
- `GET /streaming/ingest-profiles`: parametros para OBS Studio, MediaMTX, Icecast y FFmpeg.
- `GET /streaming/runtime-status`: estado real de MediaMTX, HLS e Icecast para el panel admin.
- `GET /health`: health check de API y DB.
- `POST /streaming/metadata`: actualiza tema/artista y emite `stream.metadata` por Socket.io.
- `POST /streaming/mounts/:id/status`: recibe health checks de Icecast/encoder y emite `stream.status`.
- `GET /articles`, `POST /articles`, `PATCH /articles/:id`: CMS de noticias.
- `GET /programs`, `POST /programs`, `PATCH /programs/:id`: parrilla/programas.
- `GET /ranking`, `POST /ranking/:id/vote`: ranking con votos y evento `ranking.updated`.

Las rutas administrativas usan JWT y roles (`ADMIN`, `OPERATOR`, `EDITOR`). Las referencias de contrasenas de streaming se guardan como `secret://...` para integrarlas con un vault o gestor de secretos.
