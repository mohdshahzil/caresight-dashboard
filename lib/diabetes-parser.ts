import { logError, logWarn, logDebug } from "./error-logger"

export interface DiabetesApiResponse {
  patient_id?: number | string
  prediction_metadata?: {
    patient_id: number | string
    prediction_horizon_days: number
    quantiles: number[]
    model_used: string
    prediction_timestamp: string
    denormalization_applied: boolean
  }
  glucose_predictions?: {
    horizons_days: number[]
    p10_quantile: number[]
    p50_quantile: number[]
    p90_quantile: number[]
  }
  risk_assessment?: {
    overall_risk_score: number
    overall_risk_level: string
    horizon_risks?: Record<string, {
      hyper_risk: number
      hypo_risk: number
      trend_high_risk: number
      trend_low_risk: number
      volatility_risk: number
      risk_score: number
      risk_level: string
    }>
    context_factors?: Record<string, any>
    context_multiplier?: number
    detailed_explanations?: {
      base_risk_components?: {
        hyper_risk?: number[][]
        hypo_risk?: number[][]
        trend_high_risk?: number[][]
        trend_low_risk?: number[][]
        volatility_risk?: number[][]
      }
      [key: string]: any
    }
    recommendations?: string[]
  }
  model_info?: {
    model_type: string
    prediction_horizon: string
    features_used: number
    risk_assessment: string
  }
  pipeline_timestamp?: string
  // Legacy fields for backward compatibility
  overall_risk_score?: number
  overall_risk_level?: string
  patient_predictions?: Array<{
    glucose_predictions?: {
      horizons_days: number[]
      p10_quantile: number[]
      p50_quantile: number[]
      p90_quantile: number[]
    }
    risk_assessment?: {
      overall_risk_score: number
      overall_risk_level: string
      horizon_risks?: Record<string, {
        hyper_risk: number
        hypo_risk: number
        trend_high_risk: number
        trend_low_risk: number
        volatility_risk: number
        risk_score: number
        risk_level: string
      }>
      context_factors?: Record<string, any>
      detailed_explanations?: {
        base_risk_components?: {
          hyper_risk?: number[][]
          hypo_risk?: number[][]
          trend_high_risk?: number[][]
          trend_low_risk?: number[][]
          volatility_risk?: number[][]
        }
        [key: string]: any
      }
      recommendations?: string[]
    }
    risk_score?: number
    risk_level?: string
  }>
  // Keep flexible for any additional fields the API might return
  [key: string]: any
}

export interface ParsedDiabetesData {
  forecastData: Array<{
    day: number
    p10?: number
    p50?: number
    p90?: number
  }>
  horizonRiskData: Array<{
    horizon: string
    risk: number
    level: string
  }>
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
  horizonRisks: Record<string, {
    hyper_risk: number
    hypo_risk: number
    trend_high_risk: number
    trend_low_risk: number
    volatility_risk: number
    risk_score: number
    risk_level: string
  }>
  recommendations: string[]
  modelInfo: {
    features_used: number
    model_type: string
    prediction_horizon: string
    risk_assessment: string
  } | null
}

// --- Class-based Data Model for Diabetes Predictions ---

export class DiabetesPrediction {
  patientId: any;
  pipelineTimestamp: any;
  predictionMetadata: any;
  glucosePredictions: any;
  modelInfo: any;
  riskAssessment: any;
  rawApiResponse: any;

  constructor({
    patientId,
    pipelineTimestamp,
    predictionMetadata,
    glucosePredictions,
    modelInfo,
    riskAssessment,
    rawApiResponse
  }: {
    patientId: any;
    pipelineTimestamp: any;
    predictionMetadata: any;
    glucosePredictions: any;
    modelInfo: any;
    riskAssessment: any;
    rawApiResponse: any;
  }) {
    this.patientId = patientId;
    this.pipelineTimestamp = pipelineTimestamp;
    this.predictionMetadata = predictionMetadata;
    this.glucosePredictions = glucosePredictions;
    this.modelInfo = modelInfo;
    this.riskAssessment = riskAssessment;
    this.rawApiResponse = rawApiResponse;
  }

  static fromApi(apiResponse: any) {
    if (!apiResponse || typeof apiResponse !== 'object') {
      logWarn('Invalid diabetes API response for class parsing', {});
      return null;
    }
    return new DiabetesPrediction({
      patientId: apiResponse.patient_id ?? apiResponse.prediction_metadata?.patient_id ?? null,
      pipelineTimestamp: apiResponse.pipeline_timestamp ?? null,
      predictionMetadata: apiResponse.prediction_metadata ?? null,
      glucosePredictions: apiResponse.glucose_predictions ?? null,
      modelInfo: apiResponse.model_info ?? null,
      riskAssessment: apiResponse.risk_assessment ?? null,
      rawApiResponse: apiResponse
    });
  }

  // Example utility: get forecast data for charting
  getForecastData() {
    const pred = this.glucosePredictions;
    if (!pred || !Array.isArray(pred.horizons_days)) return [];
    return pred.horizons_days.map((day: any, i: any) => ({
      day,
      p10: pred.p10_quantile?.[i],
      p50: pred.p50_quantile?.[i],
      p90: pred.p90_quantile?.[i],
    }));
  }

  // Example utility: get risk summary
  getRiskSummary() {
    const ra = this.riskAssessment;
    if (!ra) return null;
    return {
      overallRiskScore: ra.overall_risk_score,
      overallRiskLevel: ra.overall_risk_level,
      recommendations: ra.recommendations || [],
    };
  }

  toParsedData() {
    const ra = this.riskAssessment || {};
    const detailed = ra.detailed_explanations || {};
    const base = detailed.base_risk_components || {};
    const context = ra.context_factors || {};
    return {
      forecastData: this.getForecastData(),
      horizonRiskData: Object.entries(ra.horizon_risks || {}).map(([key, value]: any) => ({
        horizon: key.replace('horizon_', '').replace('d', ''),
        risk: Number(value?.risk_score ?? 0),
        level: String(value?.risk_level ?? 'unknown')
      })),
      overallRisk: ra.overall_risk_score != null && ra.overall_risk_level != null
        ? { score: Number(ra.overall_risk_score), level: String(ra.overall_risk_level) }
        : null,
      contextFactors: context,
      baseRiskComponents: {
        hyper_risk: Array.isArray(base.hyper_risk?.[0]) ? base.hyper_risk[0] : [],
        hypo_risk: Array.isArray(base.hypo_risk?.[0]) ? base.hypo_risk[0] : [],
        trend_high_risk: Array.isArray(base.trend_high_risk?.[0]) ? base.trend_high_risk[0] : [],
        trend_low_risk: Array.isArray(base.trend_low_risk?.[0]) ? base.trend_low_risk[0] : [],
        volatility_risk: Array.isArray(base.volatility_risk?.[0]) ? base.volatility_risk[0] : [],
      },
      horizonRisks: ra.horizon_risks || {},
      recommendations: ra.recommendations || [],
      modelInfo: this.modelInfo || null,
    };
  }

  // Add more utilities as needed...
}

export class Patient {
  id: any;
  name: any;
  age: any;
  gender: any;
  weight: any;
  height: any;
  createdAt: any;
  lastUpdated: any;
  predictions: any[];

  constructor({ id, name, age, gender, weight, height, createdAt, lastUpdated, predictions }: {
    id: any;
    name: any;
    age: any;
    gender: any;
    weight: any;
    height: any;
    createdAt: any;
    lastUpdated: any;
    predictions: any[];
  }) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.gender = gender;
    this.weight = weight;
    this.height = height;
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
    this.predictions = predictions || [];
  }

  addPrediction(prediction: any) {
    if (prediction instanceof DiabetesPrediction) {
      this.predictions.push(prediction);
      this.lastUpdated = new Date().toISOString();
    }
  }

  getLatestPrediction() {
    if (!this.predictions.length) return null;
    return this.predictions[this.predictions.length - 1];
  }
}

// --- Updated parser to return DiabetesPrediction instance ---

export function parseDiabetesResponse(response: any) {
  const prediction = DiabetesPrediction.fromApi(response);
  if (!prediction) {
    logWarn('Failed to parse diabetes response into DiabetesPrediction class', {});
    return null;
  }
  return prediction;
}
