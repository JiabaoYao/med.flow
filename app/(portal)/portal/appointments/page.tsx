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
      <h1 className="mt-4 text-xl font-bold text-slate-900 tracking-tight sm:mt-6 sm:text-2xl">Upcoming appointments</h1>
      <p className="mt-1 text-sm text-slate-500">From first appointment date until end date or up to 3 months</p>
      <div className="mt-4 card overflow-hidden sm:mt-6">
        {occurrences.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 sm:p-8">No upcoming appointments.</p>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="min-w-[32rem] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Date & time</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Provider</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Repeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {occurrences.map((occ) => (
                  <tr key={`${occ.appointmentId}-${occ.datetime.toISOString()}`} className="transition-colors hover:bg-primary-50/30">
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-900 sm:px-5 sm:py-4">{formatDateTime(occ.datetime)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">{occ.provider}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500 sm:px-5 sm:py-4">{occ.repeat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
