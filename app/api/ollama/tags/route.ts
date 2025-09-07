import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}`
      : "http://localhost:3000"

  try {
    console.log("[v0] Fetching models via nginx proxy...")

    const response = await fetch(`${baseUrl}/api/ollama/tags-proxy`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Successfully fetched models via proxy")
    return NextResponse.json(data)
  } catch (error) {
    console.log("[v0] Proxy connection failed, trying direct connection...")

    // Fallback to direct connection for development
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434"

    try {
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (directError) {
      console.log("[v0] Direct connection also failed:", directError)
      return NextResponse.json(
        {
          error: "Cannot connect to Ollama",
          suggestion: "Configure nginx proxy: location /api/ollama/ { proxy_pass http://127.0.0.1:11434/api/; }",
          models: [],
        },
        { status: 500 },
      )
    }
  }
}
