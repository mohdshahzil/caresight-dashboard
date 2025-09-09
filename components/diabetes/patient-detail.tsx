"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  Calendar,
  User,
  Weight,
  Ruler,
  Activity,
  TrendingUp,
  AlertTriangle,
  Info
} from "lucide-react"
import { type StoredPatient } from "@/lib/patient-storage"
import { GlucoseForecastChart } from "./glucose-forecast-chart"
import { RiskHorizonChart } from "./risk-horizon-chart"
import { OverallRiskCard } from "./overall-risk-card"
import { RiskFactorsChart } from "./risk-factors-chart"
import { AIExplanation } from "./ai-explanation"
import { RawResponseViewer } from "./raw-response-viewer"
import { DiabetesRiskSummary } from "./diabetes-risk-summary"
import { DiabetesAnalysis } from "@/lib/diabetes-analysis"
import { useState } from "react"
import { Tabs } from "@/components/ui/tabs"

interface PatientDetailProps {
  patient: StoredPatient
  onBack: () => void
}

// Helper to generate a plain-language risk explanation
function getRiskExplanation(base: any, context: any) {
  if (!base && !context) return "No risk data available.";
  const hyper = base?.hyper_risk?.at(-1) ?? 0;
  const hypo = base?.hypo_risk?.at(-1) ?? 0;
  const trend = base?.trend_high_risk?.at(-1) ?? 0;
  const volatility = base?.volatility_risk?.at(-1) ?? 0;
  const contextList = Object.entries(context || {})
    .map(([k, v]: any) => `${k.replace(/_/g, ' ')} (${v.impact.replace('_', ' ')})`)
    .join(', ');
  let mainDrivers = [];
  if (hyper > 0.4) mainDrivers.push(`high glucose risk (${(hyper*100).toFixed(0)}%)`);
  if (hypo > 0.03) mainDrivers.push(`low glucose risk (${(hypo*100).toFixed(0)}%)`);
  if (trend > 0.01) mainDrivers.push(`rising glucose trend (${(trend*100).toFixed(0)}%)`);
  if (volatility > 0.1) mainDrivers.push(`glucose volatility (${(volatility*100).toFixed(0)}%)`);
  if (mainDrivers.length === 0) mainDrivers.push("stable glucose profile");
  return `Main drivers: ${mainDrivers.join(', ')}. Context: ${contextList || 'none'}.`;
}

export function PatientDetail({ patient, onBack }: PatientDetailProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskColor = (level?: string) => {
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

  const latestReport = patient.reports[patient.reports.length - 1]
  const analysis = latestReport?.rawApiResponse ? new DiabetesAnalysis(latestReport.rawApiResponse) : null
  const horizonKeys = ["7d", "14d", "30d", "60d", "90d"]
  const [selectedHorizon, setSelectedHorizon] = useState("7d")
  const horizonData = analysis?.horizonRisks?.[`horizon_${selectedHorizon}`] || {}

  function safePercent(val: any) {
    return typeof val === "number" && !isNaN(val) ? `${(val * 100).toFixed(0)}%` : "N/A"
  }

  function riskLevelColor(level: string) {
    switch ((level || '').toLowerCase()) {
      case 'low': return 'text-green-700';
      case 'moderate': case 'medium': return 'text-yellow-700';
      case 'high': return 'text-red-700';
      default: return 'text-gray-700';
    }
  }

  function riskSummarySentence(horizon: any) {
    if (!horizon) return "No risk data available for this period.";
    const parts = []
    if (typeof horizon.hyper_risk === 'number' && horizon.hyper_risk > 0.4) parts.push("high risk of high glucose");
    if (typeof horizon.hypo_risk === 'number' && horizon.hypo_risk > 0.03) parts.push("some risk of low glucose");
    if (typeof horizon.trend_high_risk === 'number' && horizon.trend_high_risk > 0.01) parts.push("rising glucose trend");
    if (typeof horizon.volatility_risk === 'number' && horizon.volatility_risk > 0.1) parts.push("glucose levels are fluctuating");
    if (parts.length === 0) return "Your glucose profile is stable for this period.";
    return `For this period, you have ${parts.join(", ")}.`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
            
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex items-center gap-6 mt-2 text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {patient.age} years, {patient.gender}
                </span>
                {patient.weight && (
                  <span className="flex items-center gap-1">
                    <Weight className="h-4 w-4" />
                    {patient.weight} kg
                  </span>
                )}
                {patient.height && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    {patient.height} cm
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {patient.reports.length} report{patient.reports.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {analysis?.overallRiskLevel && (
              <Badge 
                variant="outline" 
                className={`${getRiskColor(analysis.overallRiskLevel)} text-lg px-4 py-2`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {analysis.overallRiskLevel} Risk
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Latest Analysis Results */}
      {latestReport && analysis && (
        <>
          {/* --- Current Overall Report (group card) --- */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Current Overall Report
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!latestReport?.payload) return;
                    const patientName = patient.name || 'patient';
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `${patientName.replace(/\s+/g, '_')}_diabetes_payload_${timestamp}.json`;
                    const jsonStr = JSON.stringify(latestReport.payload, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!latestReport?.payload}
                >
                  Download Payload JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!latestReport?.rawApiResponse) return;
                    const patientName = patient.name || 'patient';
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `${patientName.replace(/\s+/g, '_')}_diabetes_analysis_${timestamp}.json`;
                    const jsonStr = JSON.stringify(latestReport.rawApiResponse, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-center font-semibold text-lg">Overall 90-Day Risk</div>
              <OverallRiskCard 
                data={{ score: analysis.overallRiskScore ?? 0, level: analysis.overallRiskLevel ?? "" }} 
              />
              {/* Removed the subtitle line here */}
              {/* --- Your Glucose Levels - Next 90 Days --- */}
              {analysis.forecastData.length > 0 && (
                <div className="mt-2">
                  <div className="rounded-lg overflow-hidden">
                    <GlucoseForecastChart data={analysis.forecastData} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Your Health Risk over time (RiskHorizonChart) --- */}
          {analysis.horizonRiskData.length > 0 && (
            <RiskHorizonChart data={analysis.horizonRiskData} />
          )}

          {/* --- Risk Factor Card with Horizon Tabs (Why this risk score?) --- */}
          <RiskFactorsChart 
            riskFactors={analysis.contextFactors} 
            horizonRisks={analysis.horizonRisks} 
          />

          {/* Glucose prediction charts and other analytics below */}
          {/* Context Factors from API */}
          {/* AI Explanation */}
          <AIExplanation 
            explanation={latestReport.aiExplanation}
            patientName={patient.name}
            riskLevel={analysis.overallRiskLevel}
          />
          {/* Raw API Response */}
          {/* Removed <RawResponseViewer ... /> for a cleaner UI */}
        </>
      )}

      {/* Report History */}
      {patient.reports.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Analysis History
            </CardTitle>
            <CardDescription>
              Previous diabetes risk assessments for {patient.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.reports
                .slice()
                .reverse()
                .map((report, index) => {
                  const reportAnalysis = report.rawApiResponse ? new DiabetesAnalysis(report.rawApiResponse) : null;
                  return (
                    <div 
                      key={report.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Analysis #{patient.reports.length - index}
                          {index === 0 && <span className="text-blue-600 ml-2">(Latest)</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(report.analysisDate)}
                        </p>
                      </div>
                      {reportAnalysis?.overallRiskLevel && (
                        <Badge 
                          variant="outline" 
                          className={getRiskColor(reportAnalysis.overallRiskLevel)}
                        >
                          {reportAnalysis.overallRiskLevel} Risk 
                          {reportAnalysis.overallRiskScore !== undefined && (
                            <> ({(reportAnalysis.overallRiskScore * 100).toFixed(0)}%)</>
                          )}
                        </Badge>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {patient.reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis reports yet</h3>
            <p className="text-gray-500">Upload glucose data to generate the first health assessment</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
