import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { expandAppointments } from "@/lib/appointments";

export const dynamic = "force-dynamic";

const NOW = new Date();
const IN_3_MONTHS = new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000);

function formatDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PortalAppointmentsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const rawAppointments = await prisma.appointment.findMany({
    where: { userId: session.userId },
    orderBy: { datetime: "asc" },
  });

  const occurrences = expandAppointments(
    rawAppointments.map((a) => ({
      id: a.id,
      provider: a.provider,
      datetime: a.datetime,
      repeat: a.repeat,
      endDate: a.endDate,
    })),
    NOW,
    IN_3_MONTHS
  );

  return (
    <div>
      <Link href="/portal" className="link-primary text-sm">← Dashboard</Link>
      <h1 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">Upcoming appointments</h1>
      <p className="mt-1 text-sm text-slate-500">From first appointment date until end date or up to 3 months</p>
      <div className="mt-6 card overflow-hidden">
        {occurrences.length === 0 ? (
          <p className="p-8 text-sm text-slate-500">No upcoming appointments.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date & time</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Provider</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Repeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {occurrences.map((occ) => (
                <tr key={`${occ.appointmentId}-${occ.datetime.toISOString()}`} className="transition-colors hover:bg-primary-50/30">
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">{formatDateTime(occ.datetime)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{occ.provider}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{occ.repeat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
