/**
 * Expands refill dates from first refill date + schedule until end_date or maxEndDate.
 * Schedule: "every_30_days" | "monthly" | "quarterly" | "weekly"
 */
export function getRefillOccurrences(
  firstRefillDate: Date,
  refillSchedule: string,
  endDate: Date | null,
  maxEndDate: Date
): Date[] {
  const effectiveEnd = endDate && endDate < maxEndDate ? endDate : maxEndDate;
  const occurrences: Date[] = [];
  let current = new Date(firstRefillDate.getTime());

  while (current <= effectiveEnd) {
    occurrences.push(new Date(current.getTime()));
    const schedule = (refillSchedule || "monthly").toLowerCase().replace(/\s+/g, "_");
    if (schedule === "every_30_days" || schedule === "every30days") {
      current.setDate(current.getDate() + 30);
    } else if (schedule === "weekly") {
      current.setDate(current.getDate() + 7);
    } else if (schedule === "monthly") {
      current.setMonth(current.getMonth() + 1);
    } else if (schedule === "quarterly") {
      current.setMonth(current.getMonth() + 3);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }

  return occurrences;
}

export type PrescriptionSeries = {
  id: string;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: Date;
  refillSchedule: string;
  endDate: Date | null;
};

export type ExpandedRefill = {
  refillDate: Date;
  medication: string;
  dosage: string;
  quantity: number;
  refillSchedule: string;
  prescriptionId: string;
};

/**
 * Expands prescriptions into refill occurrences from first refill date and schedule
 * until end_date or maxEndDate. Only includes refill dates >= fromDate.
 */
export function expandRefills(
  prescriptions: PrescriptionSeries[],
  fromDate: Date,
  maxEndDate: Date
): ExpandedRefill[] {
  const result: ExpandedRefill[] = [];

  for (const p of prescriptions) {
    const first = new Date(p.refillOn);
    const end = p.endDate ? new Date(p.endDate) : null;
    const dates = getRefillOccurrences(first, p.refillSchedule, end, maxEndDate);
    for (const d of dates) {
      if (d >= fromDate && d <= maxEndDate) {
        result.push({
          refillDate: d,
          medication: p.medication,
          dosage: p.dosage,
          quantity: p.quantity,
          refillSchedule: p.refillSchedule,
          prescriptionId: p.id,
        });
      }
    }
  }

  result.sort((a, b) => a.refillDate.getTime() - b.refillDate.getTime());
  return result;
}
