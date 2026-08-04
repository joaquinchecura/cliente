export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { CreditCard, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default async function PagosPage() {
  const member = await getCurrentMember();

  const payments = await prisma.payment.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: 'desc' },
  });

  const totalPagado = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Mis Pagos</h2>
        <p className="text-zinc-400 mt-1">Historial de pagos realizados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">${totalPagado.toLocaleString('es-AR')}</p>
          <p className="text-xs text-zinc-500 mt-1">Total pagado</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{payments.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Pagos realizados</p>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Historial</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <CreditCard className="mx-auto mb-2 text-zinc-600" size={40} />
            <p>Sin pagos registrados</p>
            <p className="text-sm text-zinc-600 mt-1">Contactá a recepción para más información</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {payments.map((p) => (
              <div key={p.id} className="px-4 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    p.status === 'COMPLETED' ? 'bg-green-500/10' :
                    p.status === 'PENDING' ? 'bg-amber-500/10' :
                    'bg-red-500/10'
                  }`}>
                    {p.status === 'COMPLETED' ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : p.status === 'PENDING' ? (
                      <Clock size={20} className="text-amber-400" />
                    ) : (
                      <AlertCircle size={20} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{p.concept}</p>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(p.createdAt).toLocaleDateString('es-AR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        {p.method === 'CASH' ? 'Efectivo' :
                         p.method === 'TRANSFER' ? 'Transferencia' :
                         p.method === 'MERCADOPAGO' ? 'MercadoPago' :
                         p.method === 'CARD' ? 'Tarjeta' : 'Otro'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    ${Number(p.amount).toLocaleString('es-AR')}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                    p.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {p.status === 'COMPLETED' ? 'Pagado' :
                     p.status === 'PENDING' ? 'Pendiente' :
                     p.status === 'FAILED' ? 'Fallido' : 'Reembolsado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}