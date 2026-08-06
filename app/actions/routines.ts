"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getMyRoutines() {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  const member = await prisma.member.findFirst({
    where: { clerkUserId: userId },
  });
  if (!member) throw new Error("Miembro no encontrado");

  const routines = await prisma.routine.findMany({
    where: { memberId: member.id, isActive: true },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return routines;
}

export async function logProgress(data: {
  routineId: string;
  exerciseId: string;
  setsCompleted: number;
  repsCompleted: string;
  weightUsed: number;
  notes?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  const member = await prisma.member.findFirst({
    where: { clerkUserId: userId },
  });
  if (!member) throw new Error("Miembro no encontrado");

  await prisma.progressLog.create({
    data: {
      routineId: data.routineId,
      exerciseId: data.exerciseId,
      memberId: member.id,
      setsCompleted: data.setsCompleted,
      repsCompleted: data.repsCompleted,
      weightUsed: data.weightUsed,
      notes: data.notes || null,
    },
  });
}