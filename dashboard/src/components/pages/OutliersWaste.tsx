import DataTable, { type Column } from '../shared/DataTable';
import { highCostOutliers, daysSupplyAnomalies } from '../../data/mockData';
import type { HighCostOutlier, DaysSupplyAnomaly, ClaimDetail } from '../../types';
import { sampleClaimDetail } from '../../data/mockData';

interface Props {
  onOpenDrawer: (claim: ClaimDetail) => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function OutliersWaste({ onOpenDrawer }: Props) {
  const outlierColumns: Column<HighCostOutlier>[] = [
    { key: 'member', header: 'Member ID',       render: (r) => <span className="font-mono text-xs">{r.memberId}</span> },
    { key: 'drug',   header: 'Drug',             render: (r) => <span className="font-medium">{r.drug}</span> },
    { key: 'cost',   header: '30-Day Equiv Cost', align: 'right', render: (r) => (
      <span className="font-semibold text-red-600">{fmt(r.cost30Day)}</span>
    )},
    { key: 'claims', header: '# Claims', align: 'right', render: (r) => r.claims },
    { key: 'presc',  header: 'Prescriber',       render: (r) => r.prescriber },
  ];

  const anomalyColumns: Column<DaysSupplyAnomaly>[] = [
    { key: 'flag', header: 'Flag Type', render: (r) => (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{r.flagType}</span>
    )},
    { key: 'drug', header: 'Drug',    render: (r) => <span className="font-medium">{r.drugName}</span> },
    { key: 'ndc',  header: 'NDC',     render: (r) => <span className="font-mono text-xs text-gray-400">{r.ndc}</span> },
    { key: 'avg',  header: 'Avg Qty', align: 'right', render: (r) => r.avgQty },
    { key: 'norm', header: 'Norm Qty', align: 'right', render: (r) => r.normQty },
    { key: 'plans', header: 'Plans Impacted', align: 'right', render: (r) => r.plansImpacted },
  ];

  return (
    <div className="space-y-6">
      {/* High-cost outliers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">High-Cost Outliers</h3>
          <p className="text-xs text-gray-400 mt-0.5">Members with the highest 30-day equivalent drug costs</p>
        </div>
        <DataTable
          columns={outlierColumns}
          data={highCostOutliers}
          rowKey={(r) => r.memberId}
          onRowClick={() => onOpenDrawer(sampleClaimDetail)}
        />
      </div>

      {/* Days supply anomalies */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">Quantity & Days' Supply Anomalies</h3>
          <p className="text-xs text-gray-400 mt-0.5">Claims flagged for unusual quantity or fill patterns</p>
        </div>
        <DataTable
          columns={anomalyColumns}
          data={daysSupplyAnomalies}
          rowKey={(r) => r.ndc}
          onRowClick={() => onOpenDrawer(sampleClaimDetail)}
        />
      </div>
    </div>
  );
}
