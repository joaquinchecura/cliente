// app/(dashboard)/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { 
  Dumbbell, Calendar, QrCode, TrendingUp, 
  CreditCard, ShieldCheck, Newspaper, User,
  Clock, AlertCircle, UserCircle2, CalendarCheck,
  ArrowRight, Flame, Target
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

// ─── Mini-card para el Resumen de Hoy ────────────────────────────
function SummaryCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sublabel,
  href,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sublabel?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-card border border-border rounded-xl p-3 hover:border-border/80 transition-colors group"
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", iconBg)}>
        <Icon size={16} className={iconColor} />
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-bold text-foreground mt-0.5 truncate">{value}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sublabel}</p>}
    </Link>
  );
}

// ─── Page principal ────────────────────────────────────────────
export default async function DashboardPage() {
  const member = await getCurrentMember();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [
    routinesCount,
    classBookingsCount,
    ptBookingsCount,
    attendancesCount,
    paymentsCount,
    lastComp,
    todayClass,
    todayPT,
  ] = await Promise.all([
    prisma.routine.count({ where: { memberId: member.id, isActive: true } }),
    prisma.booking.count({
      where: { memberId: member.id, status: "CONFIRMED", schedule: { maxCapacity: { gt: 1 } } },
    }),
    prisma.booking.count({
      where: { memberId: member.id, status: "CONFIRMED", schedule: { maxCapacity: 1 } },
    }),
    prisma.attendance.count({ where: { memberId: member.id, status: "ALLOWED" } }),
    prisma.payment.count({ where: { memberId: member.id, status: "COMPLETED" } }),
    prisma.bodyComposition.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
    }),
    // Próxima clase grupal hoy
    prisma.booking.findFirst({
      where: {
        memberId: member.id,
        status: "CONFIRMED",
        schedule: {
          date: { gte: startOfDay, lt: endOfDay },
          maxCapacity: { gt: 1 },
        },
      },
      include: { schedule: { include: { activity: true } } },
      orderBy: { schedule: { startTime: "asc" } },
    }),
    // Próxima sesión PT hoy
    prisma.booking.findFirst({
      where: {
        memberId: member.id,
        status: "CONFIRMED",
        schedule: {
          date: { gte: startOfDay, lt: endOfDay },
          maxCapacity: 1,
        },
      },
      include: { schedule: { include: { activity: true } } },
      orderBy: { schedule: { startTime: "asc" } },
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

  const classBookingSubtitle = classBookingsCount > 0
    ? `${classBookingsCount} reserva${classBookingsCount > 1 ? "s" : ""} confirmada${classBookingsCount > 1 ? "s" : ""}`
    : "Sin reservas esta semana";

  const ptBookingSubtitle = ptBookingsCount > 0
    ? `${ptBookingsCount} sesión${ptBookingsCount > 1 ? "es" : ""} confirmada${ptBookingsCount > 1 ? "s" : ""}`
    : "Sin sesiones coordinadas";

  const attendanceSubtitle = attendancesCount > 0
    ? `${attendancesCount} asistencia${attendancesCount > 1 ? "s" : ""} · Mostrá tu QR`
    : "Mostrá tu QR en recepción";

  const progressSubtitle = bmi
    ? `IMC: ${bmi.toFixed(1)} · ${bmiLabel}`
    : "Sin registros · Empezá hoy";

  const paymentSubtitle = paymentsCount > 0
    ? `${paymentsCount} pago${paymentsCount > 1 ? "s" : ""} realizado${paymentsCount > 1 ? "s" : ""}`
    : "Ver historial de pagos";

  const membershipSubtitle = activeMembership
    ? `${activeMembership.plan.name} · Vence ${new Date(activeMembership.endDate).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}`
    : "Sin membresía activa";

  const totalUpcoming = classBookingsCount + ptBookingsCount;
  const calendarSubtitle = totalUpcoming > 0
    ? `${totalUpcoming} sesión${totalUpcoming > 1 ? "es" : ""} próxima${totalUpcoming > 1 ? "s" : ""}`
    : "Ver clases y turnos";

  // Resumen de hoy
  const todayClassLabel = todayClass
    ? todayClass.schedule.activity.name
    : "Sin clases";
  const todayClassSub = todayClass
    ? `${todayClass.schedule.startTime.slice(0, 5)} hs`
    : undefined;

  const todayPTLabel = todayPT
    ? todayPT.schedule.activity.name
    : "Sin sesiones";
  const todayPTSub = todayPT
    ? `${todayPT.schedule.startTime.slice(0, 5)} hs`
    : undefined;

  const routineTodayLabel = routinesCount > 0 ? "Lista" : "Sin asignar";
  const routineTodaySub = routinesCount > 0
    ? "Entrenamiento activo"
    : "Hablá con tu profe";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
          ¡Hola, {member.firstName}!
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

      {/* ─── Resumen de hoy ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Hoy
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <SummaryCard
            icon={Flame}
            iconColor="text-orange-400"
            iconBg="bg-orange-500/15"
            label="Clases"
            value={todayClassLabel}
            sublabel={todayClassSub}
            href="/clases"
          />
          <SummaryCard
            icon={UserCircle2}
            iconColor="text-violet-400"
            iconBg="bg-violet-500/15"
            label="PT"
            value={todayPTLabel}
            sublabel={todayPTSub}
            href="/personaltrainer"
          />
          <SummaryCard
            icon={Target}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/15"
            label="Rutina"
            value={routineTodayLabel}
            sublabel={routineTodaySub}
            href="/rutina"
          />
        </div>
      </div>

      {/* ─── Cards principales ─────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {/* 1. Acceso al Gym (QR) — destacado */}
        <Link
          href="/asistencias"
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <QrCode size={28} className="text-white" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg">Acceso al Gym</p>
              <p className="text-white/80 text-xs mt-0.5 truncate">{attendanceSubtitle}</p>
            </div>
            <ArrowRight size={20} className="text-white/80 group-hover:translate-x-1 transition-transform" />
          </div>
          {/* Decoración */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full bg-white/5 blur-xl" />
        </Link>

        {/* 2. Mi Rutina */}
        <ActionCard
          href="/rutina"
          icon={Dumbbell}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/15"
          title="Mi Rutina de entrenamiento"
          subtitle={routineSubtitle}
        />

        {/* 3. Mis reservas de clases grupales */}
        <ActionCard
          href="/clases"
          icon={Calendar}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/15"
          title="Clases grupales"
          subtitle={classBookingSubtitle}
        />

        {/* 4. Mis reservas de PT */}
        <ActionCard
          href="/personaltrainer"
          icon={UserCircle2}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15"
          title="Personal Trainer"
          subtitle={ptBookingSubtitle}
        />

        {/* 5. Mi Calendario */}
        <ActionCard
          href="/calendario"
          icon={CalendarCheck}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/15"
          title="Mi Calendario"
          subtitle={calendarSubtitle}
        />

        {/* 6. Mi Progreso */}
        <ActionCard
          href="/progreso"
          icon={TrendingUp}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/15"
          title="Mi Progreso"
          subtitle={progressSubtitle}
        />

        {/* 7. Pagos */}
        <ActionCard
          href="/pagos"
          icon={CreditCard}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/15"
          title="Pagos"
          subtitle={paymentSubtitle}
        />

        {/* 8. Membresía (destacada) */}
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

        {/* 9. Noticias y novedades */}
        <ActionCard
          href="/noticias"
          icon={Newspaper}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/15"
          title="Noticias"
          subtitle="Últimas novedades del gym"
        />

        {/* 10. Mi Perfil */}
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