import type { ProcessedReading, MeterSummary, RawReading } from './types';
import { processMeterReadings } from './processor';

export function calculateMeterSummaries(
  rawReadings: RawReading[]
): MeterSummary[] {
  const processed = processMeterReadings(rawReadings);
  const summaries: Record<string, MeterSummary> = {};

  for (const reading of processed) {
    if (!summaries[reading.meterId]) {
      summaries[reading.meterId] = {
        meterId: reading.meterId,
        totalConsumption: 0,
        incidentCount: 0,
        status: 'normal',
        lastReading: reading.hour,
      };
    }

    summaries[reading.meterId].totalConsumption += reading.consumption;

    if (reading.flag !== 'normal') {
      summaries[reading.meterId].incidentCount++;
      summaries[reading.meterId].status = 'has_incidents';
    }

    if (reading.hour > summaries[reading.meterId].lastReading) {
      summaries[reading.meterId].lastReading = reading.hour;
    }
  }

  return Object.values(summaries);
}

export function getMeterReadings(
  rawReadings: RawReading[],
  meterId: string
): ProcessedReading[] {
  const processed = processMeterReadings(rawReadings);
  return processed.filter((r) => r.meterId === meterId);
}

export function calculateFleetTotal(rawReadings: RawReading[]): number {
  const processed = processMeterReadings(rawReadings);
  return processed.reduce((sum, r) => sum + r.consumption, 0);
}

export function calculateTotalIncidents(rawReadings: RawReading[]): number {
  const processed = processMeterReadings(rawReadings);
  return processed.filter((r) => r.flag !== 'normal').length;
}

