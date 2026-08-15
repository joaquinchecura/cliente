// app/(dashboard)/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { 
  Dumbbell, Calendar, QrCode, TrendingUp, 
  CreditCard, ShieldCheck, Newspaper, User,
  Clock, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Componente server para noticias ─────────────────────────────
async function NoticiasPreview() {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  if (news.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay novedades</p>;
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <Link
          key={item.id}
          href="/noticias"
          className="block p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors"
        >
          <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
        </Link>
      ))}
    </div>
  );
}

// ─── Card horizontal reutilizable ────────────────────────────────
interface ActionCardProps {
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: { text: string; color: string; bg: string };
  isMembership?: boolean;
}

function ActionCard({ href, icon: Icon, iconColor, iconBg, title, subtitle, badge, isMembership }: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 group",
        isMembership
          ? "bg-primary/5 border border-primary/20 hover:bg-primary/10"
          : "bg-card border border-border hover:border-border/80 hover:bg-card/80"
      )}
    >
      <div className={cn("rounded-xl p-3 shrink-0", iconBg)}>
        <Icon size={22} className={iconColor} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-bold text-[15px] truncate", isMembership && "text-primary")}>{title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
      </div>
      {badge ? (
        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0", badge.bg, badge.color)}>
          {badge.text}
        </span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/50 shrink-0">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      )}
    </Link>
  );
}

// ─── Page principal ────────────────────────────────────────────
export default async function DashboardPage() {
  const member = await getCurrentMember();

  const [
    routinesCount,
    bookingsCount,
    attendancesCount,
    paymentsCount,
    lastComp,
  ] = await Promise.all([
    prisma.routine.count({ where: { memberId: member.id, isActive: true } }),
    prisma.booking.count({ where: { memberId: member.id, status: "CONFIRMED" } }),
    prisma.attendance.count({ where: { memberId: member.id, status: "ALLOWED" } }),
    prisma.payment.count({ where: { memberId: member.id, status: "COMPLETED" } }),
    prisma.bodyComposition.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeMembership = member.memberships?.[0];
  const isPending = member.status === "PENDING";
  const isOverdue = member.status === "OVERDUE";

  // Calcular IMC
  const bmi = lastComp?.bmi ? Number(lastComp.bmi) : null;
  const bmiLabel = bmi
    ? bmi < 18.5 ? "Bajo peso"
      : bmi < 25 ? "Normal"
      : bmi < 30 ? "Sobrepeso"
      : "Obesidad"
    : null;

  // Subtítulos dinámicos
  const routineSubtitle = routinesCount > 0
    ? `${routinesCount} rutina${routinesCount > 1 ? "s" : ""} activa${routinesCount > 1 ? "s" : ""}`
    : "Sin rutinas asignadas";

  const bookingSubtitle = bookingsCount > 0
    ? `${bookingsCount} reserva${bookingsCount > 1 ? "s" : ""} confirmada${bookingsCount > 1 ? "s" : ""}`
    : "Sin reservas esta semana";

  const attendanceSubtitle = attendancesCount > 0
    ? `${attendancesCount} asistencia${attendancesCount > 1 ? "s" : ""} · Mostrá tu QR`
    : "Mostrá tu QR en recepción";

  const progressSubtitle = bmi
    ? `IMC: ${bmi.toFixed(1)} · ${bmiLabel}`
    : "Sin registros · Empezá hoy";

  const paymentSubtitle = paymentsCount > 0
    ? `${paymentsCount} pago${paymentsCount > 1 ? "s" : ""} realizado${paymentsCount > 1 ? "s" : ""} · Ver historial`
    : "Ver historial de pagos";

  const membershipSubtitle = activeMembership
    ? `${activeMembership.plan.name} · Vence ${new Date(activeMembership.endDate).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}`
    : "Sin membresía activa";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
          ¡Hola, {member.firstName}! 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Este es tu resumen de hoy</p>
      </div>

      {/* Alerta: Cuenta pendiente */}
      {isPending && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
            <Clock size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-400 text-sm">Cuenta pendiente de aprobación</p>
            <p className="text-xs text-amber-500/70 mt-0.5">
              Tu cuenta está siendo revisada por el equipo de Cultiva. Te notificaremos cuando esté activa.
            </p>
          </div>
        </div>
      )}

      {/* Alerta: Membresía vencida */}
      {isOverdue && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-400 text-sm">Membresía vencida</p>
            <p className="text-xs text-red-500/70 mt-0.5">
              Contactá a recepción para renovar tu membresía.
            </p>
          </div>
        </div>
      )}

      {/* ─── Cards principales ─────────────────────────────── */}
      <div className="flex flex-col gap-2.5">

        {/* 1. Mi Rutina */}
        <ActionCard
          href="/rutina"
          icon={Dumbbell}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/15"
          title="Mi Rutina"
          subtitle={routineSubtitle}
        />

        {/* 2. Mis Reservas */}
        <ActionCard
          href="/clases"
          icon={Calendar}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/15"
          title="Mis Reservas"
          subtitle={bookingSubtitle}
        />

        {/* 3. Acceso al Gym (QR) */}
        <ActionCard
          href="/asistencias"
          icon={QrCode}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/15"
          title="Acceso al Gym"
          subtitle={attendanceSubtitle}
        />

        {/* 4. Mi Progreso */}
        <ActionCard
          href="/progreso"
          icon={TrendingUp}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/15"
          title="Mi Progreso"
          subtitle={progressSubtitle}
        />

        {/* 5. Pagos */}
        <ActionCard
          href="/pagos"
          icon={CreditCard}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/15"
          title="Pagos"
          subtitle={paymentSubtitle}
        />

        {/* 6. Membresía (destacada) */}
        <ActionCard
          href="/pagos"
          icon={ShieldCheck}
          iconColor="text-primary"
          iconBg="bg-primary/20"
          title={activeMembership ? "Membresía Activa" : "Sin Membresía"}
          subtitle={membershipSubtitle}
          isMembership
          badge={activeMembership && !isOverdue ? { text: "Activa", color: "text-primary", bg: "bg-primary/20" } : undefined}
        />

        {/* 7. Noticias */}
        <ActionCard
          href="/noticias"
          icon={Newspaper}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/15"
          title="Noticias"
          subtitle="Últimas novedades del gym"
        />

        {/* 8. Mi Perfil */}
        <ActionCard
          href="/perfil"
          icon={User}
          iconColor="text-gray-400"
          iconBg="bg-gray-500/15"
          title="Mi Perfil"
          subtitle="Editar datos personales"
        />

      </div>
    </div>
  );
}