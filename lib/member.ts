import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function getCurrentMember() {
  const user = await currentUser();
  
  // Si no hay usuario de Clerk, el middleware ya debería haber redirigido
  // Pero por si acaso, no redirigimos acá, dejamos que falle o manejemos
  if (!user) {
    throw new Error("No autenticado");
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

  // Si no existe el member en la DB, redirigir a completar perfil
  if (!member) {
    redirect("/completar-perfil");
  }

  return member;
}