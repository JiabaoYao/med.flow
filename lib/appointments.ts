/**
 * Expands a recurring appointment (first_appointment_date + repeat + end_date) into
 * all occurrence dates until end_date or up to maxEndDate (e.g. 3 months out).
 */
export function getAppointmentOccurrences(
  firstDate: Date,
  repeat: string,
  endDate: Date | null,
  maxEndDate: Date
): Date[] {
  const effectiveEnd = endDate && endDate < maxEndDate ? endDate : maxEndDate;
  const occurrences: Date[] = [];
  let current = new Date(firstDate.getTime());

  if (repeat === "none" || !repeat) {
    if (current <= effectiveEnd) occurrences.push(new Date(current.getTime()));
    return occurrences;
  }

  while (current <= effectiveEnd) {
    occurrences.push(new Date(current.getTime()));
    if (repeat === "weekly") {
      current.setDate(current.getDate() + 7);
    } else if (repeat === "monthly") {
      current.setMonth(current.getMonth() + 1);
    } else {
      break;
    }
  }

  return occurrences;
}

export type AppointmentSeries = {
  id: string;
  provider: string;
  datetime: Date;
  repeat: string;
  endDate: Date | null;
};

export type ExpandedOccurrence = {
  datetime: Date;
  provider: string;
  repeat: string;
  appointmentId: string;
};

/**
 * Expands appointment series into individual occurrences from first date until
 * end_date or up to maxEndDate, then filters to only future occurrences >= fromDate.
 */
export function expandAppointments(
  appointments: AppointmentSeries[],
  fromDate: Date,
  maxEndDate: Date
): ExpandedOccurrence[] {
  const result: ExpandedOccurrence[] = [];

  for (const appt of appointments) {
    const first = new Date(appt.datetime);
    const end = appt.endDate ? new Date(appt.endDate) : null;
    const dates = getAppointmentOccurrences(first, appt.repeat, end, maxEndDate);
    for (const d of dates) {
      if (d >= fromDate) {
        result.push({
          datetime: d,
          provider: appt.provider,
          repeat: appt.repeat,
          appointmentId: appt.id,
        });
      }
    }
  }

  result.sort((x, y) => x.datetime.getTime() - y.datetime.getTime());
  return result;
}
