import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const medication = typeof body.medication === "string" ? body.medication.trim() : undefined;
  const dosage = typeof body.dosage === "string" ? body.dosage.trim() : undefined;
  const quantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity);
  const refillOn = body.refill_on ?? body.refillOn;
  const refillSchedule = typeof body.refill_schedule === "string" ? body.refill_schedule : (body.refillSchedule as string);
  const endDate = body.end_date ?? body.endDate;

  const update: {
    medication?: string;
    dosage?: string;
    quantity?: number;
    refillOn?: Date;
    refillSchedule?: string;
    endDate?: Date | null;
  } = {};
  if (medication !== undefined) update.medication = medication;
  if (dosage !== undefined) update.dosage = dosage;
  if (typeof quantity === "number" && !Number.isNaN(quantity)) update.quantity = quantity;
  if (refillOn !== undefined) update.refillOn = new Date(refillOn);
  if (refillSchedule !== undefined) update.refillSchedule = refillSchedule;
  if (endDate !== undefined) update.endDate = endDate ? new Date(endDate) : null;

  const prescription = await prisma.prescription.update({
    where: { id },
    data: update,
  });
  return NextResponse.json(prescription);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.prescription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
