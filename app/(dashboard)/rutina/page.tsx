export const dynamic = "force-dynamic";

import { getMyRoutines, getTodayProgress } from "@/app/actions/routines";
import { ProgressTracker } from "@/components/routines/progress-tracker";
import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Calendar, History, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const goals: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia",
  STRENGTH: "Fuerza",
  ENDURANCE: "Resistencia",
  WEIGHT_LOSS: "Pérdida de peso",
  MAINTENANCE: "Mantenimiento",
  REHABILITATION: "Rehabilitación",
};

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function RutinaPage() {
  const routines = await getMyRoutines();

  if (routines.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Dumbbell className="text-muted-foreground/30" size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Sin rutina asignada</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Todavía no tenés una rutina activa. Consultá con tu entrenador para que te asigne una.
        </p>
      </div>
    );
  }

  const routine = routines[0];
  const todayProgress = await getTodayProgress(routine.id);

  // Calcular estadísticas
  const totalExercises = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const completedExercises = new Set(todayProgress.map((log) => log.exerciseId)).size;
  const today = new Date().getDay();
  const todayName = DAYS[today];

  // Encontrar el día de hoy o el primero
  const todayDay = routine.days.find((d) =>
    d.dayName.toLowerCase().includes(todayName.toLowerCase())
  );
  const activeDay = todayDay || routine.days[0];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header con stats */}
      <div className="space-y-4">
        {/* Título y acciones */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{routine.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {routine.goal && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  <Target size={12} />
                  {goals[routine.goal]}
                </span>
              )}
              {routine.frequencyPerWeek && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  <Calendar size={12} />
                  {routine.frequencyPerWeek} días/semana
                </span>
              )}
            </div>
          </div>
          <Link href="/rutina/historial">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <History size={14} />
              <span className="hidden sm:inline">Historial</span>
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border/60 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Flame size={16} className="text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{completedExercises}</p>
            <p className="text-[10px] text-muted-foreground">Ejercicios hoy</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
              <Trophy size={16} className="text-amber-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{totalExercises}</p>
            <p className="text-[10px] text-muted-foreground">Total ejercicios</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <Dumbbell size={16} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {todayProgress.reduce((sum, log) => sum + log.setsCompleted, 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Series hoy</p>
          </div>
        </div>

        {routine.description && (
          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
            {routine.description}
          </p>
        )}
      </div>

      {/* Selector de días */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Días de entrenamiento
          </h3>
          <span className="text-xs text-muted-foreground">
            {routine.days.length} días
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {routine.days.map((day) => {
            const isToday = day.dayName.toLowerCase().includes(todayName.toLowerCase());
            const isActive = day.id === activeDay.id;
            const dayProgress = day.exercises.filter((ex) =>
              todayProgress.some((log) => log.exerciseId === ex.exerciseId)
            ).length;
            const dayCompleted = dayProgress >= day.exercises.length && day.exercises.length > 0;

            return (
              <button
                key={day.id}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all shrink-0",
                  isActive
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : "bg-card border-border/60 hover:border-border",
                  dayCompleted && !isActive && "border-emerald-500/20 bg-emerald-500/5"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {day.dayName}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {day.exercises.length} ej.
                </span>
                {dayCompleted && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ejercicios del día activo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            {activeDay.dayName}
          </h3>
          <span className="text-xs text-muted-foreground">
            {activeDay.exercises.length} ejercicios
          </span>
        </div>

        <div className="space-y-3">
          {activeDay.exercises.map((re) => {
            const exerciseLogs = todayProgress.filter(
              (log) => log.exerciseId === re.exerciseId
            );

            // ✅ MAPEAMOS el exercise para que tenga los campos correctos
            const exercise = {
              id: re.exercise.id,
              name: re.exercise.name,
              type: re.exercise.type,
              description: re.exercise.description || undefined,
              muscleGroup: re.exercise.muscleGroup || undefined,
              equipment: re.exercise.equipment || undefined,
              videoUrl: re.exercise.videoUrl || undefined,
              imageUrl: re.exercise.imageUrl || undefined,
              tags: re.exercise.tags || [],
              createdAt: re.exercise.createdAt?.toISOString?.() || undefined,
            };

            return (
              <ProgressTracker
                key={re.id}
                routineId={routine.id}
                exerciseId={re.exerciseId}
                exercise={exercise}
                targetSets={re.sets}
                targetReps={re.reps}
                rest={re.rest || undefined}
                notes={re.notes || undefined}
                todayLogs={exerciseLogs.map((log) => ({
                  id: log.id,
                  setsCompleted: log.setsCompleted,
                  repsCompleted: log.repsCompleted,
                  weightUsed: Number(log.weightUsed),
                  notes: log.notes,
                  date: log.date.toISOString(),
                }))}
              />
            );
          })}
        </div>
      </div>

      {/* Botón flotante para historial en mobile */}
      <div className="fixed bottom-6 right-4 sm:hidden">
        <Link href="/rutina/historial">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <History size={20} />
          </Button>
        </Link>
      </div>
    </div>
  );
}