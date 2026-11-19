import { ChevronUp, ChevronDown } from 'lucide-react';
import type { KpiMetric } from '../../types';

// Metrics where an increase is BAD (higher = worse).
const INVERSE_METRICS = ['Specialty % of Spend'];

interface Props {
  metric: KpiMetric;
}

export default function KpiCard({ metric }: Props) {
  const positive = metric.change >= 0;
  const inversed = INVERSE_METRICS.some((m) => metric.label.includes(m));
  const favorable = inversed ? !positive : positive;

  const color = favorable ? 'text-emerald-600' : 'text-red-500';
  const bg    = favorable ? 'bg-emerald-50'    : 'bg-red-50';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{metric.label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>
        {positive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {Math.abs(metric.change).toFixed(1)}% vs prior
      </span>
    </div>
  );
}
