"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Lightbulb, AlertCircle } from "lucide-react"

interface AIExplanationProps {
  explanation?: string
  patientName: string
  riskLevel?: string
}

export function AIExplanation({ explanation, patientName, riskLevel }: AIExplanationProps) {
  if (!explanation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Health Insights
          </CardTitle>
          <CardDescription>
            Personalized analysis powered by artificial intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">AI analysis is being generated...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskBadgeColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Parse the explanation into sections for better formatting
  const formatExplanation = (text: string) => {
    // Split by bullet points or line breaks
    const sections = text.split(/[•\-\*]|\n/).filter(section => section.trim().length > 0)
    
    return sections.map((section, index) => {
      const trimmed = section.trim()
      if (trimmed.length === 0) return null
      
      // Check if this looks like a header or important point
      const isHeader = trimmed.length < 50 && (
        trimmed.includes(':') || 
        trimmed.match(/^[A-Z][^.]*$/) ||
        index === 0
      )
      
      return (
        <div key={index} className={isHeader ? 'mb-3' : 'mb-2'}>
          {isHeader ? (
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              {trimmed}
            </h4>
          ) : (
            <p className="text-gray-700 ml-6 text-sm leading-relaxed">
              {trimmed}
            </p>
          )}
        </div>
      )
    }).filter(Boolean)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Health Insights for {patientName}
            </CardTitle>
            <CardDescription>
              Personalized diabetes risk analysis powered by artificial intelligence
            </CardDescription>
          </div>
          {riskLevel && (
            <Badge variant="outline" className={getRiskBadgeColor(riskLevel)}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {riskLevel} Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AI Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-100 p-2 rounded-full">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI-Powered Analysis</p>
              <p className="text-xs text-gray-600">Generated using advanced machine learning models</p>
            </div>
          </div>

          {/* Formatted Explanation */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="space-y-3">
              {formatExplanation(explanation)}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Important Medical Disclaimer</p>
                <p>
                  This AI analysis is for informational purposes only and should not replace professional medical advice. 
                  Always consult with your healthcare provider for medical decisions and treatment plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
