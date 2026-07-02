export type EvaluationStatus =
  | 'In Review'
  | 'Completed'
  | 'Needs Attention';

export type EvaluationStatusKey =
  | 'review'
  | 'completed'
  | 'attention';

export interface EvaluationTask {
  id: string;
  title: string;
  category: string;
  reviewer: string;
  status: EvaluationStatus;
  statusKey: EvaluationStatusKey;
  qualityScore: number;
}

export interface NewEvaluation {
  title: string;
  category: string;
  reviewer: string;
  status: EvaluationStatus;
}
