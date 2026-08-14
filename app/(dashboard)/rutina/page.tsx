export const dynamic = "force-dynamic";

import { getMyRoutines, getTodayProgress } from "@/app/actions/routines";
import { ProgressTracker } from "@/components/routines/progress-tracker";
import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Calendar, History, Flame, Trophy, ChevronRight } from "lucide-react";
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

  // Calcular estadísticas GLOBALES (todos los días)
  const totalExercises = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const totalSetsAllDays = routine.days.reduce(
    (sum, d) => sum + d.exercises.reduce((s, e) => s + e.sets, 0),
    0
  );
  const completedSetsToday = todayProgress.reduce((sum, log) => sum + log.setsCompleted, 0);
  const completedExercises = new Set(todayProgress.map((log) => log.exerciseId)).size;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header con stats */}
      <div className="space-y-4">
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
            <p className="text-lg font-bold text-foreground">{completedSetsToday}</p>
            <p className="text-[10px] text-muted-foreground">Series hoy</p>
          </div>
        </div>

        {routine.description && (
          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
            {routine.description}
          </p>
        )}
      </div>

      {/* Pasamos toda la rutina al client component */}
      <RoutineClientView
        routine={routine}
        todayProgress={todayProgress}
      />

      {/* Botón flotante para historial en mobile */}
      <div className="fixed bottom-6 right-4 sm:hidden">
        <Link href="/rutina/historial">
          <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
            <History size={20} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Client Component para la vista interactiva ───
"use client";

import { useState } from "react";
import { Exercise } from "@/types/exercise";

interface RoutineClientViewProps {
  routine: {
    id: string;
    name: string;
    days: {
      id: string;
      dayName: string;
      order: number;
      exercises: {
        id: string;
        exerciseId: string;
        exercise: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          clientDescription: string | null;
          muscleGroup: string | null;
          equipment: string | null;
          videoUrl: string | null;
          imageUrl: string | null;
          gifUrl: string | null;
          tags: string[];
          createdAt: Date;
        };
        sets: number;
        reps: string;
        rest: string | null;
        order: number;
        notes: string | null;
      }[];
    }[];
  };
  todayProgress: {
    id: string;
    exerciseId: string;
    setsCompleted: number;
    repsCompleted: string;
    weightUsed: number;
    notes: string | null;
    date: Date;
  }[];
}

function RoutineClientView({ routine, todayProgress }: RoutineClientViewProps) {
  const [activeDayId, setActiveDayId] = useState<string>(routine.days[0]?.id || "");
  const [viewMode, setViewMode] = useState<"active" | "all">("active");

  const activeDay = routine.days.find((d) => d.id === activeDayId);

  // Calcular progreso por día
  const daysProgress = routine.days.map((day, idx) => {
    const dayTotalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
    const dayCompletedSets = day.exercises.reduce((sum, ex) => {
      const exLogs = todayProgress.filter((log) => log.exerciseId === ex.exerciseId);
      return sum + exLogs.reduce((s, l) => s + l.setsCompleted, 0);
    }, 0);
    return {
      ...day,
      label: `Día ${idx + 1}`,
      progress: dayTotalSets > 0 ? (dayCompletedSets / dayTotalSets) * 100 : 0,
      isComplete: dayCompletedSets >= dayTotalSets && dayTotalSets > 0,
    };
  });

  // Helper para mapear exercise de Prisma a Exercise type
  const mapExercise = (ex: RoutineClientViewProps["routine"]["days"][0]["exercises"][0]["exercise"]): Exercise => ({
    id: ex.id,
    name: ex.name,
    type: ex.type as Exercise["type"],
    description: ex.description || undefined,
    clientDescription: ex.clientDescription || undefined,
    muscleGroup: ex.muscleGroup || undefined,
    equipment: ex.equipment || undefined,
    videoUrl: ex.videoUrl || undefined,
    imageUrl: ex.imageUrl || undefined,
    gifUrl: ex.gifUrl || undefined,
    tags: ex.tags || [],
    createdAt: ex.createdAt?.toISOString?.() || undefined,
  });

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("active")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
            viewMode === "active"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-card text-muted-foreground border border-border/60 hover:text-foreground"
          )}
        >
          Entrenar hoy
        </button>
        <button
          onClick={() => setViewMode("all")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
            viewMode === "all"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-card text-muted-foreground border border-border/60 hover:text-foreground"
          )}
        >
          Ver toda la rutina
        </button>
      </div>

      {/* Day Selector */}
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
          {daysProgress.map((day) => {
            const isActive = day.id === activeDayId;
            return (
              <button
                key={day.id}
                onClick={() => {
                  setActiveDayId(day.id);
                  setViewMode("active");
                }}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all shrink-0 min-w-[90px]",
                  isActive
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : "bg-card border-border/60 hover:border-border",
                  day.isComplete && !isActive && "border-emerald-500/20 bg-emerald-500/5"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {day.label}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {day.exercises.length} ej.
                </span>
                {/* Mini progress bar */}
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500/60 rounded-full transition-all"
                    style={{ width: `${day.progress}%` }}
                  />
                </div>
                {day.isComplete && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {viewMode === "active" && activeDay ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {daysProgress.find((d) => d.id === activeDayId)?.label}
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

              return (
                <ProgressTracker
                  key={re.id}
                  routineId={routine.id}
                  exerciseId={re.exerciseId}
                  exercise={mapExercise(re.exercise)}
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
      ) : (
        /* All days view */
        <div className="space-y-6">
          {routine.days.map((day, idx) => {
            const dayLabel = `Día ${idx + 1}`;
            const isActive = day.id === activeDayId;
            return (
              <div key={day.id} className="space-y-3">
                <button
                  onClick={() => {
                    setActiveDayId(day.id);
                    setViewMode("active");
                  }}
                  className="w-full flex items-center justify-between group"
                >
                  <h3
                    className={cn(
                      "text-base font-bold transition-colors",
                      isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {dayLabel}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {day.exercises.length} ejercicios
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
                    />
                  </div>
                </button>

                <div className="space-y-2">
                  {day.exercises.map((re) => {
                    const exerciseLogs = todayProgress.filter(
                      (log) => log.exerciseId === re.exerciseId
                    );
                    const totalSetsToday = exerciseLogs.reduce(
                      (sum, log) => sum + log.setsCompleted, 0
                    );
                    const isComplete = totalSetsToday >= re.sets;

                    return (
                      <div
                        key={re.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all",
                          isComplete
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-card border-border/60"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Dumbbell size={16} className="text-muted-foreground/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {re.exercise.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {re.sets} series × {re.reps}
                            {re.rest && ` • ${re.rest} descanso`}
                          </p>
                        </div>
                        {isComplete && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}