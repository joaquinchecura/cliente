export const dynamic = "force-dynamic";

import { getMyRoutines } from "@/app/actions/routines";
import { Dumbbell, Target, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const goals: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia",
  STRENGTH: "Fuerza",
  ENDURANCE: "Resistencia",
  WEIGHT_LOSS: "Pérdida de peso",
  MAINTENANCE: "Mantenimiento",
  REHABILITATION: "Rehabilitación",
};

export default async function RutinaPage() {
  const routines = await getMyRoutines();

  if (routines.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">🎯 Mi Rutina</h2>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Dumbbell className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">No tenés una rutina asignada.</p>
          <p className="text-sm text-slate-400 mt-1">Consultá con tu entrenador.</p>
        </div>
      </div>
    );
  }

  const routine = routines[0]; // La rutina activa más reciente

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">🎯 {routine.name}</h2>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
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
        {routine.description && (
          <p className="text-sm text-slate-500 mt-2">{routine.description}</p>
        )}
      </div>

      {/* Días */}
      <div className="space-y-4">
        {routine.days.map((day) => (
          <Card key={day.id} className="bg-white border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 flex items-center justify-between border-b border-slate-100">
              <span>{day.dayName}</span>
              <span className="text-xs text-slate-500">{day.exercises.length} ejercicios</span>
            </div>
            <div className="divide-y divide-slate-100">
              {day.exercises.map((re) => (
                <div key={re.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{re.exercise.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{re.exercise.type}</span>
                      {re.exercise.equipment && (
                        <span>• {re.exercise.equipment}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-600 shrink-0 ml-4">
                    <p>{re.sets} series x {re.reps}</p>
                    {re.rest && <p className="text-xs text-slate-400">{re.rest} descanso</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}