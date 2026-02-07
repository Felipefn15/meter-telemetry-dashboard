import { SummaryCard } from '@/components/SummaryCard';
import { MeterTable } from '@/components/MeterTable';
import {
  calculateMeterSummaries,
  calculateFleetTotal,
  calculateTotalIncidents,
} from '@/lib/utils';
import readingsData from '@/data/readings.json';
import type { RawReading } from '@/lib/types';

export default function Home() {
  const rawReadings = readingsData as RawReading[];
  const summaries = calculateMeterSummaries(rawReadings);
  const fleetTotal = calculateFleetTotal(rawReadings);
  const totalIncidents = calculateTotalIncidents(rawReadings);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Meter Telemetry Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and analyze water meter consumption data
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SummaryCard
            title="Total Fleet Consumption"
            value={`${fleetTotal.toFixed(2)} L`}
            subtitle="Total consumption across all meters"
          />
          <SummaryCard
            title="Total Incidents"
            value={totalIncidents}
            subtitle="Gaps and counter resets detected"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Fleet Overview</h2>
          <p className="mt-1 text-sm text-gray-600">
            Click on column headers to sort. Click "View Details" to see consumption charts.
          </p>
        </div>

        <MeterTable summaries={summaries} />
      </div>
    </div>
  );
}
