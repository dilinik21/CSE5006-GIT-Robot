import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/orm/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, owner, repo, command } = body  // ✅ repo here

    const required = ['username','owner','repo','command'] as const
    for (const k of required) {
      if (!body?.[k] || typeof body[k] !== 'string') {
        return NextResponse.json({ success:false, error:`Missing or invalid ${k}` }, { status: 400 })
      }
    }

    const saved = await prisma.gitCommand.create({
      data: {
        username,
        owner,
        repo,             // ✅ repo saved
        command,
        token: '***',     // 🚫 never store real tokens
      },
    })
    return NextResponse.json({ success:true, data:saved }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/commands error:', msg)
    return NextResponse.json({ success:false, error: msg }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rows = await prisma.gitCommand.findMany({ orderBy: { id: 'desc' }, take: 50 })
    return NextResponse.json(rows)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/commands error:', msg)
    return NextResponse.json({ success:false, error: msg }, { status: 500 })
  }
}
