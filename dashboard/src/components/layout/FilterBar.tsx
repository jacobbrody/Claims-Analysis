import { useEffect, useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';

const datePresets = ['Last 30 days', 'QTD', 'YTD', 'Custom'];
const clients     = ['All Clients', 'Acme Corp', 'Beta Industries', 'Gamma Health', 'Delta Group', 'Epsilon Partners', 'Zeta Corp'];
const planTypes   = ['All Plans', 'Commercial', 'Medicare', 'Medicaid', 'Exchange'];
const channels    = ['All Channels', 'Retail', 'Mail', 'Specialty'];
const drugCats    = ['GLP-1', 'Oncology', 'Autoimmune', 'HIV', 'Cardiovascular', 'Mental Health', 'Respiratory'];

function Dropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-200 rounded-lg text-sm pl-3 pr-8 py-1.5
                     focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 cursor-pointer"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function FilterBar() {
  const [dateRange, setDateRange] = useState('YTD');
  const [client, setClient]       = useState('All Clients');
  const [planType, setPlanType]   = useState('All Plans');
  const [channel, setChannel]     = useState('All Channels');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!applied) return;
    const t = setTimeout(() => setApplied(false), 1400);
    return () => clearTimeout(t);
  }, [applied]);

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const activeCount =
    (client !== 'All Clients' ? 1 : 0) +
    (planType !== 'All Plans' ? 1 : 0) +
    (channel !== 'All Channels' ? 1 : 0) +
    selectedCats.length;

  const resetAll = () => {
    setDateRange('YTD');
    setClient('All Clients');
    setPlanType('All Plans');
    setChannel('All Channels');
    setSelectedCats([]);
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex items-end gap-4 flex-wrap">
        <Dropdown label="Date Range"      options={datePresets} value={dateRange} onChange={setDateRange} />
        <Dropdown label="Client / Group"  options={clients}     value={client}    onChange={setClient} />
        <Dropdown label="Plan Type"       options={planTypes}   value={planType}  onChange={setPlanType} />
        <Dropdown label="Channel"         options={channels}    value={channel}   onChange={setChannel} />

        {/* Drug category multi-select */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Drug Category</span>
          <div className="flex gap-1 flex-wrap">
            {drugCats.map((cat) => {
              const on = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`text-xs px-2 py-1 rounded-full border transition
                    ${on
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-3 pb-0.5">
          {activeCount > 0 && (
            <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2.5 py-1 rounded-full">
              {activeCount} filter{activeCount > 1 ? 's' : ''} applied
            </span>
          )}
          {activeCount > 0 && (
            <button onClick={resetAll} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1">
              <X size={12} /> Reset
            </button>
          )}
          <button
            onClick={() => setApplied(true)}
            aria-label="Apply filters"
            className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5
              ${applied
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
          >
            {applied ? (<><Check size={12} /> Applied</>) : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
