import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(`[v0] Generating response with model: ${body.model}`)

    const ollamaUrls = ["http://127.0.0.1:11434", "http://localhost:11434", process.env.OLLAMA_URL].filter(Boolean)

    for (const url of ollamaUrls) {
      try {
        console.log(`[v0] Trying to generate via ${url}...`)

        const response = await fetch(`${url}/api/generate`, {
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
          console.log(`[v0] HTTP ${response.status} from ${url}`)
          continue
        }

        console.log(`[v0] Successfully connected to Ollama at ${url}`)
        return new Response(response.body, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      } catch (error) {
        console.log(`[v0] Failed to connect to ${url}:`, error.message)
        continue
      }
    }

    // If all connections failed
    return new Response(
      JSON.stringify({
        error: "Failed to generate response from Ollama",
        suggestion: "Make sure Ollama is running and accessible. Try: curl http://localhost:11434/api/tags",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Failed to generate response:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to generate response from Ollama",
        suggestion: "Ensure Ollama is running and accessible",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
