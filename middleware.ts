import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentMember() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const member = await prisma.member.findUnique({
    where: { clerkUserId: user.id },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  if (!member) {
    redirect("/completar-perfil");
  }

  return member;
}