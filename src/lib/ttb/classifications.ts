/**
 * Shared TTB operation classifications used to map operations onto official
 * TTB report lines. These values match CHECK constraints on the
 * public.operations table (see migration adding classification fields).
 */

export type ProductionSource = 'distillation' | 'redistillation';
export type TransferDestination =
  | 'storage'
  | 'processing'
  | 'other_bonded'
  | 'export'
  | 'research'
  | 'other';
export type LossReason =
  | 'evaporation'
  | 'leakage'
  | 'casualty'
  | 'spill'
  | 'destroyed'
  | 'theft'
  | 'other';
export type KindOfSpirit =
  | 'whisky'
  | 'brandy'
  | 'rum'
  | 'gin'
  | 'vodka'
  | 'alcohol_spirits'
  | 'other';

export const PRODUCTION_SOURCES: { value: ProductionSource; label: string }[] = [
  { value: 'distillation', label: 'Produced by original distillation' },
  { value: 'redistillation', label: 'Produced by redistillation' },
];

export const TRANSFER_DESTINATIONS: { value: TransferDestination; label: string }[] = [
  { value: 'storage', label: 'Transferred to storage account' },
  { value: 'processing', label: 'Transferred to processing account' },
  { value: 'other_bonded', label: 'Transferred to other bonded premises' },
  { value: 'export', label: 'Withdrawn for export' },
  { value: 'research', label: 'Withdrawn for research / testing' },
  { value: 'other', label: 'Other authorized removal' },
];

export const LOSS_REASONS: { value: LossReason; label: string }[] = [
  { value: 'evaporation', label: 'Evaporation' },
  { value: 'leakage', label: 'Leakage' },
  { value: 'casualty', label: 'Casualty (fire, etc.)' },
  { value: 'spill', label: 'Spill' },
  { value: 'destroyed', label: 'Destroyed on premises' },
  { value: 'theft', label: 'Theft' },
  { value: 'other', label: 'Other' },
];

export const KINDS_OF_SPIRIT: { value: KindOfSpirit; label: string }[] = [
  { value: 'whisky', label: 'Whisky' },
  { value: 'brandy', label: 'Brandy' },
  { value: 'rum', label: 'Rum' },
  { value: 'gin', label: 'Gin' },
  { value: 'vodka', label: 'Vodka' },
  { value: 'alcohol_spirits', label: 'Alcohol / Neutral Spirits' },
  { value: 'other', label: 'Other' },
];

export function classificationLabel<T extends { value: string; label: string }>(
  options: T[],
  value: string | null | undefined,
): string {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label ?? value;
}
