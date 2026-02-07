import { parseISO, format, startOfHour, differenceInHours, addHours } from 'date-fns';
import type { RawReading, ProcessedReading } from './types';

export function processMeterReadings(
  rawReadings: RawReading[]
): ProcessedReading[] {
  if (rawReadings.length === 0) {
    return [];
  }

  const sanitized = sanitizeReadings(rawReadings);
  const processed: ProcessedReading[] = [];

  const readingsByMeter = groupByMeter(sanitized);

  for (const [meterId, readings] of Object.entries(readingsByMeter)) {
    if (readings.length < 2) {
      continue;
    }

    for (let i = 1; i < readings.length; i++) {
      const previous = readings[i - 1];
      const current = readings[i];

      const prevTimestamp = parseISO(previous.timestamp);
      const currTimestamp = parseISO(current.timestamp);
      const prevVolume = previous.cumulativeVolume;
      const currVolume = current.cumulativeVolume;

      if (currVolume < prevVolume) {
        handleCounterReset(
          meterId,
          currTimestamp,
          currVolume,
          processed
        );
      } else {
        const prevHourUTC = new Date(Date.UTC(
          prevTimestamp.getUTCFullYear(),
          prevTimestamp.getUTCMonth(),
          prevTimestamp.getUTCDate(),
          prevTimestamp.getUTCHours()
        ));
        const currHourUTC = new Date(Date.UTC(
          currTimestamp.getUTCFullYear(),
          currTimestamp.getUTCMonth(),
          currTimestamp.getUTCDate(),
          currTimestamp.getUTCHours()
        ));
        const hoursDiff = differenceInHours(currHourUTC, prevHourUTC);

        if (hoursDiff === 1) {
          handleNormalReading(
            meterId,
            prevTimestamp,
            currVolume - prevVolume,
            processed
          );
        } else if (hoursDiff > 1) {
          handleGap(
            meterId,
            prevTimestamp,
            currTimestamp,
            currVolume - prevVolume,
            hoursDiff,
            processed
          );
        }
      }
    }
  }

  return processed.sort((a, b) => {
    const timeCompare = a.hour.localeCompare(b.hour);
    if (timeCompare !== 0) return timeCompare;
    return a.meterId.localeCompare(b.meterId);
  });
}

function sanitizeReadings(readings: RawReading[]): RawReading[] {
  const seen = new Set<string>();
  const unique: RawReading[] = [];

  for (const reading of readings) {
    const key = `${reading.meterId}-${reading.timestamp}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(reading);
    }
  }

  return unique.sort((a, b) => {
    const timeCompare = a.timestamp.localeCompare(b.timestamp);
    if (timeCompare !== 0) return timeCompare;
    return a.meterId.localeCompare(b.meterId);
  });
}

function groupByMeter(
  readings: RawReading[]
): Record<string, RawReading[]> {
  const grouped: Record<string, RawReading[]> = {};

  for (const reading of readings) {
    if (!grouped[reading.meterId]) {
      grouped[reading.meterId] = [];
    }
    grouped[reading.meterId].push(reading);
  }

  return grouped;
}

function handleNormalReading(
  meterId: string,
  timestamp: Date,
  consumption: number,
  processed: ProcessedReading[]
): void {
  const hour = getHourString(timestamp);
  processed.push({
    meterId,
    hour,
    consumption,
    flag: 'normal',
  });
}

function handleGap(
  meterId: string,
  startTimestamp: Date,
  endTimestamp: Date,
  totalConsumption: number,
  hoursDiff: number,
  processed: ProcessedReading[]
): void {
  const startHourUTC = new Date(Date.UTC(
    startTimestamp.getUTCFullYear(),
    startTimestamp.getUTCMonth(),
    startTimestamp.getUTCDate(),
    startTimestamp.getUTCHours()
  ));
  const endHourUTC = new Date(Date.UTC(
    endTimestamp.getUTCFullYear(),
    endTimestamp.getUTCMonth(),
    endTimestamp.getUTCDate(),
    endTimestamp.getUTCHours()
  ));
  const actualHoursDiff = differenceInHours(endHourUTC, startHourUTC);
  
  if (actualHoursDiff <= 0) {
    return;
  }

  const consumptionPerHour = totalConsumption / actualHoursDiff;

  for (let i = 0; i < actualHoursDiff; i++) {
    const hourTimestamp = addHours(startHourUTC, i);
    const hour = getHourString(hourTimestamp);

    processed.push({
      meterId,
      hour,
      consumption: consumptionPerHour,
      flag: 'gap_estimated',
    });
  }
}

function handleCounterReset(
  meterId: string,
  timestamp: Date,
  volume: number,
  processed: ProcessedReading[]
): void {
  const hour = getHourString(timestamp);
  processed.push({
    meterId,
    hour,
    consumption: volume,
    flag: 'counter_reset',
  });
}

function getHourString(timestamp: Date): string {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, '0');
  const day = String(timestamp.getUTCDate()).padStart(2, '0');
  const hour = String(timestamp.getUTCHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:00:00Z`;
}

