"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartRecord {
  createdAt: string;
  weight: number;
  bodyFatPercent: number | null;
  musclePercent: number | null;
  bmi: number | null;
}

interface Props {
  records: ChartRecord[];
}

export default function ProgresoCharts({ records }: Props) {
  const data = records.map((r) => ({
    fecha: new Date(r.createdAt).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    }),
    peso: r.weight,
    grasa: r.bodyFatPercent,
    musculo: r.musclePercent,
    bmi: r.bmi,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-4">Evolución</h3>

      <div className="space-y-6">
        {/* Peso */}
        <div>
          <p className="text-xs text-zinc-500 mb-2 font-medium">Peso (kg)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="fecha" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grasa y Músculo */}
        <div>
          <p className="text-xs text-zinc-500 mb-2 font-medium">Composición corporal (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="fecha" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
              />
              <Line
                type="monotone"
                dataKey="grasa"
                name="% Grasa"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="musculo"
                name="% Músculo"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}