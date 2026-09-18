import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const attendanceId = searchParams.get('attendanceId')

  if (!attendanceId) {
    return NextResponse.json({ error: 'Falta attendanceId' }, { status: 400 })
  }

  const attendance = await prisma.attendance.findFirst({
    where: {
      id: attendanceId,
      member: { clerkUserId: userId },
    },
    select: { status: true },
  })

  return NextResponse.json({ status: attendance?.status ?? 'UNKNOWN' })
}