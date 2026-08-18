"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getTodayProgress(routineId: string, date?: Date) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  const member = await prisma.member.findFirst({ where: { clerkUserId: userId } })
  if (!member) throw new Error("Miembro no encontrado")

  const TZ = 'America/Argentina/Buenos_Aires'
  const now = date || new Date()
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: TZ }) // "2026-08-18"
  const startOfDay = new Date(`${dateStr}T00:00:00-03:00`)
  const endOfDay   = new Date(`${dateStr}T23:59:59-03:00`)

  return prisma.progressLog.findMany({
    where: {
      routineId,
      memberId: member.id,
      date: { gte: startOfDay, lte: endOfDay },
    },
    select: {
      id: true, exerciseId: true, setsCompleted: true,
      repsCompleted: true, weightUsed: true, notes: true, date: true,
    },
  })
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

  const log = await prisma.progressLog.create({
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

  revalidatePath("/rutina");
  return log;
}

export async function deleteProgressLog(logId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  await prisma.progressLog.delete({
    where: { id: logId },
  });

  revalidatePath("/rutina");
}

export async function getProgressHistory(days: number = 30) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  const member = await prisma.member.findFirst({
    where: { clerkUserId: userId },
  });
  if (!member) throw new Error("Miembro no encontrado");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.progressLog.findMany({
      where: { memberId: member.id, date: { gte: startDate } },
      include: {
        exercise: {
          select: { id: true, name: true, type: true, muscleGroup: true },
        },
      },
      orderBy: { date: "desc" },
    });

  return logs;
}

export async function getExerciseProgress(exerciseId: string, days: number = 90) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  const member = await prisma.member.findFirst({
    where: { clerkUserId: userId },
  });
  if (!member) throw new Error("Miembro no encontrado");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.progressLog.findMany({
    where: {
      memberId: member.id,
      exerciseId,
      date: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      setsCompleted: true,
      repsCompleted: true,
      weightUsed: true,
      notes: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  return logs;
}