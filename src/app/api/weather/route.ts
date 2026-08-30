import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

export async function GET() {
  const weather = await fetchWeather();
  if (!weather) return NextResponse.json({ error: "Weather unavailable" }, { status: 502 });
  return NextResponse.json(weather);
}
