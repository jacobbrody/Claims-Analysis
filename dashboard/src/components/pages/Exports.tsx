import { Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react';

const reports = [
  {
    name: 'Claims Detail Export',
    description: 'Full claim-level extract with all fields, filtered by current selections.',
    format: 'CSV',
    icon: <FileSpreadsheet size={20} />,
    size: '~12 MB',
  },
  {
    name: 'Member Summary',
    description: 'One row per member with tier assignment, total PPPM charged, and drugs on claims.',
    format: 'CSV',
    icon: <FileSpreadsheet size={20} />,
    size: '~2 MB',
  },
  {
    name: 'Tier Breakdown Report',
    description: 'Monthly tier-level aggregation with member counts, member-months, and revenue.',
    format: 'CSV',
    icon: <FileSpreadsheet size={20} />,
    size: '~500 KB',
  },
  {
    name: 'Cost Driver Analysis',
    description: 'Top drugs, prescribers, and therapeutic classes with trend comparisons.',
    format: 'PDF',
    icon: <FileText size={20} />,
    size: '~4 MB',
  },
  {
    name: 'Adherence Scorecard',
    description: 'PDC metrics by condition with gap analysis and savings estimates.',
    format: 'PDF',
    icon: <FileText size={20} />,
    size: '~3 MB',
  },
  {
    name: 'Outlier Flagging Report',
    description: 'Flagged claims for high cost, duplicate therapy, and quantity anomalies.',
    format: 'CSV',
    icon: <FileSpreadsheet size={20} />,
    size: '~1 MB',
  },
];

export default function Exports() {
  return (
    <div className="space-y-6">
      {/* Scheduled exports banner */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 flex items-start gap-4">
        <Calendar size={20} className="text-brand-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-brand-800">Scheduled Exports</h3>
          <p className="text-xs text-brand-600 mt-1">
            Set up recurring exports delivered to your email or SFTP. Contact your account manager to configure automated reporting.
          </p>
        </div>
      </div>

      {/* Report list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.name} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900">{report.name}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{report.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {report.format} &middot; {report.size}
                  </span>
                </div>
              </div>
              <button className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
