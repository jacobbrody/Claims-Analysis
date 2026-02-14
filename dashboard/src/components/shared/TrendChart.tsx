import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { TrendPoint } from '../../types';

interface Props {
  data: TrendPoint[];
}

function fmtDollar(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function fmtCount(v: number) {
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
}

export default function TrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis
          yAxisId="spend"
          orientation="left"
          tickFormatter={fmtDollar}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          width={60}
        />
        <YAxis
          yAxisId="claims"
          orientation="right"
          tickFormatter={fmtCount}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          width={50}
        />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === 'Total Spend' ? fmtDollar(value) : fmtCount(value)
          }
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="spend"
          dataKey="spend"
          name="Total Spend"
          fill="#3b82f6"
          radius={[3, 3, 0, 0]}
          barSize={24}
          opacity={0.8}
        />
        <Line
          yAxisId="claims"
          type="monotone"
          dataKey="claims"
          name="Claim Count"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 3, fill: '#f59e0b' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
