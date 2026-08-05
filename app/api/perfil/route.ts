import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const allowedFields = ['phone', 'email', 'address', 'city', 'birthDate', 'emergencyContactName', 'emergencyContactPhone']
    const updateData: Record<string, any> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const member = await prisma.member.update({
      where: { clerkUserId: userId },
      data: updateData,
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}