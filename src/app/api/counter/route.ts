import { NextResponse } from "next/server";

// Base count seed to reflect the established lore
const BASE_SEED = 148520;
let fallbackSpins = BASE_SEED;

export async function GET() {
  try {
    const res = await fetch("https://api.counterapi.dev/v1/ai-do-kiep-vn/spins", {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      const count = Number(data?.count);
      if (!Number.isNaN(count) && count >= 0) {
        return NextResponse.json({ count: BASE_SEED + count });
      }
    }
  } catch {
    // Fallback if network or third-party service times out
  }

  return NextResponse.json({ count: fallbackSpins });
}

export async function POST() {
  fallbackSpins += 1;
  try {
    const res = await fetch("https://api.counterapi.dev/v1/ai-do-kiep-vn/spins/up", {
      method: "GET",
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      const count = Number(data?.count);
      if (!Number.isNaN(count) && count >= 0) {
        return NextResponse.json({ count: BASE_SEED + count });
      }
    }
  } catch {
    // Fallback gracefully
  }

  return NextResponse.json({ count: fallbackSpins });
}
