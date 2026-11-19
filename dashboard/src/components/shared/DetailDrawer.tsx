import { X, AlertCircle } from 'lucide-react';
import type { ClaimDetail } from '../../types';

interface Props {
  claim: ClaimDetail | null;
  open: boolean;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function DetailDrawer({ claim, open, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} aria-hidden="true" />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Claim detail"
        aria-hidden={!open}
      >
        {claim && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Claim Detail</h3>
                <p className="text-xs text-gray-400 mt-0.5">{claim.claimId}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition" aria-label="Close drawer">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin">
              {/* Claim Info */}
              <section>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Claim Info</h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-gray-400 text-xs">Member</dt>
                    <dd className="font-medium">{claim.memberId}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs">Date of Service</dt>
                    <dd className="font-medium">{claim.dateOfService}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs">NDC</dt>
                    <dd className="font-mono text-xs">{claim.ndc}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs">Drug</dt>
                    <dd className="font-medium">{claim.drugName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs">Pharmacy</dt>
                    <dd className="font-medium">{claim.pharmacy}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs">Prescriber</dt>
                    <dd className="font-medium">{claim.prescriber}</dd>
                  </div>
                </dl>
              </section>

              {/* Financials */}
              <section>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Financials</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <Row label="Ingredient Cost" value={fmt(claim.ingredientCost)} />
                  <Row label="Dispensing Fee"   value={fmt(claim.dispensingFee)} />
                  <Row label="Member Copay"     value={fmt(claim.memberCopay)} />
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Row label="Plan Paid" value={fmt(claim.planPaid)} bold />
                  </div>
                </div>
              </section>

              {/* Flags */}
              <section>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Utilization Flags</h4>
                <div className="space-y-2">
                  {claim.flags.map((flag) => (
                    <div key={flag} className="flex items-start gap-2 text-sm bg-amber-50 text-amber-800 rounded-lg px-3 py-2">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-gray-900' : 'font-medium tabular-nums'}>{value}</span>
    </div>
  );
}
