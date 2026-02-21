import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prescriptions = await prisma.prescription.findMany({
    where: { userId: id },
    orderBy: { refillOn: "asc" },
  });
  return NextResponse.json(prescriptions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const medication = typeof body.medication === "string" ? body.medication.trim() : "";
  const dosage = typeof body.dosage === "string" ? body.dosage.trim() : "";
  const quantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity) || 0;
  const refillOn = body.refill_on ?? body.refillOn;
  const refillSchedule = typeof body.refill_schedule === "string" ? body.refill_schedule : (body.refillSchedule as string) || "monthly";
  const endDate = body.end_date ?? body.endDate;

  if (!medication || !dosage || !refillOn) {
    return NextResponse.json(
      { error: "Medication, dosage, and refill date required" },
      { status: 400 }
    );
  }

  const prescription = await prisma.prescription.create({
    data: {
      userId: id,
      medication,
      dosage,
      quantity: Math.max(0, quantity),
      refillOn: new Date(refillOn),
      refillSchedule: refillSchedule || "monthly",
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  return NextResponse.json(prescription);
}
