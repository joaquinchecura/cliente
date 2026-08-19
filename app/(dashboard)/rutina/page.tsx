export const dynamic = "force-dynamic"

import { getMyRoutines } from "@/app/actions/routines"
import { RoutineClientView } from "@/components/routines/RoutineClientView"
import { Dumbbell, Target, Calendar, Trophy } from "lucide-react"

const goals: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia", STRENGTH: "Fuerza", ENDURANCE: "Resistencia",
  WEIGHT_LOSS: "Pérdida de peso", MAINTENANCE: "Mantenimiento", REHABILITATION: "Rehabilitación",
}

export default async function RutinaPage() {
  const routines = await getMyRoutines()

  if (routines.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Dumbbell className="text-muted-foreground/30" size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Sin rutina asignada</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Todavía no tenés una rutina activa. Consultá con tu entrenador.
        </p>
      </div>
    )
  }

  const routine = routines[0] as any
  const totalSessions = routine.days.length
  const completedSessions = routine.days.filter(
    (d: any) => d.sessionLogs[0]?.completedAt
  ).length
  const pct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{routine.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {routine.goal && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Target size={11} /> {goals[routine.goal]}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Calendar size={11} /> {routine.frequencyPerWeek} ses/sem · {routine.totalWeeks} semanas
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Progreso del plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedSessions} de {totalSessions} sesiones completadas
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">{pct}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {completedSessions === totalSessions && totalSessions > 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
            <Trophy size={13} /> ¡Plan completado! 🎉
          </div>
        )}
      </div>

      {routine.description && (
        <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
          {routine.description}
        </p>
      )}

      <RoutineClientView routine={routine} />
    </div>
  )
}