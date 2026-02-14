import KpiCard from '../shared/KpiCard';
import DataTable, { type Column } from '../shared/DataTable';
import { adherenceKpis, adherenceCohorts } from '../../data/mockData';
import type { AdherenceCohort, ClaimDetail } from '../../types';
import { sampleClaimDetail } from '../../data/mockData';

interface Props {
  onOpenDrawer: (claim: ClaimDetail) => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function AdherenceBar({ pct }: { pct: number }) {
  // Segment into high (≥80), medium (60-80), low (<60)
  const high = Math.min(pct, 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';
  const bgColor = pct >= 80 ? 'bg-emerald-100' : pct >= 60 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-24 rounded-full ${bgColor}`}>
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${high}%` }} />
      </div>
      <span className="text-xs tabular-nums font-medium text-gray-600">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function ClinicalAdherence({ onOpenDrawer }: Props) {
  const cohortColumns: Column<AdherenceCohort>[] = [
    { key: 'cond',    header: 'Condition',          render: (r) => <span className="font-medium">{r.condition}</span> },
    { key: 'members', header: 'Members',            align: 'right', render: (r) => r.members.toLocaleString() },
    { key: 'adh',     header: 'Adherence %',        render: (r) => <AdherenceBar pct={r.adherencePct} /> },
    { key: 'gaps',    header: 'Gaps in Therapy',    align: 'right', render: (r) => r.gapsInTherapy.toLocaleString() },
    { key: 'savings', header: 'Potential Savings',  align: 'right', render: (r) => fmt(r.potentialSavings) },
  ];

  // Summary distribution
  const totalMembers = adherenceCohorts.reduce((sum, c) => sum + c.members, 0);
  const highAdh   = adherenceCohorts.filter((c) => c.adherencePct >= 80).reduce((sum, c) => sum + c.members, 0);
  const medAdh    = adherenceCohorts.filter((c) => c.adherencePct >= 60 && c.adherencePct < 80).reduce((sum, c) => sum + c.members, 0);
  const lowAdh    = adherenceCohorts.filter((c) => c.adherencePct < 60).reduce((sum, c) => sum + c.members, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {adherenceKpis.map((m) => <KpiCard key={m.label} metric={m} />)}
      </div>

      {/* Adherence distribution gauge */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Adherence Distribution</h3>
        <div className="flex h-8 rounded-full overflow-hidden mb-3">
          <div className="bg-emerald-500 transition-all flex items-center justify-center text-xs text-white font-semibold"
               style={{ width: `${(highAdh / totalMembers) * 100}%` }}>
            {((highAdh / totalMembers) * 100).toFixed(0)}%
          </div>
          <div className="bg-amber-400 transition-all flex items-center justify-center text-xs text-white font-semibold"
               style={{ width: `${(medAdh / totalMembers) * 100}%` }}>
            {((medAdh / totalMembers) * 100).toFixed(0)}%
          </div>
          {lowAdh > 0 && (
            <div className="bg-red-400 transition-all flex items-center justify-center text-xs text-white font-semibold"
                 style={{ width: `${(lowAdh / totalMembers) * 100}%` }}>
              {((lowAdh / totalMembers) * 100).toFixed(0)}%
            </div>
          )}
        </div>
        <div className="flex gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> High (PDC &ge; 80%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Medium (60–79%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Low (&lt; 60%)</span>
        </div>
      </div>

      {/* Cohorts table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">Member Cohorts</h3>
        </div>
        <DataTable
          columns={cohortColumns}
          data={adherenceCohorts}
          rowKey={(r) => r.condition}
          onRowClick={() => onOpenDrawer(sampleClaimDetail)}
        />
      </div>
    </div>
  );
}
