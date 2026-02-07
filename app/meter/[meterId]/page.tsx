import Link from 'next/link';
import { ConsumptionChart } from '@/components/ConsumptionChart';
import { FlagBreakdownChart } from '@/components/FlagBreakdownChart';
import { SummaryCard } from '@/components/SummaryCard';
import { getMeterReadings } from '@/lib/utils';
import readingsData from '@/data/readings.json';
import type { RawReading } from '@/lib/types';
import { notFound } from 'next/navigation';

interface MeterDetailPageProps {
  params: Promise<{ meterId: string }>;
}

export default async function MeterDetailPage({ params }: MeterDetailPageProps) {
  const { meterId } = await params;
  const rawReadings = readingsData as RawReading[];
  const readings = getMeterReadings(rawReadings, meterId);

  if (readings.length === 0) {
    notFound();
  }

  const totalConsumption = readings.reduce((sum, r) => sum + r.consumption, 0);
  const normalCount = readings.filter((r) => r.flag === 'normal').length;
  const gapCount = readings.filter((r) => r.flag === 'gap_estimated').length;
  const resetCount = readings.filter((r) => r.flag === 'counter_reset').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
          >
            ← Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{meterId}</h1>
          <p className="mt-2 text-gray-600">Detailed consumption analysis</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
          <SummaryCard
            title="Total Consumption"
            value={`${totalConsumption.toFixed(2)} L`}
          />
          <SummaryCard
            title="Normal Readings"
            value={normalCount}
          />
          <SummaryCard
            title="Gap Estimated"
            value={gapCount}
          />
          <SummaryCard
            title="Counter Resets"
            value={resetCount}
          />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Consumption Over Time
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <ConsumptionChart readings={readings} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Consumption by Flag Type
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <FlagBreakdownChart readings={readings} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Raw Data
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Consumption (L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Flag
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {readings.map((reading, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {reading.hour}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {reading.consumption.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          reading.flag === 'normal'
                            ? 'bg-green-100 text-green-800'
                            : reading.flag === 'gap_estimated'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reading.flag === 'normal'
                          ? 'Normal'
                          : reading.flag === 'gap_estimated'
                          ? 'Gap Estimated'
                          : 'Counter Reset'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

