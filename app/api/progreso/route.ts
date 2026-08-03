import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const records = await prisma.bodyComposition.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const data = await request.json()

    // Calcular BMI si hay peso y altura
    let bmi = null
    if (data.weight && data.height) {
      const weightKg = Number(data.weight)
      const heightM = Number(data.height) / 100
      bmi = Number((weightKg / (heightM * heightM)).toFixed(2))
    }

    const record = await prisma.bodyComposition.create({
      data: {
        memberId: member.id,
        weight: data.weight,
        height: data.height || null,
        bmi,
        bodyFatPercent: data.bodyFatPercent || null,
        musclePercent: data.musclePercent || null,
        waterPercent: data.waterPercent || null,
        visceralFat: data.visceralFat || null,
        basalMetabolism: data.basalMetabolism || null,
        metabolicAge: data.metabolicAge || null,
        waist: data.waist || null,
        hip: data.hip || null,
        arm: data.arm || null,
        chest: data.chest || null,
        targetWeight: data.targetWeight || null,
        notes: data.notes || null,
        recordedBy: 'self',
      },
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}