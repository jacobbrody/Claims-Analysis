import { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FilterBar from './components/layout/FilterBar';
import DetailDrawer from './components/shared/DetailDrawer';
import Overview from './components/pages/Overview';
import Utilization from './components/pages/Utilization';
import CostDrivers from './components/pages/CostDrivers';
import ClinicalAdherence from './components/pages/ClinicalAdherence';
import OutliersWaste from './components/pages/OutliersWaste';
import Exports from './components/pages/Exports';
import { navItems } from './components/layout/Sidebar';
import type { NavSection, ClaimDetail } from './types';

const sectionTitles: Record<NavSection, string> = {
  overview: 'Overview',
  utilization: 'Utilization',
  'cost-drivers': 'Cost Drivers',
  clinical: 'Clinical & Adherence',
  outliers: 'Outliers & Waste',
  exports: 'Exports',
};

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClaim, setDrawerClaim] = useState<ClaimDetail | null>(null);

  const openDrawer = useCallback((claim: ClaimDetail) => {
    setDrawerClaim(claim);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerClaim(null);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':     return <Overview onOpenDrawer={openDrawer} />;
      case 'utilization':  return <Utilization />;
      case 'cost-drivers': return <CostDrivers onOpenDrawer={openDrawer} />;
      case 'clinical':     return <ClinicalAdherence onOpenDrawer={openDrawer} />;
      case 'outliers':     return <OutliersWaste onOpenDrawer={openDrawer} />;
      case 'exports':      return <Exports />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} onChange={setActiveSection} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <FilterBar />

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-1 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition
                  ${item.id === activeSection
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-5">{sectionTitles[activeSection]}</h2>
            {renderSection()}
          </main>
        </div>
      </div>

      <DetailDrawer claim={drawerClaim} open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
