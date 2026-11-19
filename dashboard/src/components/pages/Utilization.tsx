import KpiCard from '../shared/KpiCard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { utilizationKpis, utilizationByAge, channelMix } from '../../data/mockData';

export default function Utilization() {
  return (
    <div className="space-y-6">
      {/* KPI chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {utilizationKpis.map((m) => <KpiCard key={m.label} metric={m} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims per 1,000 by age band */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Claims per 1,000 Members by Age Band</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={utilizationByAge} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="ageBand" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#9ca3af' }} width={45} />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), 'Claims per 1,000']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="claimsPer1000" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel mix small multiples */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Channel Mix by Client</h3>
          <div className="space-y-3">
            {channelMix.map((cm) => (
              <div key={cm.plan}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{cm.plan}</span>
                  <div className="flex gap-3 text-gray-400">
                    <span>Retail {cm.retail}%</span>
                    <span>Mail {cm.mail}%</span>
                    <span>Specialty {cm.specialty}%</span>
                  </div>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div className="bg-blue-500 transition-all" style={{ width: `${cm.retail}%` }} />
                  <div className="bg-amber-400 transition-all" style={{ width: `${cm.mail}%` }} />
                  <div className="bg-rose-400 transition-all" style={{ width: `${cm.specialty}%` }} />
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Retail</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Mail</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Specialty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
