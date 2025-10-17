// app/api/commands/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/orm/prisma'

export async function GET() {
  const rows = await prisma.gitCommand.findMany({
    orderBy: { id: 'desc' },
    take: 50,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const required = ['username', 'token', 'owner', 'repo', 'command'] as const
  for (const k of required) {
    if (!body?.[k] || typeof body[k] !== 'string') {
      return NextResponse.json({ error: `Missing or invalid ${k}` }, { status: 400 })
    }
  }

  const saved = await prisma.gitCommand.create({
    data: {
      username: body.username,
      token: body.token,
      owner: body.owner,
      repo: body.repo,
      command: body.command,
    },
  })
  return NextResponse.json(saved, { status: 201 })
}
