import { NextResponse } from "next/server"

export async function GET() {
  const ollamaUrls = ["http://127.0.0.1:11434", "http://localhost:11434", process.env.OLLAMA_URL].filter(Boolean)

  for (const url of ollamaUrls) {
    try {
      console.log(`[v0] Trying to connect to Ollama at ${url}...`)

      const response = await fetch(`${url}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        console.log(`[v0] HTTP ${response.status} from ${url}`)
        continue
      }

      const data = await response.json()
      console.log(`[v0] Successfully connected to Ollama at ${url}`)
      return NextResponse.json(data)
    } catch (error) {
      console.log(`[v0] Failed to connect to ${url}:`, error.message)
      continue
    }
  }

  // If all connections failed
  return NextResponse.json(
    {
      error: "Cannot connect to Ollama",
      suggestion: "Make sure Ollama is running and accessible. Try: curl http://localhost:11434/api/tags",
      models: [],
    },
    { status: 500 },
  )
}
