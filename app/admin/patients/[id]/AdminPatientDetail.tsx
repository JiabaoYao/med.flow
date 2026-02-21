"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  appointments: Array<{
    id: string;
    provider: string;
    datetime: string;
    repeat: string;
    endDate: string | null;
  }>;
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    quantity: number;
    refillOn: string;
    refillSchedule: string;
    endDate: string | null;
  }>;
};

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminPatientDetail({ user: initialUser }: { user: User }) {
  const [user, setUser] = useState(initialUser);
  const [editingPatient, setEditingPatient] = useState(false);
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  const [password, setPassword] = useState("");
  const [addingAppointment, setAddingAppointment] = useState(false);
  const [addingPrescription, setAddingPrescription] = useState(false);

  const refetch = useCallback(async () => {
    const res = await fetch(`/api/patients/${initialUser.id}`);
    if (res.ok) {
      const data = await res.json();
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        appointments: data.appointments.map((a: { datetime: string; endDate: string | null }) => ({
          ...a,
          datetime: typeof a.datetime === "string" ? a.datetime : new Date(a.datetime).toISOString(),
          endDate: a.endDate ? (typeof a.endDate === "string" ? a.endDate : new Date(a.endDate).toISOString()) : null,
        })),
        prescriptions: data.prescriptions.map((p: { refillOn: string; endDate?: string | null }) => ({
          ...p,
          refillOn: typeof p.refillOn === "string" ? p.refillOn.slice(0, 10) : new Date(p.refillOn).toISOString().slice(0, 10),
          endDate: p.endDate ? (typeof p.endDate === "string" ? p.endDate.slice(0, 10) : new Date(p.endDate).toISOString().slice(0, 10)) : null,
        })),
      });
      setName(data.name);
      setEmail(data.email);
    }
  }, [initialUser.id]);

  async function handleUpdatePatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`/api/patients/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, ...(password ? { password } : {}) }),
    });
    if (res.ok) {
      setEditingPatient(false);
      setPassword("");
      await refetch();
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Patient</h2>
          {!editingPatient ? (
            <button
              type="button"
              onClick={() => setEditingPatient(true)}
              className="link-primary text-sm"
            >
              Edit
            </button>
          ) : null}
        </div>
        {editingPatient ? (
          <form onSubmit={handleUpdatePatient} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field max-w-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field max-w-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New password (optional)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="input-field max-w-xs" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => { setEditingPatient(false); setPassword(""); setName(user.name); setEmail(user.email); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{user.name} · {user.email}</p>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Appointments</h2>
            <p className="text-xs text-slate-500">Create, edit, or delete appointments below.</p>
          </div>
          <button type="button" onClick={() => setAddingAppointment(true)} className="link-primary text-sm">
            Add appointment
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Provider</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date & time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Repeat</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">End date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {user.appointments.map((appt) => (
                <tr key={appt.id} className="transition-colors hover:bg-primary-50/30">
                  <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-900">{appt.provider}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{formatDateTime(appt.datetime)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{appt.repeat}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{appt.endDate ? new Date(appt.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-sm">
                    <AppointmentRow appointment={appt} onDeleted={refetch} onUpdated={refetch} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {addingAppointment && (
          <AppointmentForm
            userId={user.id}
            onSaved={() => { setAddingAppointment(false); refetch(); }}
            onCancel={() => setAddingAppointment(false)}
          />
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Prescriptions</h2>
            <p className="text-xs text-slate-500">Create, edit, or delete prescriptions below.</p>
          </div>
          <button type="button" onClick={() => setAddingPrescription(true)} className="link-primary text-sm">
            Add prescription
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Medication</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Dosage</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">First refill date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Schedule</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">End date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {user.prescriptions.map((rx) => (
                <tr key={rx.id} className="transition-colors hover:bg-primary-50/30">
                  <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-900">{rx.medication}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{rx.dosage}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{rx.quantity}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{new Date(rx.refillOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{rx.refillSchedule}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{rx.endDate ? new Date(rx.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-sm">
                    <PrescriptionRow prescription={rx} onDeleted={refetch} onUpdated={refetch} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {addingPrescription && (
          <PrescriptionForm
            userId={user.id}
            onSaved={() => { setAddingPrescription(false); refetch(); }}
            onCancel={() => setAddingPrescription(false)}
          />
        )}
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  onDeleted,
  onUpdated,
}: {
  appointment: { id: string; provider: string; datetime: string; repeat: string; endDate: string | null };
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [provider, setProvider] = useState(appointment.provider);
  const [datetime, setDatetime] = useState(appointment.datetime.slice(0, 16));
  const [repeat, setRepeat] = useState(appointment.repeat);
  const [endDate, setEndDate] = useState(appointment.endDate?.slice(0, 10) ?? "");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, datetime, repeat, endDate: endDate || null }),
    });
    if (res.ok) {
      setEditing(false);
      onUpdated();
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this appointment?")) return;
    const res = await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="flex flex-wrap items-center justify-end gap-2">
        <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20">
          <option value="none">None</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date" className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <button type="submit" className="text-primary-600 text-xs font-medium hover:underline">Save</button>
        <button type="button" onClick={() => setEditing(false)} className="text-slate-500 text-xs hover:underline">Cancel</button>
      </form>
    );
  }
  return (
    <span className="flex justify-end gap-3">
      <button type="button" onClick={() => setEditing(true)} className="text-primary-600 font-medium hover:underline">Edit</button>
      <button type="button" onClick={handleDelete} className="text-rose-600 hover:underline">Delete</button>
    </span>
  );
}

function PrescriptionRow({
  prescription,
  onDeleted,
  onUpdated,
}: {
  prescription: { id: string; medication: string; dosage: string; quantity: number; refillOn: string; refillSchedule: string; endDate: string | null };
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [medication, setMedication] = useState(prescription.medication);
  const [dosage, setDosage] = useState(prescription.dosage);
  const [quantity, setQuantity] = useState(prescription.quantity);
  const [refillOn, setRefillOn] = useState(prescription.refillOn);
  const [refillSchedule, setRefillSchedule] = useState(prescription.refillSchedule);
  const [endDate, setEndDate] = useState(prescription.endDate ?? "");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/prescriptions/${prescription.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medication, dosage, quantity, refillOn, refillSchedule, endDate: endDate || null }),
    });
    if (res.ok) {
      setEditing(false);
      onUpdated();
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this prescription?")) return;
    const res = await fetch(`/api/prescriptions/${prescription.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="flex flex-wrap items-center justify-end gap-2">
        <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs w-16 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={0} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs w-14 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <input type="date" value={refillOn} onChange={(e) => setRefillOn(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" />
        <select value={refillSchedule} onChange={(e) => setRefillSchedule(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20">
          <option value="every_30_days">Every 30 days</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="weekly">Weekly</option>
        </select>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date" className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20" title="End date" />
        <button type="submit" className="text-primary-600 text-xs font-medium hover:underline">Save</button>
        <button type="button" onClick={() => setEditing(false)} className="text-slate-500 text-xs hover:underline">Cancel</button>
      </form>
    );
  }
  return (
    <span className="flex justify-end gap-3">
      <button type="button" onClick={() => setEditing(true)} className="text-primary-600 font-medium hover:underline">Edit</button>
      <button type="button" onClick={handleDelete} className="text-rose-600 hover:underline">Delete</button>
    </span>
  );
}

function AppointmentForm({
  userId,
  onSaved,
  onCancel,
}: {
  userId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [provider, setProvider] = useState("");
  const [datetime, setDatetime] = useState("");
  const [repeat, setRepeat] = useState("weekly");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/patients/${userId}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, datetime, repeat, endDate: endDate || null }),
    });
    setLoading(false);
    if (res.ok) onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-slate-50/50 p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Provider</label>
          <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date & time</label>
          <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Repeat</label>
          <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="input-field">
            <option value="none">None</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">End date (optional)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">Add</button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  );
}

function PrescriptionForm({
  userId,
  onSaved,
  onCancel,
}: {
  userId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [medications, setMedications] = useState<string[]>([]);
  const [dosages, setDosages] = useState<string[]>([]);
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [refillOn, setRefillOn] = useState("");
  const [refillSchedule, setRefillSchedule] = useState("every_30_days");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/reference")
      .then((r) => r.json())
      .then((d: { medications: string[]; dosages: string[] }) => {
        setMedications(d.medications || []);
        setDosages(d.dosages || []);
        setMedication((m) => m || d.medications?.[0] || "");
        setDosage((d0) => d0 || d.dosages?.[0] || "");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/patients/${userId}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medication: medication || (medications[0] ?? ""),
        dosage: dosage || (dosages[0] ?? ""),
        quantity,
        refill_on: refillOn,
        refill_schedule: refillSchedule,
        end_date: endDate || null,
      }),
    });
    setLoading(false);
    if (res.ok) onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-slate-50/50 p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Medication</label>
          <select value={medication} onChange={(e) => setMedication(e.target.value)} required className="input-field">
            {medications.length === 0 ? <option value="">Loading…</option> : null}
            {medications.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Dosage</label>
          <select value={dosage} onChange={(e) => setDosage(e.target.value)} required className="input-field">
            {dosages.length === 0 ? <option value="">Loading…</option> : null}
            {dosages.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} className="input-field w-20" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">First Refill Date</label>
          <input type="date" value={refillOn} onChange={(e) => setRefillOn(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Schedule</label>
          <select value={refillSchedule} onChange={(e) => setRefillSchedule(e.target.value)} className="input-field">
            <option value="every_30_days">Every 30 days</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">End date (optional)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">Add</button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  );
}
