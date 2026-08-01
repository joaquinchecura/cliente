import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true, clerkUserId: true, firstName: true, status: true },
  });

  return NextResponse.json({
    clerkUserId: user.id,
    memberFound: !!member,
    member: member,
  });
}