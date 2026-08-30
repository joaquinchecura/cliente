import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '') // 1-12

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: 'year y month (1-12) son requeridos' }, { status: 400 })
    }

    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    // Rango del mes en UTC (mismo criterio que usa el resto de la app para Schedule.date)
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1)) // primer día del mes siguiente (límite exclusivo)

    const bookings = await prisma.booking.findMany({
      where: {
        memberId: member.id,
        schedule: { date: { gte: start, lt: end } },
      },
      include: {
        schedule: { include: { activity: true } },
      },
      orderBy: { schedule: { date: 'asc' } },
    })

    const sessions = bookings.map(b => ({
      id: b.id,
      status: b.status, // CONFIRMED | COMPLETED | NO_SHOW | CANCELLED
      date: b.schedule.date.toISOString().split('T')[0],
      startTime: b.schedule.startTime,
      endTime: b.schedule.endTime,
      room: b.schedule.room,
      activityName: b.schedule.activity.name,
      activityType: b.schedule.activity.type, // GROUP | PERSONAL
      isCancelledSchedule: b.schedule.isCancelled,
    }))

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching calendar sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}