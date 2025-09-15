import { NextResponse } from "next/server"

const BACKEND_BASE = "http://172.16.44.133:10000"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const resp = await fetch(`${BACKEND_BASE}/api/glucose/cohort`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const text = await resp.text()
    return new NextResponse(text, {
      status: resp.status,
      headers: { "Content-Type": resp.headers.get("content-type") || "application/json" },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 }
    )
  }
}


