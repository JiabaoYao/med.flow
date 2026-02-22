import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { expandRefills, type PrescriptionSeries } from "@/lib/refills";

export const dynamic = "force-dynamic";

const NOW = new Date();
const IN_3_MONTHS = new Date(NOW.getTime() + 90 * 24 * 60 * 60 * 1000);

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scheduleLabel(schedule: string): string {
  const s = (schedule || "").toLowerCase().replace(/_/g, " ");
  if (s === "every 30 days" || s === "every_30_days") return "Every 30 days";
  if (s === "monthly") return "Monthly";
  if (s === "quarterly") return "Quarterly";
  if (s === "weekly") return "Weekly";
  return schedule || "—";
}

export default async function PortalMedicationsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const prescriptions = await prisma.prescription.findMany({
    where: { userId: session.userId },
    orderBy: { refillOn: "asc" },
  });

  const series: PrescriptionSeries[] = prescriptions.map((rx: PrescriptionSeries) => ({
    id: rx.id,
    medication: rx.medication,
    dosage: rx.dosage,
    quantity: rx.quantity,
    refillOn: rx.refillOn,
    refillSchedule: rx.refillSchedule,
    endDate: rx.endDate,
  }));
  const projectedRefills = expandRefills(series, NOW, IN_3_MONTHS);

  return (
    <div>
      <Link href="/portal" className="link-primary text-sm">← Dashboard</Link>
      <h1 className="mt-4 text-xl font-bold text-slate-900 tracking-tight sm:mt-6 sm:text-2xl">Your prescriptions</h1>
      <p className="mt-1 text-sm text-slate-500">Refill dates projected from first refill date and schedule (next 3 months).</p>
      <div className="mt-4 card overflow-hidden sm:mt-6">
        {projectedRefills.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 sm:p-8">No refills in the next 3 months.</p>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="min-w-[36rem] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Medication</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Dosage</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Quantity</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Refill date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-4">Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {projectedRefills.map((row) => (
                  <tr key={`${row.prescriptionId}-${row.refillDate.toISOString()}`} className="transition-colors hover:bg-primary-50/30">
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-900 sm:px-5 sm:py-4">{row.medication}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">{row.dosage}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">{row.quantity}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">{formatDate(row.refillDate)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 sm:px-5 sm:py-4">{scheduleLabel(row.refillSchedule)}</td>
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
