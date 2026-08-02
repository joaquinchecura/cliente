import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scheduleId } = await request.json()

    // Verificar que el member pertenece al usuario
    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verificar que la clase existe y tiene cupo
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bookings: { where: { status: 'CONFIRMED' } } },
    })
    if (!schedule) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }
    if (schedule.bookings.length >= schedule.maxCapacity) {
      return NextResponse.json({ error: 'Cupo completo' }, { status: 400 })
    }

    // Verificar que no ya reservó
    const existing = await prisma.booking.findFirst({
      where: { memberId: member.id, scheduleId, status: 'CONFIRMED' },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ya tenés una reserva para esta clase' }, { status: 400 })
    }

    // Crear reserva
    const booking = await prisma.booking.create({
      data: {
        memberId: member.id,
        scheduleId,
        status: 'CONFIRMED',
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}