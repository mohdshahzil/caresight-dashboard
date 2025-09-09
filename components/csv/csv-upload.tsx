"use client"

import type React from "react"

import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, RotateCcw } from "lucide-react"
import { processCSV } from "@/app/actions/csv-processing"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid, ReferenceLine, PieChart, Pie, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

interface CSVUploadProps {
  onPredictionUpdate?: (prediction: any) => void
}

export function CSVUpload({ onPredictionUpdate }: CSVUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<string | null>(null)
  const [series, setSeries] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setResult(null)
    setRecommendations(null)
    setSeries(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await processCSV(formData)

      if (response.success && response.prediction) {
        setResult(response)
        onPredictionUpdate?.(response.prediction)
        if (response.recommendations) {
          setRecommendations(response.recommendations)
        }
        if (response.series) {
          setSeries(response.series as any[])
        }
      } else {
        setError(response.error || "Failed to process CSV")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Upload error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onPredictionUpdate?.(null)
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low risk":
        return "text-green-600 bg-green-50"
      case "mid risk":
        return "text-yellow-600 bg-yellow-50"
      case "high risk":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getShapData = () => {
    if (!result?.prediction?.shap_values) return []

    return Object.entries(result.prediction.shap_values)
      .map(([feature, value]) => ({
        feature,
        value: value as number,
        absValue: Math.abs(value as number),
        color: (value as number) > 0 ? "#ef4444" : "#3b82f6",
        impact: (value as number) > 0 ? "Increases Risk" : "Decreases Risk",
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) // Sort by absolute impact
  }

  const getWaterfallData = () => {
    if (!result?.prediction?.shap_values) return []

    const shapData = getShapData()
    let cumulative = 0

    return shapData.map((item, index) => {
      const start = cumulative
      cumulative += item.value
      return {
        feature: item.feature,
        start,
        end: cumulative,
        value: item.value,
        color: item.color,
      }
    })
  }

  const getSeriesVitals = () => {
    if (!series || series.length === 0) return []
    return series.map((s) => ({
      name: s.timestamp || `#${s.index + 1}`,
      SystolicBP: s.data.SystolicBP,
      DiastolicBP: s.data.DiastolicBP,
      BS: s.data.BS,
      BodyTemp: s.data.BodyTemp,
      HeartRate: s.data.HeartRate,
    }))
  }

  const getSeriesRisk = () => {
    if (!series || series.length === 0) return []
    return series.map((s) => ({
      name: s.timestamp || `#${s.index + 1}`,
      high: s.prediction.probabilities["high risk"] * 100,
      mid: s.prediction.probabilities["mid risk"] * 100,
      low: s.prediction.probabilities["low risk"] * 100,
    }))
  }

  const getProbabilityData = () => {
    if (!result?.prediction?.probabilities) return []
    const colorMap: Record<string, string> = {
      "low risk": "#22c55e",
      "mid risk": "#eab308",
      "high risk": "#ef4444",
    }
    return Object.entries(result.prediction.probabilities).map(([name, value]) => ({
      name,
      value: (value as number) * 100,
      fill: colorMap[name] || "#60a5fa",
    }))
  }

  const getVitalsRadarData = () => {
    if (!result?.data) return []
    const d = result.data
    // Typical healthy ranges (rough guidelines; used only for visualization)
    const ranges: Record<string, { min: number; max: number; label: string; value: number }> = {
      SystolicBP: { min: 90, max: 120, label: "Systolic BP", value: d.SystolicBP },
      DiastolicBP: { min: 60, max: 80, label: "Diastolic BP", value: d.DiastolicBP },
      BS: { min: 70, max: 140, label: "Blood Sugar", value: d.BS },
      BodyTemp: { min: 97, max: 99, label: "Body Temp", value: d.BodyTemp },
      HeartRate: { min: 60, max: 100, label: "Heart Rate", value: d.HeartRate },
    }
    return Object.values(ranges).map((r) => {
      const span = Math.max(r.max - r.min, 1)
      const pct = ((r.value - r.min) / span) * 100
      return { subject: r.label, score: Math.max(0, Math.min(120, pct)), ideal: 50 }
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Maternal Care CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing maternal health parameters: Age, SystolicBP, DiastolicBP, BS, BodyTemp,
            HeartRate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> CSV file
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>

            {result && (
              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload New CSV File
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Processing CSV file...</span>
                </div>
                <Progress value={65} className="w-full" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Extracted Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Extracted Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold">{result.data.Age} years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Systolic BP</p>
                  <p className="text-lg font-semibold">{result.data.SystolicBP} mmHg</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Diastolic BP</p>
                  <p className="text-lg font-semibold">{result.data.DiastolicBP} mmHg</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Blood Sugar</p>
                  <p className="text-lg font-semibold">{result.data.BS} mmol/L</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Body Temperature</p>
                  <p className="text-lg font-semibold">{result.data.BodyTemp} °F</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Heart Rate</p>
                  <p className="text-lg font-semibold">{result.data.HeartRate} bpm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Risk Prediction */}
                <div className="text-center">
                  <Badge className={`text-lg px-4 py-2 ${getRiskColor(result.prediction.prediction)}`}>
                    {result.prediction.prediction.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">Overall Risk Assessment</p>
                </div>

                {/* Risk Probabilities */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(result.prediction.probabilities).map(([risk, probability]) => (
                    <div key={risk} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 capitalize">{risk}</p>
                      <p className="text-xl font-bold">{((probability as number) * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>

                {/* Risk Probability Donut */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-center text-lg">Risk Probability Breakdown</h4>
                  <div className="flex justify-center">
                    <div className="w-full max-w-5xl">
                      <ChartContainer
                        config={{
                          low: { label: "Low", color: "#22c55e" },
                          mid: { label: "Mid", color: "#eab308" },
                          high: { label: "High", color: "#ef4444" },
                        }}
                        className="h-80 animate-in fade-in-50 duration-500"
                      >
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Pie
                            data={getProbabilityData()}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            cornerRadius={6}
                            isAnimationActive
                            animationDuration={700}
                            animationEasing="ease-out"
                          >
                            {getProbabilityData().map((entry, index) => (
                              <Cell key={`slice-${index}`} fill={entry.fill as string} />
                            ))}
                          </Pie>
                          <ChartLegend content={(props) => <div className="recharts-default-legend"><ChartLegendContent {...props} /></div>} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                </div>

                {/* Vitals vs Typical Ranges (Radar) */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-center text-lg">Vitals vs Typical Ranges</h4>
                  <div className="flex justify-center">
                    <div className="w-full max-w-5xl">
                      <ChartContainer
                        config={{ patient: { label: "Patient", color: "#60a5fa" }, ideal: { label: "Ideal", color: "#a3e635" } }}
                        className="h-80 animate-in fade-in-50 duration-500"
                      >
                        <RadarChart data={getVitalsRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 120]} />
                          <Radar name="Patient" dataKey="score" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.4} isAnimationActive animationDuration={700} />
                          <Radar name="Ideal" dataKey="ideal" stroke="#a3e635" fill="#a3e635" fillOpacity={0.2} isAnimationActive animationDuration={700} />
                          <ChartLegend content={(props) => <div className="recharts-default-legend"><ChartLegendContent {...props} /></div>} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                      </ChartContainer>
                    </div>
                  </div>
                </div>

                {/* Enhanced SHAP Values Visualization */}  
                <div className="space-y-6">
                  {/* Time Series: Risk Probabilities */}
                  {series && series.length > 1 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-center text-lg">Risk Probabilities Over Time</h4>
                      <ChartContainer
                        config={{ high: { label: "High", color: "#ef4444" }, mid: { label: "Mid", color: "#eab308" }, low: { label: "Low", color: "#22c55e" } }}
                        className="h-80 animate-in fade-in-50 duration-500"
                      >
                        <LineChart data={getSeriesRisk()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis unit="%" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={(props) => <div className="recharts-default-legend"><ChartLegendContent {...props} /></div>} />
                          <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                          <Line type="monotone" dataKey="mid" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                          <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Time Series: Vitals */}
                  {series && series.length > 1 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-center text-lg">Vitals Over Time</h4>
                      <ChartContainer
                        config={{
                          SystolicBP: { label: "Systolic BP", color: "#3b82f6" },
                          DiastolicBP: { label: "Diastolic BP", color: "#60a5fa" },
                          BS: { label: "Blood Sugar", color: "#22c55e" },
                          BodyTemp: { label: "Body Temp", color: "#f59e0b" },
                          HeartRate: { label: "Heart Rate", color: "#ef4444" },
                        }}
                        className="h-80 animate-in fade-in-50 duration-500"
                      >
                        <LineChart data={getSeriesVitals()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={(props) => <div className="recharts-default-legend"><ChartLegendContent {...props} /></div>} />
                          <Line type="monotone" dataKey="SystolicBP" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                          <Line type="monotone" dataKey="DiastolicBP" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                          <Line type="monotone" dataKey="BS" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                          <Line type="monotone" dataKey="BodyTemp" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                          <Line type="monotone" dataKey="HeartRate" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  )}
                  {/* Horizontal Bar Chart */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-center text-lg">Feature Impact (SHAP Values)</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getShapData()}
                          layout="horizontal"
                          margin={{ left: 100, right: 30, top: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tickFormatter={(value) => value.toFixed(3)}
                          />
                          <YAxis type="category" dataKey="feature" width={90} tick={{ fontSize: 12 }} />
                          <ReferenceLine x={0} stroke="#666" strokeDasharray="2 2" />
                          <Tooltip
                            formatter={(value, name) => [`${(value as number).toFixed(4)}`, "SHAP Value"]}
                            labelFormatter={(label) => `Feature: ${label}`}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {getShapData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Feature Importance Ranking */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-center text-lg">Feature Importance Ranking</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getShapData()}
                          margin={{ left: 100, right: 30, top: 20, bottom: 20 }}
                          layout="horizontal"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => value.toFixed(3)} />
                          <YAxis type="category" dataKey="feature" width={90} tick={{ fontSize: 12 }} />
                          <Tooltip
                            formatter={(value) => [`${(value as number).toFixed(4)}`, "Absolute Impact"]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                          <Bar dataKey="absValue" fill="#8884d8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* SHAP Summary Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">Positive Features</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {getShapData().filter((item) => item.value > 0).length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-600">Risk Increasing</p>
                      <p className="text-2xl font-bold text-red-800">
                        {getShapData()
                          .filter((item) => item.value > 0)
                          .reduce((sum, item) => sum + item.value, 0)
                          .toFixed(3)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Risk Decreasing</p>
                      <p className="text-2xl font-bold text-green-800">
                        {getShapData()
                          .filter((item) => item.value < 0)
                          .reduce((sum, item) => sum + item.value, 0)
                          .toFixed(3)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Net Impact</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {getShapData()
                          .reduce((sum, item) => sum + item.value, 0)
                          .toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cumulative SHAP Trend */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-center text-lg">Cumulative Feature Impact Trend</h4>
                  <div className="flex justify-center">
                    <div className="w-full max-w-5xl">
                      <ChartContainer
                        config={{ impact: { label: "Cumulative Impact", color: "#8b5cf6" } }}
                        className="h-80 animate-in fade-in-50 duration-500"
                      >
                        <LineChart data={getWaterfallData()} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => Number(v).toFixed(2)} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="end" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} isAnimationActive animationDuration={700} />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  </div>
                </div>

                {/* Enhanced Feature Explanations */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Detailed Risk Factor Analysis</h4>
                  <div className="space-y-2">
                    {getShapData().map((item, index) => (
                      <div
                        key={item.feature}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4"
                        style={{ borderLeftColor: item.color }}
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.feature}</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Rank #{index + 1} • {item.impact}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${item.value > 0 ? "text-red-600" : "text-blue-600"}`}>
                            {item.value > 0 ? "+" : ""}
                            {item.value.toFixed(4)}
                          </span>
                          <p className="text-xs text-gray-500">SHAP Value</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gemini Recommendations */}
          {recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Personalized Care Recommendations
                </CardTitle>
                <CardDescription>
                  Generated by AI based on risk, probabilities, and SHAP factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {recommendations}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
