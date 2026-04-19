export interface TopFactor {
  col: string;
  label: string;
  icon: string;
  value: number;
  shap: number;
  direction: string;
  higher_is_better: boolean | null;
}

export interface PredictionResponse {
  gad7_score:      number;
  risk_tier:       "Minimal" | "Subthreshold" | "Moderate" | "Severe";
  risk_prob:       number;
  confidence_low:  number;
  confidence_high: number;
  shap_values:     number[];
  top_factors:     TopFactor[];
  feature_values:  Record<string, number>;
}
