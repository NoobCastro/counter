export interface DailyStats {
    interactions: number;
    hours: number;
    pace: number;
}

export type YearlyHistory = Record<string, DailyStats[]>;