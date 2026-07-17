import { NextResponse } from "next/server";
import loadoutsData from "../../../../data/weapon-loadouts.json";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = (loadoutsData as Record<string, unknown>)[slug];
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
