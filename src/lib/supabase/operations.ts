import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Operation = Database['public']['Tables']['operations']['Row'];
type OperationInsert = Database['public']['Tables']['operations']['Insert'];
type OperationUpdate = Database['public']['Tables']['operations']['Update'];

export const operationsService = {
  async getAll(organizationId: string): Promise<Operation[]> {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('operation_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Operation | null> {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByDateRange(organizationId: string, startDate: Date, endDate: Date): Promise<Operation[]> {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('operation_date', startDate.toISOString())
      .lte('operation_date', endDate.toISOString())
      .order('operation_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(operation: Omit<OperationInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Operation> {
    const { data, error } = await supabase
      .from('operations')
      .insert(operation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: OperationUpdate): Promise<Operation> {
    const { data, error } = await supabase
      .from('operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
