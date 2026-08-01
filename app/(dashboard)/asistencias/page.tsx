export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import QRDisplay from "./QRDisplay";

export default async function AsistenciasPage() {
  const member = await getCurrentMember();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Mi QR de Acceso</h2>
        <p className="text-zinc-400 mt-1">Mostrá este código en la entrada del gimnasio</p>
      </div>

      <QRDisplay 
        memberId={member.id} 
        memberName={`${member.firstName} ${member.lastName}`} 
        dni={member.dni} 
        status={member.status} 
      />

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3">¿Cómo usar?</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">1.</span>
            Mostrá este QR en la recepción del gimnasio
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">2.</span>
            El personal escaneará el código con la app Manager
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">3.</span>
            ¡Listo! Tu asistencia queda registrada automáticamente
          </li>
        </ul>
      </div>
    </div>
  );
}