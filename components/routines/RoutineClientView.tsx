"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  startSession, completeSession,
  getSessionProgress, logProgress, deleteProgressLog,
} from "@/app/actions/routines"
import { ProgressTracker } from "./progress-tracker"
import { mapPrismaExercise } from "@/types/exercise"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, Circle, Play, ChevronRight,
  ArrowLeft, Dumbbell,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types (sin cambios) ──────────────────────────────────────────────────

interface SessionLog {
  id: string
  startedAt: Date
  completedAt: Date | null
}

interface RoutineExercise {
  id: string
  exerciseId: string
  exercise: any
  sets: number
  reps: string
  targetWeight: number | null
  rest: string | null
  notes: string | null
}

interface RoutineDay {
  id: string
  sessionNumber: number
  weekNumber: number
  dayOfWeek: number
  exercises: RoutineExercise[]
  sessionLogs: SessionLog[]
}

interface Routine {
  id: string
  name: string
  frequencyPerWeek: number
  totalWeeks: number
  days: RoutineDay[]
}

type SessionStatus = "pending" | "in_progress" | "completed"

function getStatus(day: RoutineDay): SessionStatus {
  const log = day.sessionLogs[0]
  if (!log) return "pending"
  if (log.completedAt) return "completed"
  return "in_progress"
}

// ── Component ──────────────────────────────────────────────────────────────

export function RoutineClientView({ routine }: { routine: Routine }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const weeks = Array.from({ length: routine.totalWeeks || 1 }, (_, i) => ({
    weekNumber: i + 1,
    sessions: routine.days.filter(d => d.weekNumber === i + 1),
  }))

  const defaultWeek =
    weeks.find(w => w.sessions.some(s => getStatus(s) !== "completed"))
      ?.weekNumber ?? 1

  const [selectedWeek,    setSelectedWeek]    = useState(defaultWeek)
  const [activeSession,   setActiveSession]   = useState<RoutineDay | null>(null)
  const [sessionLogId,    setSessionLogId]    = useState<string | null>(null)
  const [sessionProgress, setSessionProgress] = useState<any[]>([])
  const [completing,      setCompleting]      = useState(false)
  const [loading,         setLoading]         = useState(false)

  const weekSessions = weeks.find(w => w.weekNumber === selectedWeek)?.sessions ?? []

  // ── Rehidratar la sesión activa desde la URL al montar (refresh-safe) ──
  useEffect(() => {
    const dayId = searchParams.get("day")
    if (!dayId) return
    const day = routine.days.find(d => d.id === dayId)
    if (day) openSession(day, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Abrir una sesión (usada tanto por click como por rehidratación) ──
  async function openSession(day: RoutineDay, updateUrl = true) {
    setLoading(true)
    try {
      const log = await startSession(routine.id, day.id)
      setSessionLogId(log.id)
      const progress = await getSessionProgress(day.id)
      setSessionProgress(progress?.progressLogs ?? [])
      setActiveSession(day)
      if (updateUrl) {
        router.push(`${pathname}?day=${day.id}`, { scroll: false })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteSession() {
    if (!sessionLogId) return
    setCompleting(true)
    try {
      await completeSession(sessionLogId)
      setActiveSession(null)
      setSessionLogId(null)
      setSessionProgress([])
      router.push(pathname, { scroll: false })
      router.refresh()
    } finally {
      setCompleting(false)
    }
  }

  function handleBack() {
    setActiveSession(null)
    setSessionLogId(null)
    setSessionProgress([])
    router.push(pathname, { scroll: false })
  }

  // ══ SESSION DETAIL VIEW ══════════════════════════════════════════════════
  if (activeSession) {
    const completedEx = new Set(sessionProgress.map((l: any) => l.exerciseId)).size
    const totalEx = activeSession.exercises.length
    const allDone = completedEx >= totalEx

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground">
              Sesión {activeSession.sessionNumber}
            </h2>
            <p className="text-xs text-muted-foreground">
              Semana {activeSession.weekNumber} · {totalEx} ejercicios
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-foreground">{completedEx}/{totalEx}</p>
            <p className="text-[10px] text-muted-foreground">ejercicios</p>
          </div>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${totalEx > 0 ? (completedEx / totalEx) * 100 : 0}%` }}
          />
        </div>

        <div className="space-y-3">
          {activeSession.exercises.map(re => {
            const logs = sessionProgress.filter((l: any) => l.exerciseId === re.exerciseId)
            return (
              <ProgressTracker
                key={re.id}
                routineId={routine.id}
                exerciseId={re.exerciseId}
                exercise={mapPrismaExercise(re.exercise)}
                targetSets={re.sets}
                targetReps={re.reps}
                targetWeight={re.targetWeight ?? undefined}
                rest={re.rest ?? undefined}
                notes={re.notes ?? undefined}
                sessionLogId={sessionLogId ?? undefined}
                todayLogs={logs.map((l: any) => ({
                  id: l.id,
                  setsCompleted: l.setsCompleted,
                  repsCompleted: l.repsCompleted,
                  weightUsed: Number(l.weightUsed),
                  notes: l.notes,
                  date: l.date instanceof Date ? l.date.toISOString() : l.date,
                }))}
                onLogAdded={(log) => setSessionProgress(prev => [...prev, log])}
                onLogDeleted={(id) => setSessionProgress(prev => prev.filter((l: any) => l.id !== id))}
              />
            )
          })}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleCompleteSession}
            disabled={completing}
            className={cn(
              "w-full h-12 text-base font-semibold gap-2 transition-all",
              allDone
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <CheckCircle2 size={18} />
            {completing
              ? "Guardando..."
              : allDone
              ? "Completar sesión ✓"
              : "Terminar igual"}
          </Button>
          {!allDone && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Terminá los {totalEx - completedEx} ejercicios restantes, o guardá el progreso de todas formas.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ══ WEEK GRID VIEW ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {weeks.map(({ weekNumber, sessions }) => {
          const done  = sessions.filter(s => getStatus(s) === "completed").length
          const isCurrent = weekNumber === defaultWeek
          const isSelected = weekNumber === selectedWeek

          return (
            <button
              key={weekNumber}
              onClick={() => setSelectedWeek(weekNumber)}
              className={cn(
                "relative flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all shrink-0 min-w-[76px]",
                isSelected
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  : done === sessions.length && sessions.length > 0
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-card border-border/60 hover:border-border"
              )}
            >
              {isCurrent && done < sessions.length && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded-full leading-none whitespace-nowrap">
                  ACTUAL
                </span>
              )}
              <span className={cn(
                "text-sm font-bold",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                Sem {weekNumber}
              </span>
              <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                {done}/{sessions.length}
              </span>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-emerald-500/60 rounded-full transition-all"
                  style={{ width: `${sessions.length > 0 ? (done / sessions.length) * 100 : 0}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Semana {selectedWeek} — {weekSessions.length} sesiones
        </p>

        {weekSessions.map(session => {
          const status = getStatus(session)
          const log = session.sessionLogs[0]

          return (
            <button
              key={session.id}
              onClick={() => !loading && openSession(session)}
              disabled={loading}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all disabled:opacity-70",
                status === "completed"
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                  : status === "in_progress"
                  ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10 hover:bg-primary/10"
                  : "bg-card border-border/60 hover:border-border hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  status === "completed"
                    ? "bg-emerald-500/10"
                    : status === "in_progress"
                    ? "bg-primary/10"
                    : "bg-muted"
                )}>
                  {status === "completed" ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : status === "in_progress" ? (
                    <Play size={18} className="text-primary" />
                  ) : (
                    <Circle size={18} className="text-muted-foreground/25" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">
                      Sesión {session.sessionNumber}
                    </p>
                    {status === "in_progress" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                        EN CURSO
                      </span>
                    )}
                    {status === "completed" && log?.completedAt && (
                      <span className="text-[10px] text-emerald-500/80">
                        {new Date(log.completedAt).toLocaleDateString("es-AR", {
                          day: "numeric", month: "short",
                          timeZone: "America/Argentina/Buenos_Aires",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {session.exercises.slice(0, 3).map((ex, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {ex.exercise.name}
                      </span>
                    ))}
                    {session.exercises.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        +{session.exercises.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} className="text-muted-foreground/25 shrink-0" />
              </div>
            </button>
          )
        })}

        {weekSessions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Dumbbell size={24} className="mx-auto mb-2 opacity-20" />
            Sin sesiones para esta semana
          </div>
        )}
      </div>
    </div>
  )
}