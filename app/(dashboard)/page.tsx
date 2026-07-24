import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { 
  Calendar, Dumbbell, TrendingUp, QrCode, 
  CreditCard, AlertCircle 
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const member = await getCurrentMember();

  const [bookingsCount, routinesCount, attendancesCount, paymentsCount, lastWeight] = await Promise.all([
    prisma.booking.count({ where: { memberId: member.id, status: "CONFIRMED" } }),
    prisma.routine.count({ where: { memberId: member.id, isActive: true } }),
    prisma.attendance.count({ where: { memberId: member.id } }),
    prisma.payment.count({ where: { memberId: member.id, status: "COMPLETED" } }),
    prisma.weightLog.findFirst({ where: { memberId: member.id }, orderBy: { date: "desc" } }),
  ]);

  const activeMembership = member.memberships[0];
  const isOverdue = member.status === "OVERDUE";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">¡Hola, {member.firstName}! 👋</h2>
        <p className="text-zinc-400 mt-1">Este es tu resumen</p>
      </div>

      {isOverdue && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm">Tu membresía está vencida. Contactá a recepción para renovar.</p>
        </div>
      )}

      {activeMembership && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-400 font-medium">Membresía Activa</p>
            <p className="text-white font-semibold">{activeMembership.plan.name}</p>
          </div>
          <p className="text-xs text-zinc-500">Vence: {new Date(activeMembership.endDate).toLocaleDateString("es-AR")}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/clases" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
          <Calendar className="text-blue-400 mb-3" size={24} />
          <p className="text-2xl font-bold">{bookingsCount}</p>
          <p className="text-sm text-zinc-500">Reservas</p>
        </Link>
        <Link href="/dashboard/rutina" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
          <Dumbbell className="text-green-400 mb-3" size={24} />
          <p className="text-2xl font-bold">{routinesCount}</p>
          <p className="text-sm text-zinc-500">Rutinas</p>
        </Link>
        <Link href="/dashboard/asistencias" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
          <QrCode className="text-purple-400 mb-3" size={24} />
          <p className="text-2xl font-bold">{attendancesCount}</p>
          <p className="text-sm text-zinc-500">Asistencias</p>
        </Link>
        <Link href="/dashboard/progreso" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
          <TrendingUp className="text-orange-400 mb-3" size={24} />
          <p className="text-2xl font-bold">{lastWeight ? `${Number(lastWeight.weight)} kg` : "—"}</p>
          <p className="text-sm text-zinc-500">Último peso</p>
        </Link>
      </div>
    </div>
  );
}