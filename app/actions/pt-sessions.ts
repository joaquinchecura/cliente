'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function getMyPTSessions() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autenticado')

  const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
  if (!member) throw new Error('Miembro no encontrado')

  const bookings = await prisma.booking.findMany({
    where: {
      memberId: member.id,
      schedule: { maxCapacity: 1 },
    },
    include: {
      schedule: { include: { activity: true } },
    },
    orderBy: { schedule: { date: 'desc' } },
  })

  const now = new Date()
  const upcoming = bookings.filter(
    b => b.status === 'CONFIRMED' && new Date(b.schedule.date) >= new Date(now.toDateString())
  )
  const past = bookings.filter(
    b => b.status !== 'CONFIRMED' || new Date(b.schedule.date) < new Date(now.toDateString())
  )

  // Sesión activa: cuántas quedan del paquete
  const activeMembership = await prisma.membership.findFirst({
    where: { memberId: member.id, status: 'ACTIVE', classesRemaining: { not: null } },
    include: { plan: true },
    orderBy: { endDate: 'desc' },
  })

  return {
    upcoming,
    past,
    packageInfo: activeMembership
      ? {
          planName: activeMembership.plan.name,
          remaining: activeMembership.classesRemaining ?? 0,
          total: activeMembership.plan.classesIncluded,
          expiresAt: activeMembership.endDate,
        }
      : null,
  }
}