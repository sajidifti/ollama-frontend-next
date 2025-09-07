import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/tags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy to Ollama failed:", error)
    return NextResponse.json({ error: "Failed to connect to Ollama via proxy" }, { status: 500 })
  }
}
