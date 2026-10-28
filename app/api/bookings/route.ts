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

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    })
    if (!member) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    // Validar membresía activa
    const membership = member.memberships[0]
    if (!membership) {
      return NextResponse.json({ error: 'No tenés una membresía activa para reservar' }, { status: 403 })
    }
    if (membership.endDate < new Date()) {
      return NextResponse.json({ error: 'Tu membresía venció' }, { status: 403 })
    }

    // Validar clases restantes si el plan tiene límite
    if (membership.plan.classesIncluded > 0) {
      if (membership.classesRemaining !== null && membership.classesRemaining <= 0) {
        return NextResponse.json({ error: 'No te quedan clases disponibles en tu plan' }, { status: 403 })
      }
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

    // Evitar duplicados
    const existing = await prisma.booking.findFirst({
      where: { memberId: member.id, scheduleId, status: 'CONFIRMED' },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ya estás anotado en esta clase' }, { status: 400 })
    }

    // 👇 TRANSACCIÓN: crear reserva Y descontar clase
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          memberId: member.id,
          scheduleId,
          status: 'CONFIRMED',
          organizationId: member.organizationId ?? undefined, // 👈 CRÍTICO para que MANAGER lo vea
        },
      })

      // Descontar clase si el plan tiene límite
      if (membership.plan.classesIncluded > 0 && membership.classesRemaining !== null) {
        await tx.membership.update({
          where: { id: membership.id },
          data: { classesRemaining: { decrement: 1 } },
        })
      }

      return newBooking
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