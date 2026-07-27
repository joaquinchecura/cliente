export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { QrCode, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default async function AsistenciasPage() {
  const member = await getCurrentMember();

  const attendances = await prisma.attendance.findMany({
    where: { memberId: member.id },
    orderBy: { entryTime: "desc" },
    take: 30,
  });

  const statusIcon = {
    ALLOWED: <CheckCircle size={16} className="text-green-400" />,
    WARNING: <AlertTriangle size={16} className="text-yellow-400" />,
    DENIED: <XCircle size={16} className="text-red-400" />,
  };

  const statusText = {
    ALLOWED: "Ingreso permitido",
    WARNING: "Advertencia",
    DENIED: "Ingreso denegado",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📱 Mi QR de Acceso</h2>

      {/* QR Card */}
      <div className="bg-white rounded-xl p-6 flex flex-col items-center max-w-sm mx-auto">
        <p className="text-zinc-900 font-bold mb-4 text-center">{member.firstName} {member.lastName}</p>
        <QRCodeSVG 
          value={member.id} 
          size={200} 
          level="H"
          includeMargin={true}
        />
        <p className="text-zinc-500 text-xs mt-4 text-center">Mostrá este código en recepción para ingresar</p>
        <p className="text-zinc-400 text-xs mt-1 font-mono">{member.id.slice(0, 8)}...</p>
      </div>

      {/* Historial */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Historial de Ingresos</h3>
        {attendances.length === 0 ? (
          <p className="text-zinc-600 text-sm">No hay registros de asistencia.</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {attendances.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon[a.status as keyof typeof statusIcon]}
                  <div>
                    <p className="text-sm text-white">{statusText[a.status as keyof typeof statusText]}</p>
                    <p className="text-xs text-zinc-500">{a.qrToken.slice(0, 12)}...</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600">
                  {new Date(a.entryTime).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}