export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";

const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

async function reservar(formData: FormData) {
  "use server";
  const memberId = formData.get("memberId") as string;
  const scheduleId = formData.get("scheduleId") as string;

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { _count: { select: { bookings: true } } },
  });
  if (!schedule || schedule.isCancelled) return;
  if (schedule._count.bookings >= schedule.maxCapacity) return;

  await prisma.booking.create({
    data: { memberId, scheduleId, status: "CONFIRMED" },
  });
  revalidatePath("/dashboard/clases");
}

async function cancelar(formData: FormData) {
  "use server";
  const bookingId = formData.get("bookingId") as string;
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/dashboard/clases");
}

export default async function ClasesPage() {
  const member = await getCurrentMember();

  const schedules = await prisma.schedule.findMany({
    where: {
      isCancelled: false,
      date: { gte: new Date() },
    },
    include: {
      activity: true,
      bookings: { where: { memberId: member.id } },
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📅 Reservar Clases</h2>

      <div className="space-y-3">
        {schedules.map((s) => {
          const miReserva = s.bookings.find((b) => b.status === "CONFIRMED");
          const cupos = s.maxCapacity - s._count.bookings;
          const fecha = new Date(s.date);

          return (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-white">{s.activity.name}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {dias[fecha.getDay()]} {fecha.toLocaleDateString("es-AR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {cupos} cupos
                  </span>
                </div>
                {s.room && <p className="text-xs text-zinc-600">Sala: {s.room}</p>}
              </div>

              {miReserva ? (
                <form action={cancelar}>
                  <input type="hidden" name="bookingId" value={miReserva.id} />
                  <button className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm hover:bg-green-500/20 transition-colors flex items-center gap-2">
                    <CheckCircle size={16} /> Reservado
                  </button>
                </form>
              ) : cupos > 0 ? (
                <form action={reservar}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <input type="hidden" name="scheduleId" value={s.id} />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                    Reservar
                  </button>
                </form>
              ) : (
                <span className="px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm">Sin cupos</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}