import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const org = request.nextUrl.searchParams.get('org')

  if (!org) {
    return NextResponse.redirect(new URL('/registro-invalido', request.url))
  }

  const organization = await prisma.organization.findUnique({
    where: { id: org },
    select: { status: true },
  })

  if (!organization || organization.status !== 'ACTIVE') {
    return NextResponse.redirect(new URL('/registro-invalido', request.url))
  }

  const response = NextResponse.redirect(new URL('/sign-up', request.url))
  response.cookies.set('pending_org', org, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 3, // 1 hora
    path: '/',
  })

  return response
}