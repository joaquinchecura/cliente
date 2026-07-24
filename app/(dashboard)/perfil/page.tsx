import { getCurrentMember } from "@/lib/member";
import { User, Mail, Phone, MapPin, AlertCircle } from "lucide-react";

export default async function PerfilPage() {
  const member = await getCurrentMember();

  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    FROZEN: "Congelado",
    OVERDUE: "Vencido",
    PENDING: "Pendiente",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "text-green-400 bg-green-500/10",
    INACTIVE: "text-zinc-400 bg-zinc-500/10",
    FROZEN: "text-blue-400 bg-blue-500/10",
    OVERDUE: "text-red-400 bg-red-500/10",
    PENDING: "text-yellow-400 bg-yellow-500/10",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">👤 Mi Perfil</h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          {member.photoUrl ? (
            <img src={member.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <User size={32} className="text-zinc-500" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{member.firstName} {member.lastName}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[member.status]}`}>
              {statusLabels[member.status]}
            </span>
          </div>
        </div>

        <div className="grid gap-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-zinc-500" />
            <span className="text-zinc-300">{member.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-zinc-500" />
            <span className="text-zinc-300">{member.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-zinc-500" />
            <span className="text-zinc-300">{member.address || "—"}, {member.city || "—"}</span>
          </div>
        </div>

        {member.medicalNotes && (
          <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
            <p className="text-xs text-yellow-500 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> Notas médicas
            </p>
            <p className="text-sm text-zinc-400 mt-1">{member.medicalNotes}</p>
          </div>
        )}

        {member.internalNotes && (
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-500 font-medium">Notas del entrenador</p>
            <p className="text-sm text-zinc-400 mt-1">{member.internalNotes}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-600">
        Si necesitás modificar tus datos personales, contactá a recepción.
      </p>
    </div>
  );
}