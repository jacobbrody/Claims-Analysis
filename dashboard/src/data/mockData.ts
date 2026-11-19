import type {
  KpiMetric, TrendPoint, CategoryShare, TopDrug, PlanPerformance,
  UtilizationByAge, ChannelMix, TherapeuticClassCost, TopPrescriber,
  AdherenceCohort, HighCostOutlier, DaysSupplyAnomaly, ClaimDetail,
} from '../types';

// ── Overview KPIs ────────────────────────────────────────────────
export const overviewKpis: KpiMetric[] = [
  { label: 'Total Rx Spend (PMPM)', value: '$342.18', change: 4.2, prefix: '$' },
  { label: 'Total Claims',          value: '1,284,310', change: -1.8 },
  { label: 'Generic Fill Rate',     value: '89.3%',     change: 1.2, suffix: '%' },
  { label: 'Specialty % of Spend',  value: '52.1%',     change: 3.7, suffix: '%' },
];

// ── Trend chart ──────────────────────────────────────────────────
export const trendData: TrendPoint[] = [
  { month: 'Jul',  spend: 28400000, claims: 102300 },
  { month: 'Aug',  spend: 29100000, claims: 105100 },
  { month: 'Sep',  spend: 27800000, claims: 99800  },
  { month: 'Oct',  spend: 30500000, claims: 108400 },
  { month: 'Nov',  spend: 31200000, claims: 110200 },
  { month: 'Dec',  spend: 29800000, claims: 104600 },
  { month: 'Jan',  spend: 32100000, claims: 112500 },
  { month: 'Feb',  spend: 31600000, claims: 109800 },
  { month: 'Mar',  spend: 33400000, claims: 115200 },
  { month: 'Apr',  spend: 34200000, claims: 118300 },
  { month: 'May',  spend: 33800000, claims: 116700 },
  { month: 'Jun',  spend: 35100000, claims: 121400 },
];

// ── Category share ──────────────────────────────────────────────
export const categoryData: CategoryShare[] = [
  { name: 'GLP-1 / Diabetes',  spend: 42, claims: 12, color: '#3b82f6' },
  { name: 'Oncology',          spend: 18, claims: 3,  color: '#ef4444' },
  { name: 'Autoimmune',        spend: 14, claims: 5,  color: '#f59e0b' },
  { name: 'Cardiovascular',    spend: 9,  claims: 22, color: '#10b981' },
  { name: 'HIV / Antivirals',  spend: 7,  claims: 4,  color: '#8b5cf6' },
  { name: 'Mental Health',     spend: 5,  claims: 18, color: '#ec4899' },
  { name: 'Other',             spend: 5,  claims: 36, color: '#6b7280' },
];

// ── Top drugs ───────────────────────────────────────────────────
export const topDrugs: TopDrug[] = [
  { rank: 1,  drugName: 'Ozempic 1mg',        ndc: '00169-4132-12', totalSpend: 8420000,  claims: 12400, members: 4200,  trend: 18.3 },
  { rank: 2,  drugName: 'Humira 40mg',         ndc: '00074-3799-02', totalSpend: 6890000,  claims: 3200,  members: 1800,  trend: -4.2 },
  { rank: 3,  drugName: 'Keytruda 100mg',      ndc: '00006-3026-02', totalSpend: 5340000,  claims: 890,   members: 420,   trend: 12.1 },
  { rank: 4,  drugName: 'Stelara 90mg',        ndc: '57894-0055-02', totalSpend: 4780000,  claims: 1450,  members: 980,   trend: 6.8  },
  { rank: 5,  drugName: 'Revlimid 25mg',       ndc: '59572-0410-00', totalSpend: 4210000,  claims: 640,   members: 310,   trend: -1.5 },
  { rank: 6,  drugName: 'Eliquis 5mg',         ndc: '00003-0893-21', totalSpend: 3890000,  claims: 18200, members: 8400,  trend: 7.2  },
  { rank: 7,  drugName: 'Mounjaro 5mg',        ndc: '00002-1409-80', totalSpend: 3540000,  claims: 5600,  members: 2100,  trend: 142.5 },
  { rank: 8,  drugName: 'Enbrel 50mg',         ndc: '58406-0435-04', totalSpend: 3120000,  claims: 2100,  members: 1200,  trend: -8.3 },
  { rank: 9,  drugName: 'Xarelto 20mg',        ndc: '50458-0580-30', totalSpend: 2980000,  claims: 14300, members: 6800,  trend: 2.1  },
  { rank: 10, drugName: 'Jardiance 25mg',       ndc: '00597-0153-30', totalSpend: 2640000,  claims: 16800, members: 7200,  trend: 9.4  },
];

// ── Plan performance ────────────────────────────────────────────
export const planPerformance: PlanPerformance[] = [
  { planName: 'Acme Corp',          members: 12400, pmpm: 382.10, genericFillRate: 87.2, specialtySpendPct: 54.1, adherenceScore: 78.3 },
  { planName: 'Beta Industries',    members: 8200,  pmpm: 298.40, genericFillRate: 91.5, specialtySpendPct: 42.8, adherenceScore: 82.1 },
  { planName: 'Gamma Health',       members: 15600, pmpm: 356.70, genericFillRate: 88.9, specialtySpendPct: 51.2, adherenceScore: 75.6 },
  { planName: 'Delta Group',        members: 6800,  pmpm: 412.30, genericFillRate: 84.3, specialtySpendPct: 61.4, adherenceScore: 71.2 },
  { planName: 'Epsilon Partners',   members: 9400,  pmpm: 318.90, genericFillRate: 92.1, specialtySpendPct: 39.5, adherenceScore: 84.7 },
  { planName: 'Zeta Corp',          members: 11200, pmpm: 345.60, genericFillRate: 89.7, specialtySpendPct: 48.3, adherenceScore: 79.8 },
];

// ── Utilization ─────────────────────────────────────────────────
export const utilizationKpis: KpiMetric[] = [
  { label: 'Claims per 1,000',      value: '14,280', change: 2.1 },
  { label: '90-Day Supply Rate',     value: '34.2%',  change: 5.8 },
  { label: 'New Starts vs Refills',  value: '1 : 3.8', change: -0.4 },
];

export const utilizationByAge: UtilizationByAge[] = [
  { ageBand: '18–25', claimsPer1000: 6200 },
  { ageBand: '26–35', claimsPer1000: 8400 },
  { ageBand: '36–45', claimsPer1000: 11800 },
  { ageBand: '46–55', claimsPer1000: 15600 },
  { ageBand: '56–64', claimsPer1000: 19200 },
  { ageBand: '65+',   claimsPer1000: 24100 },
];

export const channelMix: ChannelMix[] = [
  { plan: 'Acme Corp',        retail: 62, mail: 28, specialty: 10 },
  { plan: 'Beta Industries',  retail: 58, mail: 32, specialty: 10 },
  { plan: 'Gamma Health',     retail: 65, mail: 22, specialty: 13 },
  { plan: 'Delta Group',      retail: 52, mail: 26, specialty: 22 },
  { plan: 'Epsilon Partners', retail: 60, mail: 30, specialty: 10 },
  { plan: 'Zeta Corp',        retail: 64, mail: 25, specialty: 11 },
];

// ── Cost Drivers ────────────────────────────────────────────────
export const therapeuticClassCosts: TherapeuticClassCost[] = [
  { className: 'GLP-1 / Diabetes',  pmpm: 86.40, totalSpend: 12800000 },
  { className: 'Oncology',          pmpm: 48.20, totalSpend: 7140000 },
  { className: 'Autoimmune',        pmpm: 38.90, totalSpend: 5760000 },
  { className: 'Cardiovascular',    pmpm: 28.10, totalSpend: 4160000 },
  { className: 'HIV / Antivirals',  pmpm: 22.50, totalSpend: 3330000 },
  { className: 'Mental Health',     pmpm: 18.30, totalSpend: 2710000 },
  { className: 'Respiratory',       pmpm: 14.80, totalSpend: 2190000 },
  { className: 'Pain Management',   pmpm: 12.40, totalSpend: 1840000 },
];

export const topPrescribers: TopPrescriber[] = [
  { name: 'Dr. Sarah Chen',       specialty: 'Oncology',       region: 'Northeast', totalSpend: 2840000, claims: 420,  patients: 180 },
  { name: 'Dr. James Patel',      specialty: 'Rheumatology',   region: 'Southeast', totalSpend: 2120000, claims: 680,  patients: 310 },
  { name: 'Dr. Maria Rodriguez',  specialty: 'Endocrinology',  region: 'West',      totalSpend: 1890000, claims: 1240, patients: 520 },
  { name: 'Dr. Robert Kim',       specialty: 'Oncology',       region: 'Midwest',   totalSpend: 1760000, claims: 380,  patients: 160 },
  { name: 'Dr. Emily Watson',     specialty: 'Gastroenterology', region: 'Northeast', totalSpend: 1540000, claims: 890,  patients: 420 },
  { name: 'Dr. Michael Brooks',   specialty: 'Dermatology',    region: 'Southeast', totalSpend: 1380000, claims: 560,  patients: 280 },
  { name: 'Dr. Lisa Thompson',    specialty: 'Neurology',      region: 'West',      totalSpend: 1210000, claims: 440,  patients: 210 },
  { name: 'Dr. David Park',       specialty: 'Cardiology',     region: 'Midwest',   totalSpend: 1080000, claims: 1620, patients: 740 },
];

// ── Clinical & Adherence ────────────────────────────────────────
export const adherenceKpis: KpiMetric[] = [
  { label: 'PDC ≥ 80% Diabetes',      value: '72.4%', change: 1.8 },
  { label: 'PDC ≥ 80% Hypertension',  value: '78.1%', change: -0.6 },
  { label: 'PDC ≥ 80% Statins',       value: '74.8%', change: 2.3 },
];

export const adherenceCohorts: AdherenceCohort[] = [
  { condition: 'Diabetes (Type 2)',  members: 8400,  adherencePct: 72.4, gapsInTherapy: 2180, potentialSavings: 1240000 },
  { condition: 'Hypertension',       members: 12600, adherencePct: 78.1, gapsInTherapy: 2770, potentialSavings: 890000 },
  { condition: 'Hyperlipidemia',     members: 11200, adherencePct: 74.8, gapsInTherapy: 2820, potentialSavings: 1080000 },
  { condition: 'Asthma / COPD',      members: 4200,  adherencePct: 68.3, gapsInTherapy: 1330, potentialSavings: 620000 },
  { condition: 'Depression',         members: 6800,  adherencePct: 61.2, gapsInTherapy: 2640, potentialSavings: 480000 },
  { condition: 'Rheumatoid Arthritis', members: 1800, adherencePct: 81.5, gapsInTherapy: 330, potentialSavings: 380000 },
];

// ── Outliers & Waste ────────────────────────────────────────────
export const highCostOutliers: HighCostOutlier[] = [
  { memberId: 'MEM-***4821', drug: 'Revlimid 25mg',    cost30Day: 18420, claims: 12, prescriber: 'Dr. S. Chen' },
  { memberId: 'MEM-***7293', drug: 'Keytruda 100mg',   cost30Day: 15680, claims: 8,  prescriber: 'Dr. R. Kim' },
  { memberId: 'MEM-***1056', drug: 'Tecfidera 240mg',  cost30Day: 9240,  claims: 11, prescriber: 'Dr. L. Thompson' },
  { memberId: 'MEM-***3389', drug: 'Humira 40mg',      cost30Day: 7120,  claims: 14, prescriber: 'Dr. J. Patel' },
  { memberId: 'MEM-***8614', drug: 'Stelara 90mg',     cost30Day: 6890,  claims: 6,  prescriber: 'Dr. E. Watson' },
  { memberId: 'MEM-***2047', drug: 'Enbrel 50mg',      cost30Day: 6340,  claims: 13, prescriber: 'Dr. M. Brooks' },
];

export const daysSupplyAnomalies: DaysSupplyAnomaly[] = [
  { flagType: 'Excess quantity',     ndc: '00169-4132-12', drugName: 'Ozempic 1mg',   avgQty: 4.2, normQty: 1.0, plansImpacted: 3 },
  { flagType: 'Short fills',         ndc: '00074-3799-02', drugName: 'Humira 40mg',   avgQty: 1.0, normQty: 2.0, plansImpacted: 2 },
  { flagType: 'Overlapping fills',   ndc: '00003-0893-21', drugName: 'Eliquis 5mg',   avgQty: 180, normQty: 60,  plansImpacted: 4 },
  { flagType: 'Early refill',        ndc: '50458-0580-30', drugName: 'Xarelto 20mg',  avgQty: 90,  normQty: 30,  plansImpacted: 2 },
  { flagType: 'Excess quantity',     ndc: '59572-0410-00', drugName: 'Revlimid 25mg', avgQty: 42,  normQty: 21,  plansImpacted: 1 },
];

// ── Claim detail (for drawer) ───────────────────────────────────
export const sampleClaimDetail: ClaimDetail = {
  claimId: 'CLM-2024-0847291',
  memberId: 'MEM-***4821',
  ndc: '59572-0410-00',
  drugName: 'Revlimid 25mg Capsule',
  dateOfService: '2024-06-15',
  pharmacy: 'BrightSpring Specialty Pharmacy',
  prescriber: 'Dr. Sarah Chen, MD – Oncology',
  ingredientCost: 17842.00,
  dispensingFee: 2.50,
  memberCopay: 150.00,
  planPaid: 17694.50,
  flags: ['Above class average cost', 'High-cost specialty', 'Prior authorization on file'],
};
