"use client"

import { useState } from "react"
import { logProgress, deleteProgressLog } from "@/app/actions/routines"
import { Button } from "@/components/ui/button"
import { TrendingUp, ChevronDown, X, Play, Dumbbell, Layers, Tag, Info } from "lucide-react"
import { ExerciseCardClient } from "./ExerciseCardClient"
import { SetLogger } from "./SetLogger"
import { RestTimer } from "./RestTimer"
import { ProgressChart } from "./progress-chart"
import { ExerciseMedia } from "./ExerciseMedia"
import { Exercise } from "@/types/exercise"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

interface TodayLog {
  id: string
  setsCompleted: number
  repsCompleted: string
  weightUsed: number
  notes: string | null
  date: string
}

interface ProgressTrackerProps {
  routineId: string
  exerciseId: string
  exercise: Exercise
  targetSets: number
  targetReps: string
  targetWeight?: number          // peso prescripto de referencia
  rest?: string
  notes?: string
  sessionLogId?: string          // para linkear al SessionLog
  readOnly?: boolean    
  todayLogs: TodayLog[]
  onLogAdded?: (log: any) => void
  onLogDeleted?: (id: string) => void
}

// ── Exercise detail modal ──────────────────────────────────────────────────

function ExerciseDetailModal({
  exercise,
  onClose,
}: {
  exercise: Exercise
  onClose: () => void
}) {
  const [showVideo, setShowVideo] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          {exercise.videoUrl && showVideo ? (
            <video
              src={exercise.videoUrl}
              controls
              autoPlay
              className="w-full h-56 object-cover rounded-t-2xl"
              onError={() => setShowVideo(false)}
            />
          ) : (
            <ExerciseMedia
              imageUrl={exercise.imageUrl}
              gifUrl={exercise.gifUrl}
              videoUrl={exercise.videoUrl}
              name={exercise.name}
              className="w-full h-56 rounded-t-2xl"
            />
          )}
          {exercise.videoUrl && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors rounded-t-2xl"
            >
              <div className="bg-white/90 rounded-full p-3 shadow-lg">
                <Play className="h-6 w-6 text-foreground fill-foreground" />
              </div>
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {exercise.type}
              </span>
              {exercise.muscleGroup && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers size={11} /> {exercise.muscleGroup}
                </span>
              )}
              {exercise.equipment && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Dumbbell size={11} /> {exercise.equipment}
                </span>
              )}
            </div>
          </div>

          {(exercise.clientDescription || exercise.description) && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border/60">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Info size={14} /> Instrucciones
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.clientDescription || exercise.description}
              </p>
            </div>
          )}

          {exercise.tags && exercise.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {exercise.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 flex items-center gap-1"
                >
                  <Tag size={9} /> {tag}
                </span>
              ))}
            </div>
          )}

          {exercise.videoUrl && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors border border-border/60"
            >
              <Play size={16} /> Ver video de demostración
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ProgressTracker ────────────────────────────────────────────────────────

export function ProgressTracker({
  routineId,
  exerciseId,
  exercise,
  targetSets,
  targetReps,
  targetWeight,
  rest,
  notes,
  sessionLogId,
  readOnly,
  todayLogs,
  onLogAdded,
  onLogDeleted,
}: ProgressTrackerProps) {
  const [isExpanded,   setIsExpanded]   = useState(false)
  const [showHistory,  setShowHistory]  = useState(false)
  const [showDetail,   setShowDetail]   = useState(false)

  const totalSetsToday = todayLogs.reduce((sum, log) => sum + log.setsCompleted, 0)

  const restSeconds = rest
    ? parseInt(rest.match(/\d+/)?.[0] || "60")
    : 60

  // ── Log a set ──
  const handleLogSet = async (data: {
    reps: string
    weight: number
    notes?: string
  }) => {
    if (readOnly) return
    const log = await logProgress({
      routineId,
      exerciseId,
      sessionLogId,
      setsCompleted: 1,
      repsCompleted: data.reps,
      weightUsed: data.weight,
      notes: data.notes,
    })
    onLogAdded?.(log)
  }

  // ── Delete a log ──
  const handleDeleteLog = async (logId: string) => {
    if (readOnly) return
    await deleteProgressLog(logId)
    onLogDeleted?.(logId)
  }

  const exerciseHistory = todayLogs.map(log => ({
    exerciseName: exercise.name,
    exerciseType: exercise.type,
    date: log.date,
    weightUsed: log.weightUsed,
    setsCompleted: log.setsCompleted,
    repsCompleted: log.repsCompleted,
  }))

  return (
    <>
      <ExerciseCardClient
        exercise={exercise}
        targetSets={targetSets}
        targetReps={targetReps}
        targetWeight={targetWeight}
        rest={rest}
        notes={notes}
        completedSets={totalSetsToday}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        onOpenDetail={() => setShowDetail(true)}
      >
        {/* Rest timer */}
        {isExpanded && rest && (
          <div className="mb-3">
            <RestTimer defaultSeconds={restSeconds} onComplete={() => {}} />
          </div>
        )}

        {/* Set logger */}
        {isExpanded && (
          <SetLogger
            targetSets={targetSets}
            targetReps={targetReps}
            targetWeight={targetWeight}
            readOnly={readOnly}
            existingLogs={todayLogs.map(log => ({
              id: log.id,
              setsCompleted: log.setsCompleted,
              repsCompleted: log.repsCompleted,
              weightUsed: log.weightUsed,
              notes: log.notes,
            }))}
            onLogSet={handleLogSet}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {/* History */}
        {isExpanded && todayLogs.length > 0 && (
          <div className="mt-3 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground w-full justify-between"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="flex items-center gap-1">
                <TrendingUp size={12} /> Historial y progreso
              </span>
              <ChevronDown
                size={12}
                className={cn("transition-transform", showHistory && "rotate-180")}
              />
            </Button>

            {showHistory && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Esta sesión
                  </p>
                  {todayLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {log.setsCompleted}×{log.repsCompleted}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          @ {log.weightUsed} kg
                        </span>
                        {log.notes && (
                          <span className="text-[10px] text-muted-foreground/60">
                            — {log.notes}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground/40 hover:text-destructive"
                        onClick={() => handleDeleteLog(log.id)}
                      >
                        <X size={11} />
                      </Button>
                    </div>
                  ))}
                </div>

                {exerciseHistory.length >= 1 && (
                  <ProgressChart
                    data={exerciseHistory}
                    title={`Progreso de ${exercise.name}`}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </ExerciseCardClient>

      {showDetail && (
        <ExerciseDetailModal
          exercise={exercise}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}