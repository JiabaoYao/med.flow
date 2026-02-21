import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type SeedAppointment = { id: number; provider: string; datetime: string; repeat: string };
type SeedPrescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refill_on: string;
  refill_schedule: string;
};
type SeedUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  appointments: SeedAppointment[];
  prescriptions: SeedPrescription[];
};
type SeedData = { users: SeedUser[]; medications: string[]; dosages: string[] };

async function main() {
  const dataPath = path.join(process.cwd(), "data.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data: SeedData = JSON.parse(raw);

  for (const u of data.users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
      },
    });

    const existingAppointments = await prisma.appointment.count({ where: { userId: user.id } });
    if (existingAppointments === 0) {
      for (const a of u.appointments) {
        await prisma.appointment.create({
          data: {
            userId: user.id,
            provider: a.provider,
            datetime: new Date(a.datetime),
            repeat: a.repeat,
          },
        });
      }
    }

    const existingPrescriptions = await prisma.prescription.count({ where: { userId: user.id } });
    if (existingPrescriptions === 0) {
      for (const p of u.prescriptions) {
        await prisma.prescription.create({
          data: {
            userId: user.id,
            medication: p.medication,
            dosage: p.dosage,
            quantity: p.quantity,
            refillOn: new Date(p.refill_on),
            refillSchedule: p.refill_schedule,
          },
        });
      }
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
