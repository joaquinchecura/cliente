export const dynamic = "force-dynamic";

import { getMyRoutines, getTodayProgress } from "@/app/actions/routines";
import { ProgressTracker } from "@/components/routines/progress-tracker";
import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Calendar, History } from "lucide-react";
import Link from "next/link";

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
        <h2 className="text-2xl font-bold text-foreground">🎯 Mi Rutina</h2>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Dumbbell className="mx-auto text-muted-foreground/40 mb-3" size={40} />
          <p className="text-muted-foreground">No tenés una rutina asignada.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Consultá con tu entrenador.</p>
        </div>
      </div>
    );
  }

  const routine = routines[0];

  // Obtener progreso de hoy para cada ejercicio
  const todayProgress = await getTodayProgress(routine.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">🎯 {routine.name}</h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground/70 mt-2">{routine.description}</p>
          )}
        </div>
        <Link href="/rutina/historial">
          <Button variant="outline" size="sm" className="gap-2">
            <History size={14} /> Historial
          </Button>
        </Link>
      </div>

      {/* Días */}
      <div className="space-y-4">
        {routine.days.map((day) => (
          <div key={day.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground flex items-center justify-between">
              <span>{day.dayName}</span>
              <span className="text-xs text-muted-foreground">{day.exercises.length} ejercicios</span>
            </div>
            <div className="divide-y divide-border">
              {day.exercises.map((re) => {
                const exerciseLogs = todayProgress.filter(
                  (log) => log.exerciseId === re.exerciseId
                );

                return (
                  <div key={re.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{re.exercise.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{re.exercise.type}</span>
                          {re.exercise.equipment && (
                            <span>• {re.exercise.equipment}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground shrink-0 ml-4">
                        <p>{re.sets} series x {re.reps}</p>
                        {re.rest && <p className="text-xs text-muted-foreground/60">{re.rest} descanso</p>}
                      </div>
                    </div>

                    <ProgressTracker
                      routineId={routine.id}
                      exerciseId={re.exerciseId}
                      exerciseName={re.exercise.name}
                      targetSets={re.sets}
                      targetReps={re.reps}
                      todayLogs={exerciseLogs.map((log) => ({
                        id: log.id,
                        setsCompleted: log.setsCompleted,
                        repsCompleted: log.repsCompleted,
                        weightUsed: Number(log.weightUsed),
                        notes: log.notes,
                        date: log.date.toISOString(),
                      }))}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}