import {
  LayoutDashboard, Activity, DollarSign, HeartPulse,
  AlertTriangle, Download,
} from 'lucide-react';
import type { NavSection } from '../../types';

const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',     label: 'Overview',              icon: <LayoutDashboard size={18} /> },
  { id: 'utilization',  label: 'Utilization',           icon: <Activity size={18} /> },
  { id: 'cost-drivers', label: 'Cost Drivers',          icon: <DollarSign size={18} /> },
  { id: 'clinical',     label: 'Clinical & Adherence',  icon: <HeartPulse size={18} /> },
  { id: 'outliers',     label: 'Outliers & Waste',      icon: <AlertTriangle size={18} /> },
  { id: 'exports',      label: 'Exports',               icon: <Download size={18} /> },
];

interface Props {
  active: NavSection;
  onChange: (section: NavSection) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="w-56 bg-white border-r border-gray-200 shrink-0 hidden lg:flex flex-col py-3">
      {navItems.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition
              ${isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className={isActive ? 'text-brand-600' : 'text-gray-400'}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export { navItems };
