"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, ChevronDown, BarChart3, Weight, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseProgress {
  exerciseName: string; exerciseType: string; date: string;
  weightUsed: number; setsCompleted: number; repsCompleted: string;
}

interface ProgressChartProps { data: ExerciseProgress[]; title?: string; }

type ChartView = "weight" | "volume" | "sets";

const TYPE_COLORS: Record<string, string> = {
  STRENGTH: "#3b82f6", CARDIO: "#ef4444", FUNCTIONAL: "#f59e0b", MOBILITY: "#10b981",
  STRETCHING: "#14b8a6", PLYOMETRIC: "#f97316", BALANCE: "#8b5cf6", TECHNIQUE: "#64748b",
  WARMUP: "#f43f5e", COOLDOWN: "#06b6d4", OTHER: "#6b7280",
};

export function ProgressChart({ data, title = "Progreso" }: ProgressChartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChartView>("weight");
  if (data.length === 0) return null;

  const exerciseGroups = data.reduce((acc, d) => {
    if (!acc[d.exerciseName]) acc[d.exerciseName] = { name: d.exerciseName, type: d.exerciseType, entries: [] };
    acc[d.exerciseName].entries.push(d);
    return acc;
  }, {} as Record<string, { name: string; type: string; entries: ExerciseProgress[] }>);

  const chartData = Object.values(exerciseGroups).map((group) => {
    const latest = group.entries[group.entries.length - 1];
    const allWeights = group.entries.map((e) => e.weightUsed);
    const maxWeight = Math.max(...allWeights);
    const avgWeight = allWeights.reduce((a, b) => a + b, 0) / allWeights.length;
    const totalSets = group.entries.reduce((sum, e) => sum + e.setsCompleted, 0);
    const totalVolume = group.entries.reduce((sum, e) => sum + e.weightUsed * (parseInt(e.repsCompleted) || 0) * e.setsCompleted, 0);
    return { name: group.name, type: group.type, weight: latest.weightUsed, maxWeight, avgWeight: Math.round(avgWeight * 10) / 10, sets: totalSets, volume: Math.round(totalVolume), entries: group.entries.length, color: TYPE_COLORS[group.type] || TYPE_COLORS["OTHER"] };
  });

  const viewConfig = {
    weight: { label: "Peso (kg)", icon: Weight, color: "text-primary" },
    volume: { label: "Volumen total", icon: BarChart3, color: "text-amber-500" },
    sets: { label: "Series totales", icon: Zap, color: "text-emerald-500" },
  };

  return (
    <div className="mt-2">
      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground w-full justify-between" onClick={() => setIsOpen(!isOpen)}>
        <span className="flex items-center gap-1.5"><TrendingUp size={12} />{title}</span>
        <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>
      {isOpen && (
        <div className="mt-2 bg-card border border-border/60 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-1">
            {(Object.keys(viewConfig) as ChartView[]).map((v) => {
              const Icon = viewConfig[v].icon;
              return <Button key={v} variant={view === v ? "secondary" : "ghost"} size="sm" className="h-6 text-[10px] gap-1" onClick={() => setView(v)}><Icon size={10} />{viewConfig[v].label}</Button>;
            })}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={75} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs space-y-1.5">
                      <p className="font-bold text-foreground">{d.name}</p>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-muted-foreground">{d.type}</span></div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 border-t border-border/50">
                        <span className="text-muted-foreground">Último peso:</span><span className="font-medium text-right">{d.weight} kg</span>
                        <span className="text-muted-foreground">Máx peso:</span><span className="font-medium text-right">{d.maxWeight} kg</span>
                        <span className="text-muted-foreground">Promedio:</span><span className="font-medium text-right">{d.avgWeight} kg</span>
                        <span className="text-muted-foreground">Series:</span><span className="font-medium text-right">{d.sets}</span>
                        <span className="text-muted-foreground">Registros:</span><span className="font-medium text-right">{d.entries}</span>
                      </div>
                    </div>
                  );
                }} />
                <Bar dataKey={view} radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {chartData.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-foreground truncate">{d.name}</p>
                  <p className="text-[9px] text-muted-foreground">{d.weight} kg • {d.sets} series</p>
                </div>
              </div>
            ))}
          </div>
          {chartData.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <Trophy size={12} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-400/80">
                <span className="font-medium">{chartData.reduce((max, d) => (d.maxWeight > max.maxWeight ? d : max), chartData[0]).name}</span> tiene el mayor peso registrado: <span className="font-bold">{Math.max(...chartData.map((d) => d.maxWeight))} kg</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}