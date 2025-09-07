import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(`[v0] Generating response with model: ${body.model}`)

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}`
        : "http://localhost:3000"

    try {
      console.log("[v0] Attempting generation via nginx proxy...")

      const response = await fetch(`${baseUrl}/api/ollama/generate-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          stream: true,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`Proxy responded with status ${response.status}`)
      }

      // Forward the streaming response
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (proxyError) {
      console.log("[v0] Proxy failed, trying direct connection:", proxyError)

      // Fallback to direct connection
      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434"

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          stream: true,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`Direct connection failed with status ${response.status}`)
      }

      return new Response(response.body, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }
  } catch (error) {
    console.error("Failed to generate response:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to generate response from Ollama",
        suggestion: "Ensure nginx proxy is configured and Ollama is running",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
