export class DiabetesAnalysis {
  constructor(public readonly raw: any) {}

  static fromApi(raw: any) {
    return new DiabetesAnalysis(raw);
  }

  get patientId(): number | string | undefined {
    return this.raw?.patient_id ?? this.raw?.prediction_metadata?.patient_id;
  }

  get pipelineTimestamp(): string | undefined {
    return this.raw?.pipeline_timestamp;
  }

  get modelInfo(): any {
    return this.raw?.model_info;
  }

  get predictionMetadata(): any {
    return this.raw?.prediction_metadata;
  }

  get glucosePredictions(): any {
    return this.raw?.glucose_predictions;
  }

  get riskAssessment(): any {
    return this.raw?.risk_assessment;
  }

  get overallRiskScore(): number | undefined {
    return this.raw?.risk_assessment?.overall_risk_score;
  }

  get overallRiskLevel(): string | undefined {
    return this.raw?.risk_assessment?.overall_risk_level;
  }

  get recommendations(): string[] {
    return this.raw?.risk_assessment?.recommendations || [];
  }

  get contextFactors(): any {
    return this.raw?.risk_assessment?.context_factors || {};
  }

  get baseRiskComponents(): any {
    return this.raw?.risk_assessment?.detailed_explanations?.base_risk_components || {};
  }

  get horizonRisks(): any {
    return this.raw?.risk_assessment?.horizon_risks || {};
  }

  get forecastData(): Array<{ day: number; p10?: number; p50?: number; p90?: number }> {
    const pred = this.glucosePredictions;
    if (!pred || !Array.isArray(pred.horizons_days)) return [];
    return pred.horizons_days.map((day: number, i: number) => ({
      day,
      p10: pred.p10_quantile?.[i],
      p50: pred.p50_quantile?.[i],
      p90: pred.p90_quantile?.[i],
    }));
  }

  get horizonRiskData(): Array<{ horizon: string; risk: number; level: string }> {
    const risks = this.horizonRisks;
    if (!risks || typeof risks !== 'object') return [];
    return Object.entries(risks).map(([key, value]: any) => ({
      horizon: key.replace('horizon_', '').replace('d', ''),
      risk: Number(value?.risk_score ?? 0),
      level: String(value?.risk_level ?? 'unknown'),
    }));
  }

  // Add more getters/utilities as needed for your UI
}
