export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';

function pickOrm(reqOrm?: string) {
  const fromEnv = process.env.ORM_PROVIDER || 'prisma';
  return (reqOrm || fromEnv).toLowerCase() === 'sequelize' ? 'sequelize' : 'prisma';
}

export async function GET() {
  try {
    const { prisma } = await import('@/lib/orm/prisma');

    try {
      const rows = await prisma.gitCommand.findMany({
        orderBy: { id: 'desc' },
        take: 100,
      });
      return NextResponse.json(rows);
    } catch {
      // fallback: coerce odd createdAt values (integer/real) to ISO text
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          id,
          username,
          token,
          owner,
          repo,
          command,
          CASE
            WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt/1000, 'unixepoch')
            WHEN typeof(createdAt) = 'real'    THEN datetime(createdAt/1000, 'unixepoch')
            WHEN typeof(createdAt) = 'text'    THEN createdAt
            ELSE datetime('now')
          END AS createdAt
        FROM GitCommand
        ORDER BY id DESC
        LIMIT 100
      `);
      return NextResponse.json(rows);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/commands error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};
    const { username, owner, repo, command, orm } = body;

    for (const [k, v] of Object.entries({ username, owner, repo, command })) {
      if (!v || typeof v !== 'string') {
        return NextResponse.json({ success: false, error: `Missing or invalid ${k}` }, { status: 400 });
      }
    }

    const use = pickOrm(orm);
    let saved: any;

    if (use === 'sequelize') {
      // 👇 lazy import sequelize side (prevents bundling/exec at build)
      const { initSequelizeModels, GitCommandSequelize } = await import('@/lib/orm/sequelize');
      await initSequelizeModels();
      saved = await GitCommandSequelize.create({
        username, owner, repo, command, token: '***',
      });
    } else {
      const { prisma } = await import('@/lib/orm/prisma');
      saved = await prisma.gitCommand.create({
        data: { username, owner, repo, command, token: '***' },
      });
    }

    return NextResponse.json({ success: true, orm: use, data: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/commands error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
