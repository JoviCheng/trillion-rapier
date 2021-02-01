export interface UpScoreFunc {
  (curScore: number, level?: number): number;
}

export enum RewardType {
  PEG = 1,
  BOTTOM = 2,
}
