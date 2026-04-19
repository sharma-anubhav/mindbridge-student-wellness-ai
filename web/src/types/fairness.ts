export interface SubgroupMetrics {
  n: number;
  true_prevalence: number;
  predicted_positive_rate: number;
  mean_true_score: number;
  mean_predicted_score: number;
  tpr: number;
  fpr: number;
  mean_pred_prob: number;
  calibration_error: number;
}

export type GroupReport = Record<string, SubgroupMetrics>;

export interface FairnessResponse {
  fairness_report: Record<string, GroupReport>;
}

export interface MetaResponse {
  train_rows:   number;
  test_rows:    number;
  eval_metrics: Record<string, number>;
  residual_std: number;
  feature_cols: string[];
}
