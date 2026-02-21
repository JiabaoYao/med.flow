import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appointments = await prisma.appointment.findMany({
    where: { userId: id },
    orderBy: { datetime: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const provider = typeof body.provider === "string" ? body.provider.trim() : "";
  const datetime = body.datetime;
  const repeat = typeof body.repeat === "string" ? body.repeat : "none";
  const endDate = body.endDate ? new Date(body.endDate) : null;

  if (!provider || !datetime) {
    return NextResponse.json(
      { error: "Provider and datetime required" },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: id,
      provider,
      datetime: new Date(datetime),
      repeat: repeat || "none",
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  return NextResponse.json(appointment);
}
