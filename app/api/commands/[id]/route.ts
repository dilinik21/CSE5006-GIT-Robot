export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';

function parseId(params: { id?: string }) {
  const idNum = Number(params?.id);
  if (!params?.id || Number.isNaN(idNum) || idNum <= 0) return null;
  return idNum;
}

function pickOrm(reqOrm?: string) {
  const fromEnv = process.env.ORM_PROVIDER || 'prisma';
  return (reqOrm || fromEnv).toLowerCase() === 'sequelize' ? 'sequelize' : 'prisma';
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params);
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const { prisma } = await import('@/lib/orm/prisma'); // lazy
    const row = await prisma.gitCommand.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/commands/:id error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params);
    if (!id) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });

    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};
    const { username, owner, repo, command, orm } = body;
    const use = pickOrm(orm);

    const data: any = {};
    if (typeof username === 'string') data.username = username;
    if (typeof owner === 'string') data.owner = owner;
    if (typeof repo === 'string') data.repo = repo;
    if (typeof command === 'string') data.command = command;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    let updated: any;
    if (use === 'sequelize') {
      const { initSequelizeModels, GitCommandSequelize } = await import('@/lib/orm/sequelize');
      await initSequelizeModels();
      const [count] = await GitCommandSequelize.update(data, { where: { id } });
      if (count === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      updated = await GitCommandSequelize.findByPk(id);
    } else {
      const { prisma } = await import('@/lib/orm/prisma');
      updated = await prisma.gitCommand.update({ where: { id }, data });
    }

    return NextResponse.json({ success: true, orm: use, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('PUT /api/commands/:id error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await req.text().catch(() => '');
    const body = raw ? JSON.parse(raw) : {};
    const use = pickOrm(body?.orm);

    const id = parseId(params);
    if (!id) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });

    if (use === 'sequelize') {
      const { initSequelizeModels, GitCommandSequelize } = await import('@/lib/orm/sequelize');
      await initSequelizeModels();
      const count = await GitCommandSequelize.destroy({ where: { id } });
      if (count === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, orm: use, deleted: id });
    } else {
      const { prisma } = await import('@/lib/orm/prisma');
      await prisma.gitCommand.delete({ where: { id } });
      return NextResponse.json({ success: true, orm: use, deleted: id });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('DELETE /api/commands/:id error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
