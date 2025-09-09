"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code, Copy, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface RawResponseViewerProps {
  response: any
}

export function RawResponseViewer({ response }: RawResponseViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            <CardTitle>Raw API Response</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Debug
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          Complete API response for debugging and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`w-full ${isExpanded ? 'h-96' : 'h-32'}`}>
          <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <code className="text-gray-800">
              {JSON.stringify(response, null, 2)}
            </code>
          </pre>
        </ScrollArea>
        {!isExpanded && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Click "Expand" to see the full response
          </div>
        )}
      </CardContent>
    </Card>
  )
}