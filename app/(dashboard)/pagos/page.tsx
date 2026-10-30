export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { CreditCard, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function PagosPage() {
  const member = await getCurrentMember();

  const [payments, memberships] = await Promise.all([
    prisma.payment.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.membership.findMany({
      where: { memberId: member.id },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
      take: 1,
    }),
  ]);

  const activeMembership = memberships[0];
  const totalPagado = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Calcular días restantes de la membresía
  const now = new Date();
  const daysRemaining = activeMembership
    ? Math.ceil((new Date(activeMembership.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  // Color y mensaje según estado
  let membershipBg = "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20";
  let membershipIconColor = "text-emerald-400";
  let membershipText = "text-emerald-400";
  let membershipLabel = "Membresía Activa";

  if (isExpired) {
    membershipBg = "from-red-500/10 to-red-500/5 border-red-500/20";
    membershipIconColor = "text-red-400";
    membershipText = "text-red-400";
    membershipLabel = "Membresía Vencida";
  } else if (isExpiringSoon) {
    membershipBg = "from-amber-500/10 to-amber-500/5 border-amber-500/20";
    membershipIconColor = "text-amber-400";
    membershipText = "text-amber-400";
    membershipLabel = "Vence pronto";
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white">Mis Pagos</h2>
        <p className="text-zinc-400 mt-1">Historial de pagos y estado de membresía</p>
      </div>

      {/* ─── Card de Membresía ─────────────────────────────── */}
      <div className={`bg-gradient-to-br ${membershipBg} border rounded-2xl p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${membershipIconColor}`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${membershipText}`}>
                {membershipLabel}
              </p>
              <p className="text-lg font-bold text-white mt-0.5">
                {activeMembership ? activeMembership.plan.name : 'Sin membresía'}
              </p>
            </div>
          </div>
        </div>

        {activeMembership && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-zinc-400">Vence el</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {new Date(activeMembership.endDate).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'America/Argentina/Buenos_Aires',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Días restantes</p>
              <p className={`text-sm font-semibold mt-0.5 ${membershipText}`}>
                {isExpired ? 'Vencida' : `${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        )}

        {/* Botón de renovación */}
        {(isExpired || isExpiringSoon) && (
          <Link
            href="/pagos/renovar"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors"
          >
            <Sparkles size={16} />
            {isExpired ? 'Renovar membresía' : 'Renovar antes de que venza'}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* ─── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">${totalPagado.toLocaleString('es-AR')}</p>
          <p className="text-xs text-emerald-400/70 mt-1">Total pagado</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <CreditCard size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{payments.length}</p>
          <p className="text-xs text-blue-400/70 mt-1">Pagos realizados</p>
        </div>
      </div>

      {/* ─── Lista de pagos ─────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">Historial de pagos</h3>
          <span className="text-xs text-zinc-500">{payments.length} registros</span>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <CreditCard className="mx-auto mb-2 text-zinc-600" size={40} />
            <p>Sin pagos registrados</p>
            <p className="text-sm text-zinc-600 mt-1">Contactá a recepción para más información</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
            {payments.map((p) => {
              const statusColors = {
                COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Pagado', icon: CheckCircle },
                PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pendiente', icon: Clock },
                FAILED: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Fallido', icon: AlertCircle },
                REFUNDED: { bg: 'bg-violet-500/10', text: 'text-violet-400', label: 'Reembolsado', icon: AlertCircle },
              }
              const status = statusColors[p.status as keyof typeof statusColors] || statusColors.FAILED
              const StatusIcon = status.icon

              return (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${status.bg}`}>
                      <StatusIcon size={18} className={status.text} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{p.concept}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(p.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'America/Argentina/Buenos_Aires',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} />
                          {p.method === 'CASH' ? 'Efectivo' :
                           p.method === 'TRANSFER' ? 'Transferencia' :
                           p.method === 'MERCADOPAGO' ? 'MercadoPago' :
                           p.method === 'CARD' ? 'Tarjeta' : 'Otro'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-base font-bold text-white">
                      ${Number(p.amount).toLocaleString('es-AR')}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}