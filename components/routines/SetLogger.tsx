// components/routines/SetLogger.tsx
"use client"

import { useState } from "react"
import { Check, Trash2, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SetData {
  id: string
  setNumber: number
  reps: string
  weight: number
  completed: boolean
  logId?: string   // ID real del log para poder borrarlo
  notes?: string
}

interface SetLoggerProps {
  targetSets: number
  targetReps: string
  targetWeight?: number   // ← nuevo: peso de referencia del entrenador
  existingLogs: {
    id: string
    setsCompleted: number
    repsCompleted: string
    weightUsed: number
    notes: string | null
  }[]
  onLogSet: (data: { reps: string; weight: number; notes?: string }) => Promise<void>
  onDeleteLog: (logId: string) => Promise<void>
}

export function SetLogger({
  targetSets,
  targetReps,
  targetWeight,
  existingLogs,
  onLogSet,
  onDeleteLog,
}: SetLoggerProps) {
  const defaultWeight = targetWeight ?? 0

  const [sets, setSets] = useState<SetData[]>(() => {
    const initial: SetData[] = []

    // Expand existing logs into individual sets
    existingLogs.forEach(log => {
      for (let i = 0; i < log.setsCompleted; i++) {
        initial.push({
          id: `${log.id}-${i}`,
          setNumber: initial.length + 1,
          reps: log.repsCompleted,
          weight: log.weightUsed,
          completed: true,
          logId: log.id,
        })
      }
    })

    // Fill remaining pending sets, inheriting last completed weight or ref weight
    const lastWeight = initial.length > 0
      ? initial[initial.length - 1].weight
      : defaultWeight

    while (initial.length < targetSets) {
      initial.push({
        id: `pending-${initial.length}`,
        setNumber: initial.length + 1,
        reps: targetReps,
        weight: lastWeight,
        completed: false,
      })
    }

    return initial
  })

  const [activeIdx, setActiveIdx] = useState(() => {
    const first = sets.findIndex(s => !s.completed)
    return first >= 0 ? first : sets.length
  })

  const [saving, setSaving] = useState(false)

  const completedCount = sets.filter(s => s.completed).length
  const isAllComplete  = completedCount >= targetSets

  function updateSet(idx: number, field: keyof SetData, value: any) {
    setSets(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  async function handleComplete(idx: number) {
    const set = sets[idx]
    if (set.weight <= 0) return
    setSaving(true)
    try {
      await onLogSet({ reps: set.reps, weight: set.weight, notes: set.notes })
      setSets(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], completed: true }

        // Auto-advance or add extra set
        const nextPending = next.findIndex((s, i) => i > idx && !s.completed)
        if (nextPending >= 0) {
          setActiveIdx(nextPending)
        } else {
          // Offer one extra set
          const extra: SetData = {
            id: `extra-${next.length}`,
            setNumber: next.length + 1,
            reps: set.reps,
            weight: set.weight,
            completed: false,
          }
          next.push(extra)
          setActiveIdx(next.length - 1)
        }
        return next
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(idx: number) {
    const set = sets[idx]
    if (!set.logId) return
    await onDeleteLog(set.logId)
    setSets(prev =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))
    )
  }

  return (
    <div className="space-y-2">
      {/* Reference weight hint */}
      {targetWeight && targetWeight > 0 && (
        <div className="flex items-center gap-1.5 px-1 mb-1">
          <Dumbbell size={11} className="text-primary/50" />
          <span className="text-[11px] text-muted-foreground">
            Peso prescripto: <span className="font-semibold text-foreground">{targetWeight} kg</span>
          </span>
        </div>
      )}

      {/* Sets */}
      <div className="space-y-1.5">
        {sets.map((set, idx) => {
          const isActive = idx === activeIdx && !set.completed
          return (
            <div
              key={set.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200",
                set.completed
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : isActive
                  ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10"
                  : "bg-muted/30 border-transparent"
              )}
            >
              {/* Set badge */}
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                set.completed
                  ? "bg-emerald-500 text-white"
                  : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {set.completed ? <Check size={13} /> : set.setNumber}
              </div>

              {/* Reps + weight inputs */}
              <div className="flex items-center gap-1.5 flex-1">
                <Input
                  type="text"
                  value={set.reps}
                  onChange={e => updateSet(idx, "reps", e.target.value)}
                  disabled={set.completed}
                  className={cn("h-7 text-xs text-center w-14", set.completed && "opacity-50")}
                  placeholder="Reps"
                />
                <span className="text-[10px] text-muted-foreground">×</span>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    value={set.weight || ""}
                    onChange={e => updateSet(idx, "weight", parseFloat(e.target.value) || 0)}
                    disabled={set.completed}
                    className={cn("h-7 text-xs text-center w-16 pr-5", set.completed && "opacity-50")}
                    placeholder={targetWeight ? `${targetWeight}` : "0"}
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none">
                    kg
                  </span>
                </div>

                {/* Inline note for active set */}
                {isActive && (
                  <Input
                    type="text"
                    value={set.notes || ""}
                    onChange={e => updateSet(idx, "notes", e.target.value)}
                    className="h-7 text-[10px] flex-1 hidden sm:block"
                    placeholder="Nota..."
                  />
                )}
              </div>

              {/* Action */}
              {set.completed ? (
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1 text-muted-foreground/30 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleComplete(idx)}
                  disabled={saving || set.weight <= 0}
                  className={cn(
                    "h-7 px-3 text-[11px] font-bold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-transparent text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                  )}
                >
                  {saving ? "..." : "OK"}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {completedCount > 0 && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 pt-0.5">
          <span>{completedCount}/{targetSets} series</span>
          {isAllComplete && (
            <span className="text-emerald-400 font-medium">Ejercicio completado ✓</span>
          )}
        </div>
      )}
    </div>
  )
}