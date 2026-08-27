import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { parseDeviceInfo } from '@/lib/parseDevice'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Fallback: parseo del User-Agent (siempre disponible, pero da "K" en vez de modelo real en Android)
    const userAgent = request.headers.get('user-agent')
    const fallback = parseDeviceInfo(userAgent)

    // Fuente principal: Client Hints mandados por el navegador (marca/modelo reales, solo Chrome/Android)
    let clientHints: any = null
    try {
      const body = await request.json()
      clientHints = body?.clientHints || null
    } catch {
      // sin body (o no es JSON) — seguimos solo con el fallback
    }

    const deviceBrand = clientHints?.brand || fallback.deviceBrand
    const deviceModel = clientHints?.model || fallback.deviceModel
    const deviceOS = clientHints?.platform && clientHints?.platformVersion
      ? `${clientHints.platform} ${clientHints.platformVersion}`
      : fallback.deviceOS

    const token = randomBytes(32).toString('hex')

    // Invalidar QRs pendientes anteriores del mismo member (no los ALLOWED —
    // esos ya fueron escaneados y son historial real, no se tocan)
    await prisma.attendance.updateMany({
      where: { memberId: member.id, status: 'PENDING' },
      data: { status: 'DENIED' },
    })

    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        qrToken: token,
        status: 'PENDING',
        userAgent,
        deviceBrand,
        deviceModel,
        deviceOS,
      },
    })

    return NextResponse.json({
      token,
      attendanceId: attendance.id,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}