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

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Generar token único
    const token = randomBytes(32).toString('hex')

    // Guardar en attendance como QR pendiente
    // Primero invalidar tokens anteriores del mismo member
    await prisma.attendance.updateMany({
      where: { memberId: member.id, status: 'ALLOWED' },
      data: { status: 'DENIED' },
    })

    // Crear nuevo attendance con token fresco
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        qrToken: token,
        status: 'ALLOWED',
      },
    })

    return NextResponse.json({ 
      token, 
      attendanceId: attendance.id,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutos (solo informativo)
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}