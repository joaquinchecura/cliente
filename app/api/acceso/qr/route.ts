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

    // El User-Agent acá es el del celular del cliente (quien está generando su QR)
    const userAgent = request.headers.get('user-agent')
    const { deviceBrand, deviceModel, deviceOS } = parseDeviceInfo(userAgent)

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