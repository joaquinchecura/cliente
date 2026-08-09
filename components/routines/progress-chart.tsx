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
} from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";

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

export function ProgressChart({ data, exerciseName }: ProgressChartProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    ...d,
    fecha: new Date(d.date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    }),
  }));

  const maxWeight = Math.max(...data.map((d) => d.weightUsed));
  const minWeight = Math.min(...data.map((d) => d.weightUsed));

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <TrendingUp size={12} />
        Ver progreso
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-3">{exerciseName}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  domain={[minWeight * 0.9, maxWeight * 1.1]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  label={{
                    value: "kg",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value) => [`${value} kg`, "Peso"]}
                />
                <Line
                  type="monotone"
                  dataKey="weightUsed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground/60">
            <span>Mín: {minWeight} kg</span>
            <span>Máx: {maxWeight} kg</span>
            <span>Registros: {data.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}