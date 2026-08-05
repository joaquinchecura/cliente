// app/(dashboard)/perfil/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { 
  User, Mail, Phone, MapPin, AlertCircle, Calendar, 
  Shield, CreditCard, Dumbbell, TrendingUp, Pencil 
} from "lucide-react";
import Link from "next/link";
import EditarPerfil from "./EditarPerfil.tsx";

export default async function PerfilPage() {
  const member = await getCurrentMember();

  const [membership, stats] = await Promise.all([
    prisma.membership.findFirst({
      where: { memberId: member.id, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.$transaction([
      prisma.attendance.count({ where: { memberId: member.id } }),
      prisma.booking.count({ where: { memberId: member.id, status: 'CONFIRMED' } }),
      prisma.payment.count({ where: { memberId: member.id, status: 'COMPLETED' } }),
      prisma.bodyComposition.count({ where: { memberId: member.id } }),
    ]),
  ]);

  const [attendances, bookings, payments, bodyCompositions] = stats;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">👤 Mi Perfil</h2>
          <p className="text-zinc-400 mt-1">Tus datos y estadísticas</p>
        </div>
        <EditarPerfil member={member} />
      </div>

      {/* Datos personales */}
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
            <h3 className="text-lg font-semibold text-white">{member.firstName} {member.lastName}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[member.status]}`}>
              {statusLabels[member.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 text-sm p-3 bg-zinc-950 rounded-lg">
            <Mail size={16} className="text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Email</p>
              <p className="text-zinc-300">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm p-3 bg-zinc-950 rounded-lg">
            <Phone size={16} className="text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Teléfono</p>
              <p className="text-zinc-300">{member.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm p-3 bg-zinc-950 rounded-lg">
            <Shield size={16} className="text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">DNI</p>
              <p className="text-zinc-300">{member.dni}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm p-3 bg-zinc-950 rounded-lg">
            <MapPin size={16} className="text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Dirección</p>
              <p className="text-zinc-300">{member.address || "—"}, {member.city || "—"}</p>
            </div>
          </div>
          {member.birthDate && (
            <div className="flex items-center gap-3 text-sm p-3 bg-zinc-950 rounded-lg">
              <Calendar size={16} className="text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Nacimiento</p>
                <p className="text-zinc-300">{new Date(member.birthDate).toLocaleDateString('es-AR')}</p>
              </div>
            </div>
          )}
          {member.emergencyContactName && (
            <div className="flex items-center gap-3 text-sm p-3 bg-zinc-950 rounded-lg">
              <AlertCircle size={16} className="text-red-400" />
              <div>
                <p className="text-xs text-zinc-500">Emergencia</p>
                <p className="text-zinc-300">{member.emergencyContactName} — {member.emergencyContactPhone}</p>
              </div>
            </div>
          )}
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

      {/* Membresía actual */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-green-400" />
          Membresía Actual
        </h3>

        {membership ? (
          <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg">
            <div>
              <p className="text-lg font-bold text-white">{membership.plan.name}</p>
              <p className="text-sm text-zinc-400">{membership.plan.pack.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Vence</p>
              <p className={`text-sm font-medium ${new Date(membership.endDate) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                {new Date(membership.endDate).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-950 rounded-lg text-center text-zinc-500">
            <p>Sin membresía activa</p>
            <Link href="/pagos" className="text-sm text-blue-400 hover:text-blue-300 mt-1 inline-block">
              Ver pagos →
            </Link>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/asistencias" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <Dumbbell size={16} className="text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">{attendances}</p>
          <p className="text-xs text-zinc-500">Asistencias</p>
        </Link>

        <Link href="/clases" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <Calendar size={16} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{bookings}</p>
          <p className="text-xs text-zinc-500">Reservas</p>
        </Link>

        <Link href="/pagos" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <CreditCard size={16} className="text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{payments}</p>
          <p className="text-xs text-zinc-500">Pagos</p>
        </Link>

        <Link href="/progreso" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <TrendingUp size={16} className="text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{bodyCompositions}</p>
          <p className="text-xs text-zinc-500">Registros</p>
        </Link>
      </div>
    </div>
  );
}