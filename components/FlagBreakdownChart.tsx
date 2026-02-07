'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProcessedReading } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface FlagBreakdownChartProps {
  readings: ProcessedReading[];
}

export function FlagBreakdownChart({ readings }: FlagBreakdownChartProps) {
  const chartData = readings.map((reading) => ({
    hour: format(parseISO(reading.hour), 'HH:mm'),
    normal: reading.flag === 'normal' ? Number(reading.consumption.toFixed(2)) : 0,
    gapEstimated: reading.flag === 'gap_estimated' ? Number(reading.consumption.toFixed(2)) : 0,
    counterReset: reading.flag === 'counter_reset' ? Number(reading.consumption.toFixed(2)) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis label={{ value: 'Consumption (L)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="normal" stackId="a" fill="#10b981" name="Normal" />
        <Bar dataKey="gapEstimated" stackId="a" fill="#f59e0b" name="Gap Estimated" />
        <Bar dataKey="counterReset" stackId="a" fill="#ef4444" name="Counter Reset" />
      </BarChart>
    </ResponsiveContainer>
  );
}

