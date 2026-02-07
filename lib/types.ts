export interface RawReading {
  meterId: string;
  timestamp: string;
  cumulativeVolume: number;
}

export interface ProcessedReading {
  meterId: string;
  hour: string;
  consumption: number;
  flag: 'normal' | 'gap_estimated' | 'counter_reset';
}

export interface MeterSummary {
  meterId: string;
  totalConsumption: number;
  incidentCount: number;
  status: 'normal' | 'has_incidents';
  lastReading: string;
}

