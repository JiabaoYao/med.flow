import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

type SeedData = { medications: string[]; dosages: string[] };

export async function GET() {
  const dataPath = path.join(process.cwd(), "data.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data: SeedData = JSON.parse(raw);
  return NextResponse.json({ medications: data.medications, dosages: data.dosages });
}
