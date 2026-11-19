export interface KpiMetric {
  label: string;
  value: string;
  change: number; // percentage, positive = improvement
  prefix?: string;
  suffix?: string;
}

export interface TrendPoint {
  month: string;
  spend: number;
  claims: number;
}

export interface CategoryShare {
  name: string;
  spend: number;
  claims: number;
  color: string;
}

export interface TopDrug {
  rank: number;
  drugName: string;
  ndc: string;
  totalSpend: number;
  claims: number;
  members: number;
  trend: number;
}

export interface PlanPerformance {
  planName: string;
  members: number;
  pmpm: number;
  genericFillRate: number;
  specialtySpendPct: number;
  adherenceScore: number;
}

export interface UtilizationByAge {
  ageBand: string;
  claimsPer1000: number;
}

export interface ChannelMix {
  plan: string;
  retail: number;
  mail: number;
  specialty: number;
}

export interface TherapeuticClassCost {
  className: string;
  pmpm: number;
  totalSpend: number;
}

export interface TopPrescriber {
  name: string;
  specialty: string;
  region: string;
  totalSpend: number;
  claims: number;
  patients: number;
}

export interface AdherenceCohort {
  condition: string;
  members: number;
  adherencePct: number;
  gapsInTherapy: number;
  potentialSavings: number;
}

export interface HighCostOutlier {
  memberId: string;
  drug: string;
  cost30Day: number;
  claims: number;
  prescriber: string;
}

export interface DaysSupplyAnomaly {
  flagType: string;
  ndc: string;
  drugName: string;
  avgQty: number;
  normQty: number;
  plansImpacted: number;
}

export interface ClaimDetail {
  claimId: string;
  memberId: string;
  ndc: string;
  drugName: string;
  dateOfService: string;
  pharmacy: string;
  prescriber: string;
  ingredientCost: number;
  dispensingFee: number;
  memberCopay: number;
  planPaid: number;
  flags: string[];
}

export type NavSection =
  | 'overview'
  | 'utilization'
  | 'cost-drivers'
  | 'clinical'
  | 'outliers'
  | 'exports';
