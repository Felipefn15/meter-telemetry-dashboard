'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProcessedReading } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface ConsumptionChartProps {
  readings: ProcessedReading[];
}

export function ConsumptionChart({ readings }: ConsumptionChartProps) {
  const chartData = readings.map((reading) => ({
    hour: format(parseISO(reading.hour), 'HH:mm'),
    consumption: Number(reading.consumption.toFixed(2)),
    flag: reading.flag,
  }));

  const normalData = chartData.map((d) => ({
    ...d,
    consumption: d.flag === 'normal' ? d.consumption : 0,
  }));

  const gapData = chartData.map((d) => ({
    ...d,
    consumption: d.flag === 'gap_estimated' ? d.consumption : 0,
  }));

  const resetData = chartData.map((d) => ({
    ...d,
    consumption: d.flag === 'counter_reset' ? d.consumption : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis label={{ value: 'Consumption (L)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="consumption" fill="#3b82f6" name="Total Consumption" />
      </BarChart>
    </ResponsiveContainer>
  );
}

