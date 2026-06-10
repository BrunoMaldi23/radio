# Operacion local Radio Labranza FM+

## Arranque diario

```powershell
cd C:\Bruno\Proyectos\radio
npm run local:stream
npm run api:dev
npm run web:dev
```

En otra terminal:

```powershell
npm run local:check
```

## OBS Studio

- Service: `Custom`
- Server: `rtmp://localhost:1935`
- Stream Key: `tv`
- Video recomendado: 1280x720 o 1920x1080, 4500 Kbps, keyframe cada 2 segundos
- Audio recomendado: AAC, 160 Kbps, 48 kHz

La senal queda en:

- HLS: `http://localhost:8888/tv/index.m3u8`
- Web: `http://localhost:3000/tv`
- Admin: `http://localhost:3000/admin/transmision`

## Icecast

- Admin: `http://localhost:8000/admin/`
- Usuario admin: `admin`
- Password admin dev: configurar en `.env`
- Mount radio: `/radio`
- Source user: `source`
- Source password dev: configurar en `.env`

Icecast mostrara "Sin monturas" hasta que un encoder publique audio en `/radio`.

## Estado esperado

`npm run local:check` debe mostrar OK en:

- Web
- API health
- API profiles
- API runtime
- Icecast
- MediaMTX API

`MediaMTX HLS tv` solo queda OK cuando OBS esta transmitiendo.

## Apagado

```powershell
npm run local:stream:stop
```

Tambien puedes detener `api:dev` y `web:dev` con `Ctrl+C`.
