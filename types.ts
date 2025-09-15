export interface Source {
  uri: string;
  title: string;
}

export interface Risk {
  title: string;
  summary: string;
  sources: Source[];
  date?: string;
  link?: string;
}

export type DailyBriefData = Record<string, Risk[]>;
