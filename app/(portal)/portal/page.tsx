import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { expandAppointments } from "@/lib/appointments";
import { expandRefills } from "@/lib/refills";

export const dynamic = "force-dynamic";

const NOW = new Date();
const IN_7_DAYS = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
const IN_3_MONTHS = new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000);

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PortalDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      appointments: { orderBy: { datetime: "asc" } },
      prescriptions: { orderBy: { refillOn: "asc" } },
    },
  });
  if (!user) redirect("/");

  const allOccurrences = expandAppointments(
    user.appointments.map((a) => ({
      id: a.id,
      provider: a.provider,
      datetime: a.datetime,
      repeat: a.repeat,
      endDate: a.endDate,
    })),
    NOW,
    IN_3_MONTHS
  );
  const appointmentsIn7Days = allOccurrences.filter((occ) => occ.datetime <= IN_7_DAYS);
  const allRefills = expandRefills(
    user.prescriptions.map((rx) => ({
      id: rx.id,
      medication: rx.medication,
      dosage: rx.dosage,
      quantity: rx.quantity,
      refillOn: rx.refillOn,
      refillSchedule: rx.refillSchedule,
      endDate: rx.endDate,
    })),
    NOW,
    IN_3_MONTHS
  );
  const refillsIn7Days = allRefills.filter((r) => r.refillDate <= IN_7_DAYS);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Welcome, {user.name}
      </h1>

      <section className="card p-6">
        <h2 className="text-lg text-orange-500 font-semibold text-slate-900">Your info</h2>
        <p className="mt-2 text-slate-600">
          {user.name} · {user.email}
        </p>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Next 7 days – Appointments</h2>
          <Link href="/portal/appointments" className="link-primary text-sm">
            View all
          </Link>
        </div>
        {appointmentsIn7Days.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No appointments in the next 7 days.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {appointmentsIn7Days.map((occ) => (
              <li key={`${occ.appointmentId}-${occ.datetime.toISOString()}`} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 rounded-full bg-primary-400" aria-hidden />
                {formatDateTime(occ.datetime)} – {occ.provider}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Next 7 days – Medication refills</h2>
          <Link href="/portal/medications" className="link-primary text-sm">
            View all
          </Link>
        </div>
        {refillsIn7Days.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No refills due in the next 7 days.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {refillsIn7Days.map((r) => (
              <li key={`${r.prescriptionId}-${r.refillDate.toISOString()}`} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 rounded-full bg-primary-400" aria-hidden />
                {r.medication} {r.dosage} – refill {formatDate(r.refillDate)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
