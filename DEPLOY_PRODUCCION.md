# Deploy produccion Radio Labranza FM+

Arquitectura recomendada:

- Vercel: `apps/web` (Next.js).
- Oracle Cloud VM: API NestJS, PostgreSQL, uploads persistentes, Icecast, MediaMTX y Caddy con HTTPS.

## 1. DNS

Crear al menos un subdominio para la API:

- `api.tudominio.cl` -> IP publica de la VM Oracle.

El frontend puede quedar inicialmente en Vercel:

- `https://tu-proyecto.vercel.app`

Luego se puede agregar dominio propio.

## 2. Oracle Cloud

En la VM abrir puertos en Security List / NSG y firewall:

- `80/tcp` y `443/tcp`: HTTPS via Caddy.
- `1935/tcp`: RTMP para OBS hacia MediaMTX.
- `8000/tcp`: Icecast directo, opcional si usas proxy por Caddy.
- `8888/tcp`: HLS directo, opcional si usas `/hls` por Caddy.
- `8890/udp`: SRT, opcional.

Instalar Docker y Compose en la VM.

## 3. Variables de produccion Oracle

En la VM:

```bash
cp .env.production.example .env.production
```

Editar:

```env
POSTGRES_PASSWORD=...
JWT_SECRET=...
API_DOMAIN=api.tudominio.cl
WEB_ORIGIN=https://tu-proyecto.vercel.app
ICECAST_PUBLIC_URL=https://api.tudominio.cl/radio
MEDIAMTX_RTMP_URL=rtmp://api.tudominio.cl:1935
MEDIAMTX_HLS_URL=https://api.tudominio.cl/hls/tv/index.m3u8
```

No subir `.env.production` al repositorio.

## 4. Levantar backend en Oracle

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Verificar:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl https://api.tudominio.cl/health
```

Crear admin inicial:

```bash
curl -X POST https://api.tudominio.cl/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Administrador","email":"admin@radiolabranza.cl","password":"CAMBIA_ESTA_PASSWORD","role":"ADMIN"}'
```

## 5. Vercel

Crear proyecto apuntando al repositorio.

Configuracion recomendada:

- Root Directory: raiz del repo.
- Build Command: `npm run web:build`
- Install Command: `npm ci`
- Output Directory: `apps/web/.next`

Variables en Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.cl
NEXT_PUBLIC_TV_HLS_URL=https://api.tudominio.cl/hls/tv/index.m3u8
NEXT_PUBLIC_ICECAST_URL=https://api.tudominio.cl/radio
```

Despues de cambiar variables, redeploy.

## 6. OBS en produccion

En OBS:

- Server: `rtmp://api.tudominio.cl:1935`
- Stream Key: `tv`

HLS publico:

- `https://api.tudominio.cl/hls/tv/index.m3u8`

## 7. Imagenes subidas

Las imagenes subidas desde admin quedan en el volumen Docker `uploads_data`.

Backup minimo:

```bash
docker run --rm -v radio_uploads_data:/data -v "$PWD/backups:/backup" alpine tar czf /backup/uploads.tar.gz /data
docker exec radio_labranza_postgres pg_dump -U radio_labranza radio_labranza > backups/db.sql
```

## 8. Checklist antes de publicar

- Cambiar `JWT_SECRET`.
- Cambiar password del admin.
- Cambiar passwords de Icecast en `infra/icecast/icecast.xml`.
- Revisar `WEB_ORIGIN` con URL real de Vercel.
- Confirmar `curl https://api.tudominio.cl/health`.
- Confirmar login en `/admin`.
- Confirmar subida de imagen en Noticias.
- Confirmar OBS -> MediaMTX -> HLS.
