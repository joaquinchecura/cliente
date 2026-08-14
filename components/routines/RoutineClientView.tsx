"use client";

import { useState } from "react";
import { Dumbbell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressTracker } from "./progress-tracker";
import { Exercise } from "@/types/exercise";

interface RoutineClientViewProps {
  routine: {
    id: string; name: string;
    days: {
      id: string; dayName: string; order: number;
      exercises: {
        id: string; exerciseId: string;
        exercise: {
          id: string; name: string; type: string;
          description: string | null; clientDescription?: string | null;
          muscleGroup: string | null; equipment: string | null;
          videoUrl: string | null; imageUrl: string | null; gifUrl?: string | null;
          tags: string[]; createdAt: Date;
        };
        sets: number; reps: string; rest: string | null; order: number; notes: string | null;
      }[];
    }[];
  };
  todayProgress: { id: string; exerciseId: string; setsCompleted: number; repsCompleted: string; weightUsed: number; notes: string | null; date: Date; }[];
}

export function RoutineClientView({ routine, todayProgress }: RoutineClientViewProps) {
  const [activeDayId, setActiveDayId] = useState<string>(routine.days[0]?.id || "");
  const [viewMode, setViewMode] = useState<"active" | "all">("active");
  const activeDay = routine.days.find((d) => d.id === activeDayId);

  const daysProgress = routine.days.map((day, idx) => {
    const dayTotalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
    const dayCompletedSets = day.exercises.reduce((sum, ex) => {
      const exLogs = todayProgress.filter((log) => log.exerciseId === ex.exerciseId);
      return sum + exLogs.reduce((s, l) => s + l.setsCompleted, 0);
    }, 0);
    return { ...day, label: `Día ${idx + 1}`, progress: dayTotalSets > 0 ? (dayCompletedSets / dayTotalSets) * 100 : 0, isComplete: dayCompletedSets >= dayTotalSets && dayTotalSets > 0 };
  });

  const mapExercise = (ex: RoutineClientViewProps["routine"]["days"][0]["exercises"][0]["exercise"]): Exercise => ({
    id: ex.id, name: ex.name, type: ex.type as Exercise["type"],
    description: ex.description || undefined, clientDescription: ex.clientDescription || undefined,
    muscleGroup: ex.muscleGroup || undefined, equipment: ex.equipment || undefined,
    videoUrl: ex.videoUrl || undefined, imageUrl: ex.imageUrl || undefined, gifUrl: ex.gifUrl || undefined,
    tags: ex.tags || [], createdAt: ex.createdAt?.toISOString?.() || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => setViewMode("active")} className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", viewMode === "active" ? "bg-primary/10 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border/60 hover:text-foreground")}>Entrenar hoy</button>
        <button onClick={() => setViewMode("all")} className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", viewMode === "all" ? "bg-primary/10 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border/60 hover:text-foreground")}>Ver toda la rutina</button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Días de entrenamiento</h3>
          <span className="text-xs text-muted-foreground">{routine.days.length} días</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {daysProgress.map((day) => {
            const isActive = day.id === activeDayId;
            return (
              <button key={day.id} onClick={() => { setActiveDayId(day.id); setViewMode("active"); }} className={cn("flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all shrink-0 min-w-[90px]", isActive ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-card border-border/60 hover:border-border", day.isComplete && !isActive && "border-emerald-500/20 bg-emerald-500/5")}>
                <span className={cn("text-sm font-bold", isActive ? "text-primary" : "text-muted-foreground")}>{day.label}</span>
                <span className="text-[10px] text-muted-foreground/60">{day.exercises.length} ej.</span>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1"><div className="h-full bg-emerald-500/60 rounded-full transition-all" style={{ width: `${day.progress}%` }} /></div>
                {day.isComplete && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === "active" && activeDay ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{daysProgress.find((d) => d.id === activeDayId)?.label}</h3>
            <span className="text-xs text-muted-foreground">{activeDay.exercises.length} ejercicios</span>
          </div>
          <div className="space-y-3">
            {activeDay.exercises.map((re) => {
              const exerciseLogs = todayProgress.filter((log) => log.exerciseId === re.exerciseId);
              return (
                <ProgressTracker key={re.id} routineId={routine.id} exerciseId={re.exerciseId} exercise={mapExercise(re.exercise)} targetSets={re.sets} targetReps={re.reps} rest={re.rest || undefined} notes={re.notes || undefined}
                  todayLogs={exerciseLogs.map((log) => ({ id: log.id, setsCompleted: log.setsCompleted, repsCompleted: log.repsCompleted, weightUsed: log.weightUsed, notes: log.notes, date: log.date.toISOString() }))}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {routine.days.map((day, idx) => {
            const dayLabel = `Día ${idx + 1}`;
            const isActive = day.id === activeDayId;
            return (
              <div key={day.id} className="space-y-3">
                <button onClick={() => { setActiveDayId(day.id); setViewMode("active"); }} className="w-full flex items-center justify-between group">
                  <h3 className={cn("text-base font-bold transition-colors", isActive ? "text-primary" : "text-foreground group-hover:text-primary")}>{dayLabel}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{day.exercises.length} ejercicios</span>
                    <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
                <div className="space-y-2">
                  {day.exercises.map((re) => {
                    const exerciseLogs = todayProgress.filter((log) => log.exerciseId === re.exerciseId);
                    const totalSetsToday = exerciseLogs.reduce((sum, log) => sum + log.setsCompleted, 0);
                    const isComplete = totalSetsToday >= re.sets;
                    return (
                      <div key={re.id} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", isComplete ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border/60")}>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0"><Dumbbell size={16} className="text-muted-foreground/40" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{re.exercise.name}</p>
                          <p className="text-[10px] text-muted-foreground">{re.sets} series × {re.reps}{re.rest && ` • ${re.rest} descanso`}</p>
                        </div>
                        {isComplete && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">✓</span>}
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