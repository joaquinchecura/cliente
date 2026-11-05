import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function getCurrentMember() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const member = await prisma.member.findUnique({
    where: { clerkUserId: user.id },
    include: {
      organization: { select: { status: true } },
      memberships: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  // Si no existe el member en la DB, redirigir a completar perfil
  if (!member) redirect("/completar-perfil");

  // Sin gimnasio asignado, o gimnasio no habilitado
  if (!member.organizationId || member.organization?.status !== "ACTIVE") {
    redirect("/cuenta-suspendida");
  }

  return member;
}