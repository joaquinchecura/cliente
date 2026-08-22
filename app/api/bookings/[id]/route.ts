import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { schedule: true },
    })

    if (!booking || booking.memberId !== member.id) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    // No permitir cancelar una clase que ya empezó
    const [h, m] = booking.schedule.startTime.split(':').map(Number)
    const classStart = new Date(booking.schedule.date)
    classStart.setHours(h, m, 0, 0)

    if (classStart.getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'No podés cancelar una clase que ya empezó' },
        { status: 400 }
      )
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}