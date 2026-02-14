import { useState } from 'react';
import KpiCard from '../shared/KpiCard';
import TrendChart from '../shared/TrendChart';
import CategoryChart from '../shared/CategoryChart';
import DataTable, { type Column } from '../shared/DataTable';
import { overviewKpis, trendData, categoryData, topDrugs, planPerformance } from '../../data/mockData';
import { sampleClaimDetail } from '../../data/mockData';
import type { TopDrug, PlanPerformance, ClaimDetail } from '../../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  onOpenDrawer: (claim: ClaimDetail) => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Overview({ onOpenDrawer }: Props) {
  const [drugSort, setDrugSort] = useState<'spend' | 'trend'>('spend');

  const sortedDrugs = [...topDrugs].sort((a, b) =>
    drugSort === 'spend' ? b.totalSpend - a.totalSpend : b.trend - a.trend
  );

  const drugColumns: Column<TopDrug>[] = [
    { key: 'rank',   header: '#',           align: 'center', render: (_, i) => <span className="text-gray-400 text-xs">{i + 1}</span> },
    { key: 'drug',   header: 'Drug',        render: (r) => <span className="font-medium">{r.drugName}</span> },
    { key: 'ndc',    header: 'NDC',         render: (r) => <span className="font-mono text-xs text-gray-400">{r.ndc}</span> },
    { key: 'spend',  header: 'Total Spend', align: 'right', render: (r) => fmt(r.totalSpend) },
    { key: 'claims', header: 'Claims',      align: 'right', render: (r) => r.claims.toLocaleString() },
    { key: 'mbrs',   header: 'Members',     align: 'right', render: (r) => r.members.toLocaleString() },
    { key: 'trend',  header: 'Trend',       align: 'right', render: (r) => (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold
        ${r.trend >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
        {r.trend >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {Math.abs(r.trend).toFixed(1)}%
      </span>
    )},
  ];

  const planColumns: Column<PlanPerformance>[] = [
    { key: 'plan',    header: 'Plan / Client', render: (r) => <span className="font-medium">{r.planName}</span> },
    { key: 'members', header: 'Members', align: 'right', render: (r) => r.members.toLocaleString() },
    { key: 'pmpm',    header: 'PMPM',    align: 'right', render: (r) => `$${r.pmpm.toFixed(2)}` },
    { key: 'gfr',     header: 'Generic Fill Rate', align: 'right', render: (r) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
        ${r.genericFillRate >= 90 ? 'bg-emerald-50 text-emerald-700' :
          r.genericFillRate >= 85 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
        {r.genericFillRate.toFixed(1)}%
      </span>
    )},
    { key: 'spec',  header: 'Specialty %', align: 'right', render: (r) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
        ${r.specialtySpendPct <= 45 ? 'bg-emerald-50 text-emerald-700' :
          r.specialtySpendPct <= 55 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
        {r.specialtySpendPct.toFixed(1)}%
      </span>
    )},
    { key: 'adh',   header: 'Adherence', align: 'right', render: (r) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
        ${r.adherenceScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
          r.adherenceScore >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
        {r.adherenceScore.toFixed(1)}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {overviewKpis.map((m) => <KpiCard key={m.label} metric={m} />)}
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Spend & Claims</h3>
          <TrendChart data={trendData} />
        </div>

        {/* Category mix */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Drug Category Share (% of spend)</h3>
          <CategoryChart data={categoryData} />
        </div>

        {/* Top drugs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-gray-700">Top Cost Drivers – Drugs</h3>
            <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setDrugSort('spend')}
                className={`px-3 py-1 rounded-md transition ${drugSort === 'spend' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'}`}
              >By Spend</button>
              <button
                onClick={() => setDrugSort('trend')}
                className={`px-3 py-1 rounded-md transition ${drugSort === 'trend' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'}`}
              >By Trend</button>
            </div>
          </div>
          <DataTable
            columns={drugColumns}
            data={sortedDrugs}
            onRowClick={() => onOpenDrawer(sampleClaimDetail)}
          />
        </div>

        {/* Plan performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-gray-700">Plan / Client Performance</h3>
          </div>
          <DataTable
            columns={planColumns}
            data={planPerformance}
            onRowClick={() => onOpenDrawer(sampleClaimDetail)}
          />
        </div>
      </div>
    </div>
  );
}
