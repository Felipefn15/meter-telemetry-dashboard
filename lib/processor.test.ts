import { processMeterReadings } from './processor';
import type { RawReading } from './types';

describe('processMeterReadings', () => {
  it('should return empty array for empty input', () => {
    expect(processMeterReadings([])).toEqual([]);
  });

  it('should handle normal consecutive readings', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T08:02:00Z',
        cumulativeVolume: 10000,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T09:05:00Z',
        cumulativeVolume: 10045,
      },
    ];

    const result = processMeterReadings(readings);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      meterId: 'MTR-001',
      hour: "2025-02-05T08:00:00Z",
      consumption: 45,
      flag: 'normal',
    });
  });

  it('should handle gap in readings by distributing consumption', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-002',
        timestamp: '2025-02-05T10:07:00Z',
        cumulativeVolume: 52230,
      },
      {
        meterId: 'MTR-002',
        timestamp: '2025-02-05T14:02:00Z',
        cumulativeVolume: 52530,
      },
    ];

    const result = processMeterReadings(readings);

    expect(result).toHaveLength(4);
    expect(result.every((r) => r.flag === 'gap_estimated')).toBe(true);
    expect(result.every((r) => r.meterId === 'MTR-002')).toBe(true);
    
    const totalConsumption = result.reduce((sum, r) => sum + r.consumption, 0);
    expect(totalConsumption).toBeCloseTo(300, 1);
  });

  it('should handle counter reset', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-003',
        timestamp: '2025-02-05T12:03:00Z',
        cumulativeVolume: 890410,
      },
      {
        meterId: 'MTR-003',
        timestamp: '2025-02-05T13:01:00Z',
        cumulativeVolume: 45,
      },
    ];

    const result = processMeterReadings(readings);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      meterId: 'MTR-003',
      hour: "2025-02-05T12:00:00Z",
      consumption: 45,
      flag: 'counter_reset',
    });
  });

  it('should remove duplicate readings', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T08:02:00Z',
        cumulativeVolume: 10000,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T08:02:00Z',
        cumulativeVolume: 10000,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T09:05:00Z',
        cumulativeVolume: 10045,
      },
    ];

    const result = processMeterReadings(readings);

    expect(result).toHaveLength(1);
  });

  it('should handle multiple meters', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T08:02:00Z',
        cumulativeVolume: 10000,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T09:05:00Z',
        cumulativeVolume: 10045,
      },
      {
        meterId: 'MTR-002',
        timestamp: '2025-02-05T08:05:00Z',
        cumulativeVolume: 52100,
      },
      {
        meterId: 'MTR-002',
        timestamp: '2025-02-05T09:03:00Z',
        cumulativeVolume: 52160,
      },
    ];

    const result = processMeterReadings(readings);

    expect(result).toHaveLength(2);
    expect(result.filter((r) => r.meterId === 'MTR-001')).toHaveLength(1);
    expect(result.filter((r) => r.meterId === 'MTR-002')).toHaveLength(1);
  });

  it('should skip meters with less than 2 readings', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T08:02:00Z',
        cumulativeVolume: 10000,
      },
    ];

    const result = processMeterReadings(readings);

    expect(result).toHaveLength(0);
  });

  it('should handle complex scenario with all flags', () => {
    const readings: RawReading[] = [
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T08:02:00Z',
        cumulativeVolume: 10000,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T09:05:00Z',
        cumulativeVolume: 10045,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T11:07:00Z',
        cumulativeVolume: 10140,
      },
      {
        meterId: 'MTR-001',
        timestamp: '2025-02-05T12:01:00Z',
        cumulativeVolume: 10,
      },
    ];

    const result = processMeterReadings(readings);

    const normal = result.filter((r) => r.flag === 'normal');
    const gap = result.filter((r) => r.flag === 'gap_estimated');
    const reset = result.filter((r) => r.flag === 'counter_reset');

    expect(normal.length).toBeGreaterThan(0);
    expect(gap.length).toBeGreaterThan(0);
    expect(reset.length).toBeGreaterThan(0);
  });
});

