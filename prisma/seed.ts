import { MountStatus, PrismaClient, Role, StreamProtocol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@radiolabranza.cl' },
    update: { name: 'Administrador Radio Labranza', role: Role.ADMIN, password },
    create: {
      name: 'Administrador Radio Labranza',
      email: 'admin@radiolabranza.cl',
      password,
      role: Role.ADMIN
    }
  });

  const server = await prisma.streamServer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Icecast Principal',
      protocol: StreamProtocol.ICECAST,
      publicHost: 'stream.radiolabranza.cl',
      internalHost: 'icecast',
      port: 8000,
      tlsEnabled: true,
      sourceUsername: 'source',
      sourcePasswordRef: 'secret://radio/icecast/source',
      adminUsername: 'admin',
      adminPasswordRef: 'secret://radio/icecast/admin',
      encoder: 'Liquidsoap',
      codec: 'AAC',
      bitrateKbps: 192,
      fallbackPlaylist: 'Auto DJ Labranza',
      isPrimary: true
    }
  });

  await prisma.streamMount.upsert({
    where: { serverId_path: { serverId: server.id, path: '/radio' } },
    update: {},
    create: {
      serverId: server.id,
      path: '/radio',
      displayName: 'Radio Labranza FM+',
      format: 'AAC',
      bitrateKbps: 192,
      status: MountStatus.STANDBY,
      listeners: 0,
      publicUrl: 'https://stream.radiolabranza.cl/radio',
      hlsUrl: 'https://cdn.radiolabranza.cl/live/radio.m3u8',
      isDefault: true
    }
  });

  await prisma.streamRelay.createMany({
    data: [
      {
        serverId: server.id,
        region: 'Santiago',
        url: 'https://stream.radiolabranza.cl/radio',
        latencyMs: 0
      },
      {
        serverId: server.id,
        region: 'Backup CDN',
        url: 'https://cdn.radiolabranza.cl/live/radio.m3u8',
        latencyMs: 0
      }
    ],
    skipDuplicates: true
  });

  const mediaMtx = await prisma.streamServer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'MediaMTX TV',
      protocol: StreamProtocol.RTMP,
      publicHost: 'localhost',
      internalHost: 'mediamtx',
      port: 1935,
      tlsEnabled: false,
      sourceUsername: 'publisher',
      sourcePasswordRef: 'secret://radio/mediamtx/publish',
      adminUsername: 'api',
      adminPasswordRef: 'secret://radio/mediamtx/api',
      encoder: 'OBS Studio',
      codec: 'H264/AAC',
      bitrateKbps: 4500,
      fallbackPlaylist: 'TV holding slate',
      isPrimary: false
    }
  });

  await prisma.streamMount.upsert({
    where: { serverId_path: { serverId: mediaMtx.id, path: '/tv' } },
    update: {},
    create: {
      serverId: mediaMtx.id,
      path: '/tv',
      displayName: 'Radio Labranza FM+ TV',
      format: 'HLS',
      bitrateKbps: 4500,
      status: MountStatus.STANDBY,
      listeners: 0,
      publicUrl: 'rtmp://localhost:1935/tv',
      hlsUrl: 'http://localhost:8888/tv/index.m3u8',
      isDefault: false
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
