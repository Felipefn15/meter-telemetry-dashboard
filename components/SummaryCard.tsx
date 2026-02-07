interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

