// app/(dashboard)/rutina/page.tsx
export const dynamic = "force-dynamic"

import { getMyRoutines } from "@/app/actions/routines"
import { RoutineClientView } from "@/components/routines/RoutineClientView"
import { Dumbbell, Target, Calendar, Trophy, History, ChevronRight, Flame } from "lucide-react"
import Link from "next/link"

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
    (d: any) => d.sessionLogs?.[0]?.completedAt
  ).length
  const pct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{routine.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {routine.goal && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                <Target size={11} /> {goals[routine.goal]}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Calendar size={11} /> {routine.frequencyPerWeek} ses/sem · {routine.totalWeeks} semanas
            </span>
          </div>
        </div>

        {/* Acceso rápido a historial — desktop */}
        <Link
          href="/rutina/historial"
          className="hidden sm:flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium transition-colors border border-violet-500/20"
        >
          <History size={14} /> Historial
        </Link>
      </div>

      {/* Progress bar */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">Progreso del plan</p>
            <p className="text-xs text-emerald-500/70 mt-0.5">
              {completedSessions} de {totalSessions} sesiones completadas
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{pct}%</p>
        </div>
        <div className="h-2.5 bg-emerald-500/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {completedSessions === totalSessions && totalSessions > 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <Trophy size={13} /> ¡Plan completado! 🎉
          </div>
        )}
      </div>

      {/* Card de acceso a historial — mobile */}
      <Link
        href="/rutina/historial"
        className="sm:hidden flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-4 hover:border-violet-500/40 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <History size={18} className="text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Ver historial</p>
          <p className="text-xs text-muted-foreground">Series, PRs y progreso por ejercicio</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-violet-400 transition-colors shrink-0" />
      </Link>

      {routine.description && (
        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 rounded-xl px-4 py-3">
          <Flame size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300/80">{routine.description}</p>
        </div>
      )}

      <RoutineClientView routine={routine} />
    </div>
  )
}