export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Check, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RenovarPage() {
  const member = await getCurrentMember();

  // Traer todos los planes activos de la organización
  const plans = await prisma.plan.findMany({
    where: {
      organizationId: member.organizationId ?? undefined,
      isActive: true,
    },
    orderBy: { price: 'asc' },
  });

  // Traer el GymConfig para el nombre y el teléfono
  const gymConfig = await prisma.gymConfig.findFirst({
    where: { organizationId: member.organizationId ?? undefined },
    select: { name: true, phone: true },
  });

  const gymName = gymConfig?.name || 'el gimnasio';
  const gymPhone = gymConfig?.phone?.replace(/\D/g, '') || '';

  // Armar el mensaje de WhatsApp
  const whatsappMessage = encodeURIComponent(
    `Hola ${gymName}! Soy ${member.firstName} ${member.lastName} (DNI: ${member.dni}). Quiero renovar mi membresía.`
  );
  const whatsappUrl = `https://wa.me/${gymPhone}?text=${whatsappMessage}`;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/pagos">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Renovar Membresía</h1>
          <p className="text-zinc-400 text-sm">Elegí el plan que querés contratar</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={20} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-400">¿Cómo renovar?</p>
          <p className="text-xs text-blue-300/70 mt-1">
            Elegí el plan que quieras, tocá "Contactar por WhatsApp" y coordiná el pago con el gimnasio.
            Tu membresía se activará automáticamente cuando confirmen el pago.
          </p>
        </div>
      </div>

      {/* Planes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Planes disponibles
        </h2>

        {plans.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-zinc-500">No hay planes disponibles en este momento</p>
            <p className="text-sm text-zinc-600 mt-1">Contactá a recepción para más información</p>
          </div>
        ) : (
          plans.map((plan) => {
            // Colores según el pack
            const packColors: Record<string, { bg: string; text: string; border: string }> = {
              GYM_ONLY: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
              CLASSES_ONLY: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
              GYM_CLASSES: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
              PERSONAL_TRAINER: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
              FULL: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
            }
            const style = packColors[plan.pack] || packColors.GYM_ONLY

            const packLabels: Record<string, string> = {
              GYM_ONLY: 'Solo gimnasio',
              CLASSES_ONLY: 'Solo clases',
              GYM_CLASSES: 'Gimnasio + clases',
              PERSONAL_TRAINER: 'Personal trainer',
              FULL: 'Plan completo',
            }

            return (
              <div
                key={plan.id}
                className={`bg-zinc-900 border ${style.border} rounded-2xl overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                          {packLabels[plan.pack] || plan.pack}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{plan.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-white">
                        ${Number(plan.price).toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-zinc-500">
                        / {plan.durationDays} días
                      </p>
                    </div>
                  </div>

                  {/* Features del plan */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{plan.durationDays} días de acceso</span>
                    </div>
                    {plan.classesIncluded > 0 ? (
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span>{plan.classesIncluded} clases incluidas</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span>Clases ilimitadas</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>
                        {plan.type === 'MONTHLY' ? 'Renovación mensual' :
                         plan.type === 'QUARTERLY' ? 'Renovación trimestral' :
                         plan.type === 'ANNUAL' ? 'Renovación anual' :
                         'Pago por clase'}
                      </span>
                    </div>
                  </div>

                  {/* Botón WhatsApp */}
                  {gymPhone ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                    >
                      <MessageCircle size={16} />
                      Contactar por WhatsApp
                    </a>
                  ) : (
                    <div className="mt-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-center text-sm">
                      Contactá a recepción para contratar
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <ShieldCheck size={18} className="text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          El pago se coordina directamente con el gimnasio. Una vez confirmado, tu membresía se activará automáticamente
          y vas a recibir un email con los detalles.
        </p>
      </div>
    </div>
  );
}