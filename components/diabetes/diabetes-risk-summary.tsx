"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Activity, Droplets, TrendingUp, Moon, Syringe } from "lucide-react"

interface DiabetesRiskSummaryProps {
  overallRisk: {
    score: number
    level: string
  } | null
  contextFactors: Record<string, {
    impact: string
    multiplier: number
    value: number
  }>
  baseRiskComponents: {
    hyper_risk: number[]
    hypo_risk: number[]
    trend_high_risk: number[]
    trend_low_risk: number[]
    volatility_risk: number[]
  }
}

export function DiabetesRiskSummary({ 
  overallRisk, 
  contextFactors, 
  baseRiskComponents 
}: DiabetesRiskSummaryProps) {
  
  if (!overallRisk) {
    return null
  }

  // Safety checks for all data
  const safeContextFactors = contextFactors || {}
  const safeBaseRiskComponents = baseRiskComponents || {
    hyper_risk: [],
    hypo_risk: [],
    trend_high_risk: [],
    trend_low_risk: [],
    volatility_risk: []
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate': case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'insulin_adherence': return Syringe
      case 'sleep_quality': return Moon
      case 'insulin_dose': return Activity
      default: return Droplets
    }
  }

  // Get current risk levels (latest values from arrays)
  const currentHyperRisk = safeBaseRiskComponents.hyper_risk?.length > 0 
    ? safeBaseRiskComponents.hyper_risk[safeBaseRiskComponents.hyper_risk.length - 1] 
    : 0
  const currentHypoRisk = safeBaseRiskComponents.hypo_risk?.length > 0 
    ? safeBaseRiskComponents.hypo_risk[safeBaseRiskComponents.hypo_risk.length - 1] 
    : 0
  const currentTrendRisk = safeBaseRiskComponents.trend_high_risk?.length > 0 
    ? safeBaseRiskComponents.trend_high_risk[safeBaseRiskComponents.trend_high_risk.length - 1] 
    : 0

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
            Overall Diabetes Risk
          </CardTitle>
          <CardDescription>Current risk assessment based on your glucose data</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-gray-900">
            {(overallRisk.score * 100).toFixed(0)}%
          </div>
          <Badge variant="outline" className={getRiskColor(overallRisk.level)}>
            {overallRisk.level.toUpperCase()} RISK
          </Badge>
          <Progress 
            value={overallRisk.score * 100} 
            className="w-full max-w-md mx-auto"
          />
        </CardContent>
      </Card>

      {/* Context Factors */}
      {Object.keys(safeContextFactors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Your Health Factors
            </CardTitle>
            <CardDescription>
              Key lifestyle and medical factors affecting your risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(safeContextFactors).map(([factor, data]) => {
                const Icon = getFactorIcon(factor)
                const isGood = data.impact === 'low_risk'
                
                return (
                  <div 
                    key={factor}
                    className={`p-4 rounded-lg border ${
                      isGood ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-4 w-4 ${
                        isGood ? 'text-green-600' : 'text-red-600'
                      }`} />
                      <span className="font-medium text-gray-900">
                        {factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {typeof data.value === 'number' && data.value < 1 
                        ? (data.value * 100).toFixed(0) + '%'
                        : data.value.toString()
                      }
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        isGood ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                      }`}
                    >
                      {data.impact.replace('_', ' ')}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Risk Breakdown
          </CardTitle>
          <CardDescription>
            Specific types of diabetes-related risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hyperglycemia Risk */}
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="font-medium text-gray-900">High Glucose Risk</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {(currentHyperRisk * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-red-600">Risk of hyperglycemia</p>
            </div>

            {/* Hypoglycemia Risk */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Low Glucose Risk</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {(currentHypoRisk * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-blue-600">Risk of hypoglycemia</p>
            </div>

            {/* Trend Risk */}
            <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-gray-900">Trend Risk</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {(currentTrendRisk * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-orange-600">Risk of rising glucose trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
