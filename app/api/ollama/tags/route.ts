import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://localhost:11434/api/tags")

    if (!response.ok) {
      throw new Error(`Ollama API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch Ollama models:", error)
    return NextResponse.json({ error: "Failed to connect to Ollama" }, { status: 500 })
  }
}
