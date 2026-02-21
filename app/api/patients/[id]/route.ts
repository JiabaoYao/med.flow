import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { datetime: "asc" } },
      prescriptions: { orderBy: { refillOn: "asc" } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isOwn = session?.userId === id;
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    appointments: user.appointments,
    prescriptions: user.prescriptions,
    isOwn,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  const password = typeof body.password === "string" ? body.password : undefined;

  const update: { name?: string; email?: string; passwordHash?: string } = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (password !== undefined) {
    const bcrypt = await import("bcryptjs");
    update.passwordHash = await bcrypt.hash(password, 10);
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: update,
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(user);
}
