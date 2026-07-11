import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Report data interfaces
export interface ReportFormData {
  reportPeriod: Date;
  registrationNumber: string;
  proprietorName: string;
  proprietorAddress: string;
  einNumber: string;
  reportType: 'original' | 'amended' | 'final';
}

export interface Report5110_40Inventory {
  beginningInventory: number;
  production: number;
  transferIn: number;
  bottling: number;
  transferOut: number;
  loss: number;
  endingInventory: number;
}

export interface Report5110_28Inventory {
  beginningInventory: number;
  bottling: number;
  taxWithdrawal: number;
  endingInventory: number;
}

export interface Report5110_11Inventory {
  beginningInventory: number;
  production: number;
  transferIn: number;
  bottling: number;
  loss: number;
  endingInventory: number;
}

export interface Report5110_40Data extends ReportFormData {
  formType: '5110-40';
  inventory: Report5110_40Inventory;
  updatedAt: Date;
}
export interface Report5110_28Data extends ReportFormData {
  formType: '5110-28';
  inventory: Report5110_28Inventory;
  updatedAt: Date;
}
export interface Report5110_11Data extends ReportFormData {
  formType: '5110-11';
  inventory: Report5110_11Inventory;
  updatedAt: Date;
}

export type ReportData = Report5110_40Data | Report5110_28Data | Report5110_11Data;

const TABLE_BY_FORM = {
  '5110-40': 'reports_5110_40',
  '5110-28': 'reports_5110_28',
  '5110-11': 'reports_5110_11',
} as const;

type FormType = keyof typeof TABLE_BY_FORM;

function periodKey(date: Date): string {
  return format(startOfMonth(date), 'yyyy-MM');
}

function sumOps(ops: { type: string; proof_gallons: number | string }[], type: string): number {
  return ops
    .filter((o) => o.type === type)
    .reduce((sum, o) => sum + Number(o.proof_gallons || 0), 0);
}

async function fetchMonthOperations(organizationId: string, reportPeriod: Date) {
  const start = startOfMonth(reportPeriod).toISOString();
  const end = endOfMonth(reportPeriod).toISOString();
  const { data, error } = await supabase
    .from('operations')
    .select('type, proof_gallons, operation_date')
    .eq('organization_id', organizationId)
    .gte('operation_date', start)
    .lte('operation_date', end);
  if (error) throw error;
  return data ?? [];
}

async function fetchPersistedReport(
  organizationId: string,
  formType: FormType,
  reportPeriod: Date,
) {
  const { data, error } = await supabase
    .from(TABLE_BY_FORM[formType])
    .select('*')
    .eq('organization_id', organizationId)
    .eq('report_period', periodKey(reportPeriod))
    .maybeSingle();
  if (error) throw error;
  return data as
    | { id: string; data: any; updated_at: string; report_period: string }
    | null;
}

async function calculateInventory(
  organizationId: string,
  reportPeriod: Date,
  formType: FormType,
): Promise<Report5110_40Inventory | Report5110_28Inventory | Report5110_11Inventory> {
  const monthOps = await fetchMonthOperations(organizationId, reportPeriod);

  const production = sumOps(monthOps, 'production');
  const transferIn = sumOps(monthOps, 'transfer_in');
  const bottling = sumOps(monthOps, 'bottling');
  const transferOut = sumOps(monthOps, 'transfer_out');
  const taxWithdrawal = sumOps(monthOps, 'tax_withdrawal');
  const loss = sumOps(monthOps, 'loss');

  const previous = await fetchPersistedReport(organizationId, formType, subMonths(reportPeriod, 1));
  const beginningInventory = Number(previous?.data?.inventory?.endingInventory ?? 0);

  switch (formType) {
    case '5110-40':
      return {
        beginningInventory,
        production,
        transferIn,
        bottling,
        transferOut,
        loss,
        endingInventory: beginningInventory + production + transferIn - bottling - transferOut - loss,
      };
    case '5110-28':
      return {
        beginningInventory,
        bottling,
        taxWithdrawal,
        endingInventory: beginningInventory + bottling - taxWithdrawal,
      };
    case '5110-11':
      return {
        beginningInventory,
        production,
        transferIn,
        bottling,
        loss,
        endingInventory: beginningInventory + production + transferIn - bottling - loss,
      };
  }
}

function defaultFormFields(): Omit<ReportFormData, 'reportPeriod'> {
  return {
    registrationNumber: '',
    proprietorName: '',
    proprietorAddress: '',
    einNumber: '',
    reportType: 'original',
  };
}

function rowToReport<T extends ReportData>(
  formType: T['formType'],
  reportPeriod: Date,
  row: { data: any; updated_at: string } | null,
  inventory: any,
): T {
  const stored = (row?.data as Partial<ReportFormData>) ?? {};
  const base: ReportFormData & { updatedAt: Date; formType: T['formType']; inventory: any } = {
    reportPeriod: startOfMonth(reportPeriod),
    registrationNumber: stored.registrationNumber ?? '',
    proprietorName: stored.proprietorName ?? '',
    proprietorAddress: stored.proprietorAddress ?? '',
    einNumber: stored.einNumber ?? '',
    reportType: stored.reportType ?? 'original',
    updatedAt: row?.updated_at ? new Date(row.updated_at) : new Date(),
    formType,
    inventory,
  };
  return base as unknown as T;
}

/**
 * Load or create a report for a given month. Inventory is always recalculated
 * from the organization's operations. Form-level fields (proprietor name, EIN,
 * etc.) are persisted per organization+month.
 */
export async function getOrCreateReport<T extends ReportData>(
  organizationId: string,
  userId: string,
  formType: T['formType'],
  reportPeriod: Date,
): Promise<T> {
  if (!organizationId) throw new Error('No organization is associated with this account.');

  const inventory = await calculateInventory(organizationId, reportPeriod, formType);
  const existing = await fetchPersistedReport(organizationId, formType, reportPeriod);

  const nextData = {
    ...(existing?.data ?? defaultFormFields()),
    inventory,
  };

  const { data: upserted, error } = await supabase
    .from(TABLE_BY_FORM[formType])
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        report_period: periodKey(reportPeriod),
        data: nextData,
      },
      { onConflict: 'organization_id,report_period' },
    )
    .select()
    .single();
  if (error) throw error;

  return rowToReport(formType, reportPeriod, upserted as any, inventory);
}

/**
 * Persist edits to the report form fields (registration number, proprietor, etc.).
 * Inventory is not written from the client — it is recalculated on load.
 */
export async function saveReportFields<T extends ReportData>(
  organizationId: string,
  userId: string,
  formType: T['formType'],
  reportPeriod: Date,
  fields: Partial<ReportFormData>,
): Promise<T> {
  if (!organizationId) throw new Error('No organization is associated with this account.');

  const existing = await fetchPersistedReport(organizationId, formType, reportPeriod);
  const inventory = existing?.data?.inventory ?? (await calculateInventory(organizationId, reportPeriod, formType));

  const nextData = {
    ...(existing?.data ?? defaultFormFields()),
    ...fields,
    inventory,
  };

  const { data: upserted, error } = await supabase
    .from(TABLE_BY_FORM[formType])
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        report_period: periodKey(reportPeriod),
        data: nextData,
      },
      { onConflict: 'organization_id,report_period' },
    )
    .select()
    .single();
  if (error) throw error;

  return rowToReport(formType, reportPeriod, upserted as any, inventory);
}
