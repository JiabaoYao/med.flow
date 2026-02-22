import Link from "next/link";
import { prisma } from "@/lib/db";
import { expandAppointments } from "@/lib/appointments";

export const dynamic = "force-dynamic";

const NOW = new Date();
const IN_3_MONTHS = new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000);

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminPatientsPage() {
  const users = await prisma.user.findMany({
    include: {
      appointments: { orderBy: { datetime: "asc" } },
      prescriptions: { orderBy: { refillOn: "asc" } },
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">Patients</h1>
        <Link href="/admin/patients/new" className="btn-primary w-fit">
          New patient
        </Link>
      </div>
      <div className="mt-6 card overflow-hidden sm:mt-8">
        <div className="overflow-x-auto -mx-px">
          <table className="min-w-[32rem] w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">
                  Next upcoming appointment
                </th>
                <th className="sticky right-0 min-w-[5rem] bg-slate-50/80 px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((user) => {
                const occurrences = expandAppointments(
                  user.appointments.map((appt) => ({
                    id: appt.id,
                    provider: appt.provider,
                    datetime: appt.datetime,
                    repeat: appt.repeat,
                    endDate: appt.endDate,
                  })),
                  NOW,
                  IN_3_MONTHS
                );
                const nextApp = occurrences[0] ?? null;
                return (
                  <tr key={user.id} className="group transition-colors hover:bg-primary-50/30">
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-900 sm:px-5 sm:py-4">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">
                      {nextApp ? formatDateTime(nextApp.datetime) : "—"}
                    </td>
                    <td className="sticky right-0 min-w-[5rem] bg-white px-3 py-3 text-right text-sm shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] group-hover:bg-primary-50/30 sm:px-5 sm:py-4">
                      <Link
                        href={`/admin/patients/${user.id}`}
                        className="link-primary inline-block py-1"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
