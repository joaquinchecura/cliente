// components/routines/ExerciseCardClient.tsx
"use client"

import { useState } from "react"
import { Dumbbell, Play, ChevronDown, Clock, Info, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Exercise } from "@/types/exercise"

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  STRENGTH:   { label: "Fuerza",          color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  CARDIO:     { label: "Cardio",          color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  FUNCTIONAL: { label: "Funcional",       color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  MOBILITY:   { label: "Movilidad",       color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  STRETCHING: { label: "Estiramiento",    color: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20" },
  PLYOMETRIC: { label: "Pliometría",      color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  BALANCE:    { label: "Equilibrio",      color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  TECHNIQUE:  { label: "Técnica",         color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20" },
  WARMUP:     { label: "Calentamiento",   color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
  COOLDOWN:   { label: "Vuelta a la calma", color: "text-cyan-400",  bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
  OTHER:      { label: "Otro",            color: "text-gray-400",    bg: "bg-gray-500/10",    border: "border-gray-500/20" },
}

interface ExerciseCardClientProps {
  exercise: Exercise
  targetSets: number
  targetReps: string
  targetWeight?: number   // ← nuevo
  rest?: string
  notes?: string
  completedSets: number
  isExpanded: boolean
  onToggle: () => void
  onOpenDetail?: () => void
  children?: React.ReactNode
}

export function ExerciseCardClient({
  exercise,
  targetSets,
  targetReps,
  targetWeight,
  rest,
  notes,
  completedSets,
  isExpanded,
  onToggle,
  onOpenDetail,
  children,
}: ExerciseCardClientProps) {
  const [mediaError, setMediaError] = useState(false)
  const [showMedia,  setShowMedia]  = useState(false)

  const typeConfig = TYPE_CONFIG[exercise.type] || TYPE_CONFIG["OTHER"]
  const progress   = Math.min((completedSets / targetSets) * 100, 100)
  const isComplete = completedSets >= targetSets

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border",
      isComplete
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-border/60 bg-card",
      isExpanded && "ring-1 ring-primary/20"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Thumbnail */}
          <button
            onClick={e => { e.stopPropagation(); onOpenDetail?.() }}
            className={cn(
              "w-16 h-16 shrink-0 rounded-xl overflow-hidden relative group",
              "hover:ring-2 hover:ring-primary/50 transition-all",
              !exercise.imageUrl && !exercise.gifUrl && "bg-muted flex items-center justify-center"
            )}
          >
            {exercise.gifUrl && !mediaError ? (
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className="h-full w-full object-cover"
                onError={() => setMediaError(true)}
              />
            ) : exercise.imageUrl && !mediaError ? (
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="h-full w-full object-cover"
                onError={() => setMediaError(true)}
              />
            ) : (
              <Dumbbell className="h-6 w-6 text-muted-foreground/30" />
            )}

            {/* Completed badge */}
            <div className="absolute -bottom-1 -right-1">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                isComplete
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground"
              )}>
                {completedSets}
              </div>
            </div>

            {/* Hover info overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
              <Info size={14} className="text-white" />
            </div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  onClick={e => { e.stopPropagation(); onOpenDetail?.() }}
                  className={cn(
                    "font-semibold text-sm text-left block truncate",
                    "hover:text-primary transition-colors",
                    isComplete && "text-emerald-400"
                  )}
                >
                  {exercise.name}
                </button>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4 font-medium",
                      typeConfig.bg, typeConfig.color, typeConfig.border
                    )}
                  >
                    {typeConfig.label}
                  </Badge>
                  {exercise.muscleGroup && (
                    <span className="text-[10px] text-muted-foreground">
                      {exercise.muscleGroup}
                    </span>
                  )}
                  {exercise.equipment && (
                    <span className="text-[10px] text-muted-foreground/50">
                      · {exercise.equipment}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={e => { e.stopPropagation(); onOpenDetail?.() }}
                >
                  <Info size={14} />
                </Button>
                <button className="p-1" onClick={onToggle}>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Sets × reps + ref weight + progress */}
            <div className="mt-2 cursor-pointer" onClick={onToggle}>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">{targetSets} series</span>
                  <span>× {targetReps}</span>
                  {rest && (
                    <span className="flex items-center gap-0.5 text-muted-foreground/50">
                      <Clock size={10} /> {rest}
                    </span>
                  )}
                  {/* Reference weight pill */}
                  {targetWeight && targetWeight > 0 && (
                    <span className="flex items-center gap-0.5 text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded-full text-[9px] font-medium">
                      <Target size={9} />
                      {targetWeight} kg
                    </span>
                  )}
                </span>
                <span className={cn(
                  "text-[10px] font-medium",
                  isComplete ? "text-emerald-400" : "text-muted-foreground/50"
                )}>
                  {completedSets}/{targetSets}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isComplete ? "bg-emerald-500" : "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border/50 space-y-3">

          {/* Media */}
          {(exercise.gifUrl || exercise.videoUrl) && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground"
                onClick={() => setShowMedia(!showMedia)}
              >
                <Play size={12} />
                {showMedia ? "Ocultar demostración" : "Ver demostración"}
              </Button>
              {showMedia && (
                <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-muted">
                  {exercise.gifUrl
                    ? <img src={exercise.gifUrl} alt={exercise.name} className="w-full h-full object-contain" />
                    : <video src={exercise.videoUrl} controls className="w-full h-full" />
                  }
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {exercise.clientDescription && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
              <Info size={13} className="text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {exercise.clientDescription}
              </p>
            </div>
          )}

          {/* Tags */}
          {exercise.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {exercise.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Coach note */}
          {notes && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-[11px] text-amber-400/80 font-semibold mb-1">
                Nota del coach
              </p>
              <p className="text-xs text-amber-400/60">{notes}</p>
            </div>
          )}

          {children && <div>{children}</div>}
        </div>
      )}
    </Card>
  )
}