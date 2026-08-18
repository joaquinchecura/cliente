import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

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