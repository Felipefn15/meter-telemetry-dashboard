'use client';

import Link from 'next/link';
import type { MeterSummary } from '@/lib/types';
import { useState } from 'react';

interface MeterTableProps {
  summaries: MeterSummary[];
}

type SortField = 'meterId' | 'totalConsumption' | 'incidentCount' | 'status';
type SortDirection = 'asc' | 'desc';

export function MeterTable({ summaries }: MeterTableProps) {
  const [sortField, setSortField] = useState<SortField>('meterId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSummaries = [...summaries].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'meterId':
        comparison = a.meterId.localeCompare(b.meterId);
        break;
      case 'totalConsumption':
        comparison = a.totalConsumption - b.totalConsumption;
        break;
      case 'incidentCount':
        comparison = a.incidentCount - b.incidentCount;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              onClick={() => handleSort('meterId')}
            >
              Meter ID
              {sortField === 'meterId' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              onClick={() => handleSort('totalConsumption')}
            >
              Total Consumption (L)
              {sortField === 'totalConsumption' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              onClick={() => handleSort('incidentCount')}
            >
              Incidents
              {sortField === 'incidentCount' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              Status
              {sortField === 'status' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedSummaries.map((summary) => (
            <tr key={summary.meterId} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {summary.meterId}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {summary.totalConsumption.toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {summary.incidentCount}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    summary.status === 'normal'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {summary.status === 'normal' ? 'Normal' : 'Has Incidents'}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <Link
                  href={`/meter/${summary.meterId}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

