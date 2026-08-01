export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import QRDisplay from "./QRDisplay";
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default async function AsistenciasPage() {
  const member = await getCurrentMember();

  // Traer historial de asistencias
  const attendances = await prisma.attendance.findMany({
    where: { memberId: member.id },
    orderBy: { entryTime: 'desc' },
    take: 50,
  });

  const total = attendances.length;
  const permitidos = attendances.filter(a => a.status === 'ALLOWED').length;
  const denegados = attendances.filter(a => a.status === 'DENIED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Mi Asistencia</h2>
        <p className="text-zinc-400 mt-1">Controlá tus ingresos al gimnasio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-zinc-500 mt-1">Total</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{permitidos}</p>
          <p className="text-xs text-zinc-500 mt-1">Permitidos</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{denegados}</p>
          <p className="text-xs text-zinc-500 mt-1">Denegados</p>
        </div>
      </div>

      {/* QR */}
      <QRDisplay 
        memberId={member.id} 
        memberName={`${member.firstName} ${member.lastName}`} 
        dni={member.dni} 
        status={member.status} 
      />

      {/* Historial */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Calendar size={16} className="text-blue-400" />
            Historial de asistencias
          </h3>
        </div>
        
        {attendances.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto mb-2 text-zinc-600" size={40} />
            <p className="text-zinc-500">Aún no tenés asistencias registradas</p>
            <p className="text-sm text-zinc-600 mt-1">Escaneá tu QR en la recepción para empezar</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {attendances.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  {a.status === 'ALLOWED' ? (
                    <CheckCircle size={18} className="text-green-400" />
                  ) : a.status === 'DENIED' ? (
                    <XCircle size={18} className="text-red-400" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-400" />
                  )}
                  <div>
                    <p className="text-sm text-white">
                      {new Date(a.entryTime).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(a.entryTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  a.status === 'ALLOWED' 
                    ? 'bg-green-500/10 text-green-400' 
                    : a.status === 'DENIED'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {a.status === 'ALLOWED' ? 'Ingreso permitido' : a.status === 'DENIED' ? 'Denegado' : 'Advertencia'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}