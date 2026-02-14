import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import DataTable, { type Column } from '../shared/DataTable';
import { therapeuticClassCosts, topPrescribers } from '../../data/mockData';
import type { TopPrescriber, ClaimDetail } from '../../types';
import { sampleClaimDetail } from '../../data/mockData';

interface Props {
  onOpenDrawer: (claim: ClaimDetail) => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function CostDrivers({ onOpenDrawer }: Props) {
  const prescriberColumns: Column<TopPrescriber>[] = [
    { key: 'name',     header: 'Prescriber',  render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'spec',     header: 'Specialty',    render: (r) => <span className="text-gray-500">{r.specialty}</span> },
    { key: 'region',   header: 'Region',       render: (r) => r.region },
    { key: 'spend',    header: 'Total Spend',  align: 'right', render: (r) => fmt(r.totalSpend) },
    { key: 'claims',   header: 'Claims',       align: 'right', render: (r) => r.claims.toLocaleString() },
    { key: 'patients', header: 'Patients',     align: 'right', render: (r) => r.patients.toLocaleString() },
    { key: 'action',   header: '',             align: 'center', render: () => (
      <button className="text-xs font-medium text-brand-600 hover:text-brand-800 transition">
        View Cohort
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Therapeutic class chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Therapeutic Classes by PMPM</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={therapeuticClassCosts}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => `$${v}`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis
              type="category"
              dataKey="className"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              width={130}
            />
            <Tooltip
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'PMPM']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="pmpm" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top prescribers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">Top Prescribers by Total Spend</h3>
        </div>
        <DataTable
          columns={prescriberColumns}
          data={topPrescribers}
          onRowClick={() => onOpenDrawer(sampleClaimDetail)}
        />
      </div>
    </div>
  );
}
