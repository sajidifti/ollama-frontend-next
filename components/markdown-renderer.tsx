import type React from "react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parsing for common elements
  const parseMarkdown = (text: string) => {
    // Split by lines to handle different markdown elements
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Code blocks (```)
      if (line.trim().startsWith("```")) {
        const codeLines: string[] = []
        i++ // Skip opening ```
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i])
          i++
        }
        elements.push(
          <pre key={i} className="bg-muted p-3 rounded-md my-2 overflow-x-auto">
            <code className="text-sm">{codeLines.join("\n")}</code>
          </pre>,
        )
        i++ // Skip closing ```
        continue
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-xl font-bold mt-4 mb-2">
            {line.slice(2)}
          </h1>,
        )
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-lg font-semibold mt-3 mb-2">
            {line.slice(3)}
          </h2>,
        )
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-base font-medium mt-2 mb-1">
            {line.slice(4)}
          </h3>,
        )
      }
      // Lists
      else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const listItems: string[] = []
        while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
          listItems.push(lines[i].trim().slice(2))
          i++
        }
        elements.push(
          <ul key={i} className="list-disc list-inside my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>,
        )
        i-- // Adjust for the outer loop increment
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={i} className="mb-2">
            {parseInlineMarkdown(line)}
          </p>,
        )
      }
      // Empty lines
      else {
        elements.push(<br key={i} />)
      }

      i++
    }

    return elements
  }

  // Parse inline markdown (bold, italic, code, links)
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Inline code (`code`)
      const codeMatch = remaining.match(/`([^`]+)`/)
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(remaining.slice(0, codeMatch.index))
        }
        parts.push(
          <code key={key++} className="bg-muted px-1 py-0.5 rounded text-sm">
            {codeMatch[1]}
          </code>,
        )
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
        continue
      }

      // Bold (**text**)
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index))
        }
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
        continue
      }

      // Italic (*text*)
      const italicMatch = remaining.match(/\*([^*]+)\*/)
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          parts.push(remaining.slice(0, italicMatch.index))
        }
        parts.push(<em key={key++}>{italicMatch[1]}</em>)
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length)
        continue
      }

      // No more markdown found, add the rest
      parts.push(remaining)
      break
    }

    return parts
  }

  return <div className="prose prose-sm max-w-none">{parseMarkdown(content)}</div>
}
