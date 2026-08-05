// app/(dashboard)/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { 
  Calendar, Dumbbell, TrendingUp, QrCode, 
  AlertCircle, Clock, ShieldCheck, Newspaper 
} from "lucide-react";
import Link from "next/link";

// Componente server para noticias
async function NoticiasPreview() {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  if (news.length === 0) {
    return <p className="text-sm text-zinc-500">No hay novedades</p>;
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <Link
          key={item.id}
          href="/noticias"
          className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
          <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{item.content}</p>
        </Link>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const member = await getCurrentMember();

  const [bookingsCount, routinesCount, attendancesCount, paymentsCount, lastComp] = await Promise.all([
    prisma.booking.count({ where: { memberId: member.id, status: "CONFIRMED" } }),
    prisma.routine.count({ where: { memberId: member.id, isActive: true } }),
    prisma.attendance.count({ where: { memberId: member.id } }),
    prisma.payment.count({ where: { memberId: member.id, status: "COMPLETED" } }),
    prisma.bodyComposition.findFirst({ where: { memberId: member.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const activeMembership = member.memberships[0];
  const isPending = member.status === "PENDING";
  const isOverdue = member.status === "OVERDUE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">
          ¡Hola, {member.firstName}! 👋
        </h2>
        <p className="text-zinc-400 mt-1">Este es tu resumen de hoy</p>
      </div>

      {/* Estado Pendiente */}
      {isPending && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Clock size={24} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-400">Cuenta pendiente de aprobación</h3>
            <p className="text-sm text-amber-500/70 mt-1">
              Tu cuenta está siendo revisada por el equipo de Cultiva. 
              Te notificaremos cuando esté activa.
            </p>
          </div>
        </div>
      )}

      {/* Membresía Vencida */}
      {isOverdue && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-400">Membresía vencida</h3>
            <p className="text-sm text-red-500/70 mt-1">
              Contactá a recepción para renovar tu membresía.
            </p>
          </div>
        </div>
      )}

      {/* Membresía Activa */}
      {activeMembership && !isPending && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-400 font-medium">Membresía Activa</p>
              <p className="text-white font-semibold text-lg">{activeMembership.plan.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Vence</p>
            <p className="text-sm text-zinc-300 font-medium">
              {new Date(activeMembership.endDate).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/clases" className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200">
          <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
            <Calendar className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{bookingsCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Reservas</p>
        </Link>

        <Link href="/rutina" className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200">
          <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
            <Dumbbell className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{routinesCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Rutinas</p>
        </Link>

        <Link href="/asistencias" className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200">
          <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
            <QrCode className="text-purple-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{attendancesCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Asistencias</p>
        </Link>

        <Link href="/progreso" className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200">
          <div className="p-3 bg-orange-500/10 rounded-xl w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
            <TrendingUp className="text-orange-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">
            {lastComp ? `${Number(lastComp.weight)}` : "—"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {lastComp ? "kg (último peso)" : "Sin registros"}
          </p>
        </Link>
      </div>

      {/* Noticias recientes */}
      {!isPending && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Newspaper size={18} className="text-blue-400" />
              Últimas Noticias
            </h3>
            <Link href="/noticias" className="text-sm text-blue-400 hover:text-blue-300">
              Ver todas →
            </Link>
          </div>
          <NoticiasPreview />
        </div>
      )}

      {/* Quick Actions */}
      {!isPending && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/clases" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reservar Clase
            </Link>
            <Link 
              href="/asistencias" 
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Ver mi QR
            </Link>
            <Link 
              href="/progreso" 
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Registrar Peso
            </Link>
            <Link 
              href="/noticias" 
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Noticias
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}