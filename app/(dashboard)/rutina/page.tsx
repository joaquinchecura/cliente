export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { Dumbbell, Target, Calendar, Tag } from "lucide-react";

const goals: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia",
  STRENGTH: "Fuerza",
  ENDURANCE: "Resistencia",
  WEIGHT_LOSS: "Pérdida de peso",
  MAINTENANCE: "Mantenimiento",
  REHABILITATION: "Rehabilitación",
};

const exerciseTypeLabels: Record<string, string> = {
  STRENGTH: "Fuerza",
  CARDIO: "Cardio",
  FUNCTIONAL: "Funcional",
  MOBILITY: "Movilidad",
  STRETCHING: "Estiramiento",
  PLYOMETRIC: "Pliometría",
  BALANCE: "Equilibrio",
  TECHNIQUE: "Técnica",
  WARMUP: "Calentamiento",
  COOLDOWN: "Vuelta a la calma",
  OTHER: "Otro",
};

export default async function RutinaPage() {
  const member = await getCurrentMember();

  const routine = await prisma.routine.findFirst({
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
  });

  if (!routine) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">🎯 Mi Rutina</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <Dumbbell className="mx-auto text-zinc-600 mb-3" size={40} />
          <p className="text-zinc-400">No tenés una rutina asignada.</p>
          <p className="text-sm text-zinc-600 mt-1">Consultá con tu entrenador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">🎯 {routine.name}</h2>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-400">
          {routine.goal && (
            <span className="flex items-center gap-1">
              <Target size={14} /> {goals[routine.goal]}
            </span>
          )}
          {routine.frequencyPerWeek && (
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {routine.frequencyPerWeek} días/semana
            </span>
          )}
        </div>
        {routine.notes && <p className="text-sm text-zinc-500 mt-2">{routine.notes}</p>}
      </div>

      {/* Días */}
      <div className="space-y-4">
        {routine.days.map((day) => (
          <div key={day.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 flex items-center justify-between">
              <span>{day.dayName}</span>
              <span className="text-xs text-zinc-500">{day.exercises.length} ejercicios</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {day.exercises.map((re) => (
                <div key={re.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{re.exercise.name}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span>{exerciseTypeLabels[re.exercise.type] || re.exercise.type}</span>
                      {re.exercise.equipment && (
                        <span>• {re.exercise.equipment}</span>
                      )}
                      {re.exercise.tags.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Tag size={10} />
                          {re.exercise.tags.slice(0, 2).join(", ")}
                          {re.exercise.tags.length > 2 && "..."}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-zinc-400 shrink-0 ml-4">
                    <p>{re.sets} series x {re.reps}</p>
                    {re.rest && <p className="text-xs text-zinc-600">{re.rest} descanso</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}