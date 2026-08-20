"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { TrendingUp, ChevronDown, BarChart3, Weight, Trophy, Zap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExerciseProgress {
  exerciseName: string
  exerciseType: string
  date: string
  weightUsed: number
  targetWeight?: number | null   // ← nuevo: peso prescripto de esa sesión
  setsCompleted: number
  repsCompleted: string
}

interface ProgressChartProps { data: ExerciseProgress[]; title?: string }

type ChartView = "weight" | "volume" | "sets"

const TYPE_COLORS: Record<string, string> = {
  STRENGTH: "#3b82f6", CARDIO: "#ef4444", FUNCTIONAL: "#f59e0b", MOBILITY: "#10b981",
  STRETCHING: "#14b8a6", PLYOMETRIC: "#f97316", BALANCE: "#8b5cf6", TECHNIQUE: "#64748b",
  WARMUP: "#f43f5e", COOLDOWN: "#06b6d4", OTHER: "#6b7280",
}

const DARK_COLORS = {
  text: "#fafafa",
  textMuted: "#a1a1aa",
  border: "#27272a",
  grid: "#27272a",
  tooltipBg: "#18181b",
  tooltipBorder: "#27272a",
  target: "#71717a",   // gris neutro para la referencia
}

export function ProgressChart({ data, title = "Progreso" }: ProgressChartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<ChartView>("weight")
  if (data.length === 0) return null

  const exerciseGroups = data.reduce((acc, d) => {
    if (!acc[d.exerciseName]) acc[d.exerciseName] = { name: d.exerciseName, type: d.exerciseType, entries: [] }
    acc[d.exerciseName].entries.push(d)
    return acc
  }, {} as Record<string, { name: string; type: string; entries: ExerciseProgress[] }>)

  const chartData = Object.values(exerciseGroups).map((group) => {
    const latest = group.entries[group.entries.length - 1]
    const allWeights = group.entries.map(e => e.weightUsed)
    const maxWeight = Math.max(...allWeights)
    const avgWeight = allWeights.reduce((a, b) => a + b, 0) / allWeights.length
    const totalSets = group.entries.reduce((sum, e) => sum + e.setsCompleted, 0)
    const totalVolume = group.entries.reduce(
      (sum, e) => sum + e.weightUsed * (parseInt(e.repsCompleted) || 0) * e.setsCompleted, 0
    )

    // Diferencia contra el peso de referencia más reciente
    const latestTarget = latest.targetWeight ?? null
    const diff = latestTarget != null ? Math.round((latest.weightUsed - latestTarget) * 10) / 10 : null

    return {
      name: group.name,
      type: group.type,
      weight: latest.weightUsed,
      target: latestTarget,
      diff,
      maxWeight,
      avgWeight: Math.round(avgWeight * 10) / 10,
      sets: totalSets,
      volume: Math.round(totalVolume),
      entries: group.entries.length,
      color: TYPE_COLORS[group.type] || TYPE_COLORS["OTHER"],
    }
  })

  const hasTargets = chartData.some(d => d.target != null)

  const viewConfig = {
    weight: { label: "Peso (kg)", icon: Weight, color: "text-primary" },
    volume: { label: "Volumen total", icon: BarChart3, color: "text-amber-500" },
    sets: { label: "Series totales", icon: Zap, color: "text-emerald-500" },
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost" size="sm"
        className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1.5"><TrendingUp size={12} />{title}</span>
        <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="mt-2 bg-card border border-border/60 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-1">
            {(Object.keys(viewConfig) as ChartView[]).map(v => {
              const Icon = viewConfig[v].icon
              return (
                <Button
                  key={v} variant={view === v ? "secondary" : "ghost"} size="sm"
                  className="h-6 text-[10px] gap-1" onClick={() => setView(v)}
                >
                  <Icon size={10} />{viewConfig[v].label}
                </Button>
              )
            })}
          </div>

          {/* Leyenda de referencia — solo si hay datos de targetWeight */}
          {view === "weight" && hasTargets && (
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DARK_COLORS.text }} />
                Peso real
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm border border-dashed"
                  style={{ borderColor: DARK_COLORS.target }}
                />
                Prescripto
              </span>
            </div>
          )}

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={DARK_COLORS.grid} opacity={0.3} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: DARK_COLORS.textMuted }}
                  axisLine={{ stroke: DARK_COLORS.border }}
                  tickLine={false}
                />
                <YAxis
                  type="category" dataKey="name"
                  tick={{ fontSize: 10, fill: DARK_COLORS.text }}
                  axisLine={false} tickLine={false} width={75}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div
                        className="rounded-lg p-3 shadow-lg text-xs space-y-1.5"
                        style={{ backgroundColor: DARK_COLORS.tooltipBg, border: `1px solid ${DARK_COLORS.tooltipBorder}` }}
                      >
                        <p className="font-bold" style={{ color: DARK_COLORS.text }}>{d.name}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span style={{ color: DARK_COLORS.textMuted }}>{d.type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1" style={{ borderTop: `1px solid ${DARK_COLORS.border}` }}>
                          <span style={{ color: DARK_COLORS.textMuted }}>Último peso:</span>
                          <span className="font-medium text-right" style={{ color: DARK_COLORS.text }}>{d.weight} kg</span>
                          {d.target != null && (
                            <>
                              <span style={{ color: DARK_COLORS.textMuted }}>Prescripto:</span>
                              <span className="font-medium text-right" style={{ color: DARK_COLORS.target }}>{d.target} kg</span>
                              <span style={{ color: DARK_COLORS.textMuted }}>Diferencia:</span>
                              <span
                                className="font-bold text-right"
                                style={{ color: d.diff >= 0 ? "#34d399" : "#f87171" }}
                              >
                                {d.diff > 0 ? "+" : ""}{d.diff} kg
                              </span>
                            </>
                          )}
                          <span style={{ color: DARK_COLORS.textMuted }}>Máx peso:</span>
                          <span className="font-medium text-right" style={{ color: DARK_COLORS.text }}>{d.maxWeight} kg</span>
                          <span style={{ color: DARK_COLORS.textMuted }}>Promedio:</span>
                          <span className="font-medium text-right" style={{ color: DARK_COLORS.text }}>{d.avgWeight} kg</span>
                          <span style={{ color: DARK_COLORS.textMuted }}>Series:</span>
                          <span className="font-medium text-right" style={{ color: DARK_COLORS.text }}>{d.sets}</span>
                          <span style={{ color: DARK_COLORS.textMuted }}>Registros:</span>
                          <span className="font-medium text-right" style={{ color: DARK_COLORS.text }}>{d.entries}</span>
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey={view} radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
                {/* Marca de referencia superpuesta — solo en vista de peso */}
                {view === "weight" && hasTargets && (
                  <Bar dataKey="target" fill="transparent" barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`target-${index}`}
                        stroke={DARK_COLORS.target}
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                        fill="transparent"
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {chartData.slice(0, 6).map(d => (
              <div key={d.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium truncate" style={{ color: DARK_COLORS.text }}>{d.name}</p>
                  <p className="text-[9px]" style={{ color: DARK_COLORS.textMuted }}>
                    {d.weight} kg
                    {d.target != null && (
                      <span className={cn("ml-1", d.diff! >= 0 ? "text-emerald-400" : "text-red-400")}>
                        ({d.diff! > 0 ? "+" : ""}{d.diff})
                      </span>
                    )}
                    {" · "}{d.sets} series
                  </p>
                </div>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <Trophy size={12} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-400/80">
                <span className="font-medium">
                  {chartData.reduce((max, d) => (d.maxWeight > max.maxWeight ? d : max), chartData[0]).name}
                </span> tiene el mayor peso registrado:{" "}
                <span className="font-bold">{Math.max(...chartData.map(d => d.maxWeight))} kg</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}