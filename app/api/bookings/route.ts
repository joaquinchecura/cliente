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
    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId requerido' }, { status: 400 })
    }

    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bookings: { where: { status: 'CONFIRMED' } } },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }
    if (schedule.isCancelled) {
      return NextResponse.json({ error: 'Esta clase fue cancelada' }, { status: 400 })
    }
    if (schedule.bookings.length >= schedule.maxCapacity) {
      return NextResponse.json({ error: 'La clase está completa' }, { status: 400 })
    }

    // Evitar duplicados (además de la unique constraint del schema)
    const existing = await prisma.booking.findFirst({
      where: { memberId: member.id, scheduleId, status: 'CONFIRMED' },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ya estás anotado en esta clase' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: { memberId: member.id, scheduleId, status: 'CONFIRMED' },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya estás anotado en esta clase' }, { status: 400 })
    }
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}