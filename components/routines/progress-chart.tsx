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
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <TrendingUp size={12} />
        Ver progreso
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-3">{exerciseName}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <YAxis
                  domain={[minWeight * 0.9, maxWeight * 1.1]}
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={{ stroke: "#3f3f46" }}
                  label={{
                    value: "kg",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "#71717a" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(value) => [`${value} kg`, "Peso"]}
                />
                <Line
                  type="monotone"
                  dataKey="weightUsed"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#4ade80" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600">
            <span>Mín: {minWeight} kg</span>
            <span>Máx: {maxWeight} kg</span>
            <span>Registros: {data.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}