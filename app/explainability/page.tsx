"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, TrendingDown, Activity, ArrowLeft, Info, AlertCircle, CheckCircle } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"
import Link from "next/link"

// Global feature importance data
const globalFeatureImportance = [
  { feature: "Blood Pressure Trend", importance: 0.28, description: "Systolic/diastolic pressure changes over time" },
  { feature: "Medication Adherence", importance: 0.22, description: "Consistency in taking prescribed medications" },
  { feature: "Lab Result Variance", importance: 0.18, description: "Fluctuations in key biomarkers" },
  { feature: "Age", importance: 0.15, description: "Patient age as risk factor" },
  { feature: "BMI", importance: 0.12, description: "Body mass index and weight trends" },
  { feature: "Previous Hospitalizations", importance: 0.1, description: "History of hospital admissions" },
  { feature: "Comorbidities", importance: 0.08, description: "Presence of multiple conditions" },
  { feature: "Social Determinants", importance: 0.06, description: "Socioeconomic and lifestyle factors" },
]

// Sample patients for local explanations
const explainabilityPatients = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 28,
    condition: "Gestational Diabetes",
    riskScore: 85,
    riskLevel: "High",
    localExplanations: [
      {
        feature: "Glucose Levels",
        impact: +32,
        description: "Consistently elevated glucose readings (180+ mg/dL) significantly increase complications risk",
        trend: "increasing",
      },
      {
        feature: "Blood Pressure",
        impact: +18,
        description: "Rising blood pressure trend (140/90) indicates preeclampsia risk",
        trend: "increasing",
      },
      {
        feature: "Gestational Week",
        impact: +12,
        description: "At 32 weeks, risk naturally increases as pregnancy progresses",
        trend: "neutral",
      },
      {
        feature: "Age",
        impact: -8,
        description: "Age 28 is within optimal range, slightly reducing overall risk",
        trend: "decreasing",
      },
      {
        feature: "Medication Adherence",
        impact: -15,
        description: "Good compliance with Metformin helps control glucose levels",
        trend: "decreasing",
      },
      {
        feature: "Previous Pregnancies",
        impact: +5,
        description: "First pregnancy - no previous complications history",
        trend: "neutral",
      },
    ],
  },
  {
    id: 2,
    name: "Robert Smith",
    age: 65,
    condition: "Heart Failure",
    riskScore: 92,
    riskLevel: "High",
    localExplanations: [
      {
        feature: "Ejection Fraction",
        impact: +45,
        description: "Low ejection fraction (35%) indicates severely reduced heart function",
        trend: "increasing",
      },
      {
        feature: "Blood Pressure",
        impact: +25,
        description: "Uncontrolled hypertension (150/95) strains the cardiovascular system",
        trend: "increasing",
      },
      {
        feature: "Age",
        impact: +15,
        description: "Age 65+ significantly increases cardiovascular complications risk",
        trend: "increasing",
      },
      {
        feature: "Medication Adherence",
        impact: -12,
        description: "Good compliance with heart medications helps manage condition",
        trend: "decreasing",
      },
      {
        feature: "Cholesterol Levels",
        impact: +8,
        description: "Elevated cholesterol (240 mg/dL) contributes to arterial blockage",
        trend: "increasing",
      },
      {
        feature: "Exercise Tolerance",
        impact: +18,
        description: "Reduced physical activity indicates worsening heart function",
        trend: "increasing",
      },
    ],
  },
  {
    id: 3,
    name: "Emily Chen",
    age: 25,
    condition: "Normal Pregnancy",
    riskScore: 25,
    riskLevel: "Low",
    localExplanations: [
      {
        feature: "Age",
        impact: -20,
        description: "Age 25 is optimal for pregnancy, significantly reducing complications",
        trend: "decreasing",
      },
      {
        feature: "Blood Pressure",
        impact: -15,
        description: "Normal blood pressure (115/75) indicates healthy cardiovascular status",
        trend: "decreasing",
      },
      {
        feature: "Glucose Levels",
        impact: -12,
        description: "Normal glucose levels (85 mg/dL) show no diabetes risk",
        trend: "decreasing",
      },
      {
        feature: "Weight Gain",
        impact: +8,
        description: "Appropriate weight gain pattern for gestational stage",
        trend: "neutral",
      },
      {
        feature: "Prenatal Care",
        impact: -18,
        description: "Regular prenatal visits and compliance reduce complications",
        trend: "decreasing",
      },
      {
        feature: "Family History",
        impact: +5,
        description: "No significant family history of pregnancy complications",
        trend: "neutral",
      },
    ],
  },
]

const conditionSpecificFeatures = {
  "Maternal Care": [
    { feature: "Gestational Age", importance: 0.25 },
    { feature: "Blood Pressure", importance: 0.22 },
    { feature: "Glucose Levels", importance: 0.2 },
    { feature: "Weight Gain", importance: 0.15 },
    { feature: "Age", importance: 0.12 },
    { feature: "Previous Pregnancies", importance: 0.06 },
  ],
  Cardiovascular: [
    { feature: "Ejection Fraction", importance: 0.3 },
    { feature: "Blood Pressure", importance: 0.25 },
    { feature: "Cholesterol", importance: 0.18 },
    { feature: "Age", importance: 0.15 },
    { feature: "Exercise Tolerance", importance: 0.12 },
  ],
  Diabetes: [
    { feature: "HbA1c Levels", importance: 0.35 },
    { feature: "Blood Glucose", importance: 0.25 },
    { feature: "BMI", importance: 0.2 },
    { feature: "Medication Adherence", importance: 0.15 },
    { feature: "Age", importance: 0.05 },
  ],
  Arthritis: [
    { feature: "Joint Inflammation", importance: 0.3 },
    { feature: "Pain Levels", importance: 0.25 },
    { feature: "Mobility Score", importance: 0.2 },
    { feature: "Medication Response", importance: 0.15 },
    { feature: "Age", importance: 0.1 },
  ],
}

export default function ExplainabilityPage() {
  const [selectedCondition, setSelectedCondition] = useState("Maternal Care")
  const [selectedPatient, setSelectedPatient] = useState(explainabilityPatients[0])

  const getImpactColor = (impact: number) => {
    if (impact > 20) return "text-destructive"
    if (impact > 10) return "text-accent"
    if (impact > 0) return "text-yellow-600"
    if (impact > -10) return "text-primary"
    return "text-green-600"
  }

  const getImpactIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-destructive" />
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-600" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive text-destructive-foreground"
      case "Medium":
        return "bg-accent text-accent-foreground"
      case "Low":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Model Explainability</h1>
              <p className="text-muted-foreground">
                Understand how our AI makes risk predictions for better clinical decisions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary" />
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Model Accuracy</div>
              <div className="text-lg font-bold text-primary">89.2%</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Global Explanations</TabsTrigger>
            <TabsTrigger value="local">Patient-Specific Explanations</TabsTrigger>
          </TabsList>

          {/* Global Explanations Tab */}
          <TabsContent value="global" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Feature Importance</CardTitle>
                    <CardDescription>
                      Key factors our AI model considers when predicting patient risk across all conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={globalFeatureImportance} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 0.3]} />
                        <YAxis dataKey="feature" type="category" width={120} />
                        <Tooltip
                          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Importance"]}
                          labelFormatter={(label) => `Feature: ${label}`}
                        />
                        <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                          {globalFeatureImportance.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index < 3 ? "#ef4444" : index < 5 ? "#f59e0b" : "#3b82f6"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Details</CardTitle>
                    <CardDescription>Understanding each risk factor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {globalFeatureImportance.slice(0, 5).map((feature, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{feature.feature}</h4>
                            <Badge variant="outline">{(feature.importance * 100).toFixed(1)}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Condition-Specific Features */}
            <Card>
              <CardHeader>
                <CardTitle>Condition-Specific Feature Importance</CardTitle>
                <CardDescription>How feature importance varies by medical condition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maternal Care">Maternal Care</SelectItem>
                      <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="Diabetes">Diabetes</SelectItem>
                      <SelectItem value="Arthritis">Arthritis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conditionSpecificFeatures[selectedCondition].map((feature, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{feature.feature}</h4>
                        <Badge
                          className={
                            index < 2
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-primary text-primary-foreground"
                          }
                        >
                          {(feature.importance * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${index < 2 ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${feature.importance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Local Explanations Tab */}
          <TabsContent value="local" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Select Patient</CardTitle>
                    <CardDescription>Choose a patient to see personalized risk explanations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {explainabilityPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedPatient.id === patient.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{patient.name}</h4>
                              <p className="text-xs text-muted-foreground">{patient.condition}</p>
                              <Badge className={getRiskLevelColor(patient.riskLevel)} size="sm">
                                {patient.riskScore}% Risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Risk Explanation for {selectedPatient.name}</span>
                      <Badge className={getRiskLevelColor(selectedPatient.riskLevel)}>
                        {selectedPatient.riskScore}% Risk
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Understanding why this patient has a {selectedPatient.riskLevel.toLowerCase()} risk score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPatient.localExplanations.map((explanation, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getImpactIcon(explanation.trend)}
                              <h4 className="font-semibold">{explanation.feature}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${getImpactColor(explanation.impact)}`}>
                                {explanation.impact > 0 ? "+" : ""}
                                {explanation.impact}%
                              </span>
                              {explanation.impact > 15 ? (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              ) : explanation.impact < -10 ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Info className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{explanation.description}</p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                explanation.impact > 15
                                  ? "bg-destructive"
                                  : explanation.impact > 0
                                    ? "bg-accent"
                                    : explanation.impact > -10
                                      ? "bg-primary"
                                      : "bg-green-600"
                              }`}
                              style={{
                                width: `${Math.abs(explanation.impact) * 2}%`,
                                maxWidth: "100%",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Clinical Summary
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.riskLevel === "High" ? (
                          <>
                            This patient requires immediate attention due to multiple high-impact risk factors. The
                            primary concerns are elevated clinical markers that significantly increase complication
                            risk. Consider immediate intervention and increased monitoring frequency.
                          </>
                        ) : selectedPatient.riskLevel === "Medium" ? (
                          <>
                            This patient shows moderate risk factors that warrant close monitoring. While not
                            immediately critical, several indicators suggest potential for deterioration. Regular
                            follow-ups and preventive measures are recommended.
                          </>
                        ) : (
                          <>
                            This patient demonstrates excellent health indicators with minimal risk factors. Current
                            management appears effective, and standard monitoring protocols are appropriate. Continue
                            current care plan with routine follow-ups.
                          </>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Model Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Model Information & Limitations</CardTitle>
            <CardDescription>Important information about our AI risk prediction model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Model Performance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AUROC: 0.89 (Excellent discrimination)</li>
                  <li>• Sensitivity: 85% (Correctly identifies high-risk patients)</li>
                  <li>• Specificity: 92% (Correctly identifies low-risk patients)</li>
                  <li>• Calibration: Well-calibrated across risk ranges</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Training Data</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 50,000+ patient records</li>
                  <li>• 5 years of historical data</li>
                  <li>• Multiple healthcare systems</li>
                  <li>• Diverse patient demographics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Limitations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Predictions are probabilities, not certainties</li>
                  <li>• Clinical judgment should always be primary</li>
                  <li>• Model updated quarterly with new data</li>
                  <li>• Not a substitute for clinical assessment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
