export interface DailyStats {
    interactions: number;
    hours: number;
}

export type YearlyHistory = Record<string, DailyStats[]>;