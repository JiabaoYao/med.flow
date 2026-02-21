import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const provider = typeof body.provider === "string" ? body.provider.trim() : undefined;
  const datetime = body.datetime;
  const repeat = typeof body.repeat === "string" ? body.repeat : undefined;
  const endDate = body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined;

  const update: { provider?: string; datetime?: Date; repeat?: string; endDate?: Date | null } = {};
  if (provider !== undefined) update.provider = provider;
  if (datetime !== undefined) update.datetime = new Date(datetime);
  if (repeat !== undefined) update.repeat = repeat;
  if (endDate !== undefined) update.endDate = endDate;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: update,
  });
  return NextResponse.json(appointment);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
