export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Scale, Ruler, Activity, Target } from "lucide-react";
import ProgresoCharts from "./ProgresoCharts";
import NuevoRegistro from "./NuevoRegistro";

export default async function ProgresoPage() {
  const member = await getCurrentMember();

  const records = await prisma.bodyComposition.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const lastRecord = records[0] || null;
  const previousRecord = records[1] || null;

  // Calcular cambios
  const weightChange = lastRecord && previousRecord 
    ? Number(lastRecord.weight) - Number(previousRecord.weight) 
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Mi Progreso</h2>
        <p className="text-zinc-400 mt-1">Seguimiento de composición corporal</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={16} className="text-blue-400" />
            <span className="text-xs text-zinc-500">Peso actual</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {lastRecord ? `${Number(lastRecord.weight)}` : "—"}
          </p>
          <p className="text-xs text-zinc-500">kg</p>
          {weightChange !== null && (
            <p className={`text-xs mt-1 ${weightChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ruler size={16} className="text-green-400" />
            <span className="text-xs text-zinc-500">BMI</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {lastRecord?.bmi ? `${Number(lastRecord.bmi)}` : "—"}
          </p>
          <p className="text-xs text-zinc-500">
            {lastRecord?.bmi 
              ? Number(lastRecord.bmi) < 18.5 ? 'Bajo peso'
                : Number(lastRecord.bmi) < 25 ? 'Normal'
                : Number(lastRecord.bmi) < 30 ? 'Sobrepeso'
                : 'Obesidad'
              : 'Sin datos'}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-orange-400" />
            <span className="text-xs text-zinc-500">Grasa corporal</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {lastRecord?.bodyFatPercent ? `${Number(lastRecord.bodyFatPercent)}%` : "—"}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-purple-400" />
            <span className="text-xs text-zinc-500">Meta</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {lastRecord?.targetWeight ? `${Number(lastRecord.targetWeight)}` : "—"}
          </p>
          <p className="text-xs text-zinc-500">kg objetivo</p>
        </div>
      </div>

      {/* Gráficos */}
      {records.length > 1 && <ProgresoCharts records={[...records].reverse()} />}

      {/* Formulario nuevo registro */}
      <NuevoRegistro />

      {/* Historial */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Historial</h3>
        </div>
        {records.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <TrendingUp className="mx-auto mb-2 text-zinc-600" size={40} />
            <p>Sin registros todavía</p>
            <p className="text-sm text-zinc-600 mt-1">Completá tu primer registro arriba</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
            {records.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-500 w-20">
                    {new Date(r.createdAt).toLocaleDateString('es-AR')}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-white font-medium">{Number(r.weight)} kg</span>
                    {r.bmi && <span className="text-zinc-400">BMI: {Number(r.bmi)}</span>}
                    {r.bodyFatPercent && <span className="text-zinc-400">Grasa: {Number(r.bodyFatPercent)}%</span>}
                    {r.musclePercent && <span className="text-zinc-400">Músculo: {Number(r.musclePercent)}%</span>}
                  </div>
                </div>
                {r.notes && <span className="text-xs text-zinc-600 truncate max-w-[150px]">{r.notes}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}