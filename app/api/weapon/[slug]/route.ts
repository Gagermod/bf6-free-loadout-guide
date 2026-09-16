import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = join(DATA_DIR, `${slug}-bfmeta-loadouts.json`);
  try {
    const data = await readFile(filePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}