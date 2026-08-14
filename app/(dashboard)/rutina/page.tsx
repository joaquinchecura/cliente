export const dynamic = "force-dynamic";

import { getMyRoutines, getTodayProgress } from "@/app/actions/routines";
import { RoutineClientView } from "@/components/routines/RoutineClientView";
import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Calendar, History, Flame, Trophy } from "lucide-react";
import Link from "next/link";

const goals: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia", STRENGTH: "Fuerza", ENDURANCE: "Resistencia",
  WEIGHT_LOSS: "Pérdida de peso", MAINTENANCE: "Mantenimiento", REHABILITATION: "Rehabilitación",
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
  const todayProgressRaw = await getTodayProgress(routine.id);
  const todayProgress = todayProgressRaw.map((log) => ({ ...log, weightUsed: Number(log.weightUsed) }));

  const totalExercises = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const completedSetsToday = todayProgress.reduce((sum, log) => sum + log.setsCompleted, 0);
  const completedExercises = new Set(todayProgress.map((log) => log.exerciseId)).size;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{routine.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {routine.goal && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  <Target size={12} />{goals[routine.goal]}
                </span>
              )}
              {routine.frequencyPerWeek && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  <Calendar size={12} />{routine.frequencyPerWeek} días/semana
                </span>
              )}
            </div>
          </div>
          <Link href="/rutina/historial">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <History size={14} /><span className="hidden sm:inline">Historial</span>
            </Button>
          </Link>
        </div>

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
          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">{routine.description}</p>
        )}
      </div>

      <RoutineClientView routine={routine} todayProgress={todayProgress} />

      <div className="fixed bottom-6 right-4 sm:hidden">
        <Link href="/rutina/historial">
          <Button size="icon" className="h-12 w-12 rounded-full shadow-lg"><History size={20} /></Button>
        </Link>
      </div>
    </div>
  );
}