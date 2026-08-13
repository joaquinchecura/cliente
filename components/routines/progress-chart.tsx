"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp, ChevronDown, BarChart3, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgressData {
  date: string;
  weightUsed: number;
  setsCompleted: number;
  repsCompleted: string;
}

interface ProgressChartProps {
  data: ProgressData[];
  exerciseName: string;
}

type ChartView = "weight" | "volume";

export function ProgressChart({ data, exerciseName }: ProgressChartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChartView>("weight");

  if (data.length < 2) return null;

  const chartData = data.map((d, i) => {
    const reps = parseInt(d.repsCompleted) || 0;
    return {
      ...d,
      fecha: new Date(d.date).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
      }),
      volumen: d.weightUsed * reps * d.setsCompleted,
      index: i + 1,
    };
  });

  const maxWeight = Math.max(...data.map((d) => d.weightUsed));
  const minWeight = Math.min(...data.map((d) => d.weightUsed));
  const avgWeight = data.reduce((sum, d) => sum + d.weightUsed, 0) / data.length;

  const maxVolume = Math.max(...chartData.map((d) => d.volumen));

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1.5">
          <TrendingUp size={12} />
          Progreso de {exerciseName}
        </span>
        <ChevronDown
          size={12}
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen && (
        <div className="mt-2 bg-card border border-border/60 rounded-xl p-4 space-y-3">
          {/* View toggle */}
          <div className="flex items-center gap-1">
            <Button
              variant={view === "weight" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={() => setView("weight")}
            >
              <Weight size={10} />
              Peso
            </Button>
            <Button
              variant={view === "volume" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={() => setView("volume")}
            >
              <BarChart3 size={10} />
              Volumen
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xs font-bold text-foreground">{maxWeight}</p>
              <p className="text-[9px] text-muted-foreground">Máx (kg)</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xs font-bold text-foreground">{avgWeight.toFixed(1)}</p>
              <p className="text-[9px] text-muted-foreground">Prom (kg)</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xs font-bold text-foreground">{data.length}</p>
              <p className="text-[9px] text-muted-foreground">Registros</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              {view === "weight" ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[minWeight * 0.9, maxWeight * 1.1]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine
                    y={avgWeight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: "10px" }}
                    formatter={(value: any) => [`${value} kg`, "Peso"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="weightUsed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#weightGradient)"
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  />
                </AreaChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, maxVolume * 1.1]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: "10px" }}
                    formatter={(value: any) => [`${Math.round(value)} kg`, "Volumen"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="volumen"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    fill="url(#volumeGradient)"
                    dot={{ fill: "hsl(38, 92%, 50%)", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "hsl(38, 92%, 50%)", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <p className="text-[9px] text-muted-foreground/50 text-center">
            {view === "weight" ? "Línea punteada = promedio" : "Volumen = peso × reps × series"}
          </p>
        </div>
      )}
    </div>
  );
}