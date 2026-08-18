// app/api/acceso/estado/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const attendanceId = searchParams.get('attendanceId')

  if (!attendanceId) {
    return NextResponse.json({ error: 'Falta attendanceId' }, { status: 400 })
  }

  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    select: { status: true },
  })

  return NextResponse.json({ status: attendance?.status ?? 'UNKNOWN' })
}