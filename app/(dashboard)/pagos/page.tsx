export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

const statusConfig = {
  COMPLETED: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", label: "Completado" },
  PENDING: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Pendiente" },
  FAILED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Fallido" },
  REFUNDED: { icon: XCircle, color: "text-zinc-400", bg: "bg-zinc-500/10", label: "Reembolsado" },
};

const methodLabels: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADOPAGO: "Mercado Pago",
  CARD: "Tarjeta",
  OTHER: "Otro",
};

export default async function PagosPage() {
  const member = await getCurrentMember();

  const payments = await prisma.payment.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
  });

  const totalPagado = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">💳 Mis Pagos</h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm text-zinc-500">Total pagado</p>
        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalPagado)}</p>
      </div>

      {payments.length === 0 ? (
        <p className="text-zinc-600 text-sm">No hay pagos registrados.</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {payments.map((p) => {
            const config = statusConfig[p.status as keyof typeof statusConfig];
            const Icon = config.icon;
            return (
              <div key={p.id} className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{p.concept}</p>
                    <p className="text-xs text-zinc-500">{methodLabels[p.method]} • {formatDate(p.createdAt)}</p>
                    {p.reference && <p className="text-xs text-zinc-600">Ref: {p.reference}</p>}
                  </div>
                </div>
                <p className="font-semibold text-white">{formatCurrency(p.amount)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}