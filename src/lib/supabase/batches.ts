import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Batch = Database['public']['Tables']['batches']['Row'];
type BatchInsert = Database['public']['Tables']['batches']['Insert'];
type BatchUpdate = Database['public']['Tables']['batches']['Update'];

export const batchesService = {
  async getAll(organizationId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('organization_id', organizationId)
      .order('production_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Batch | null> {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getBySpiritId(spiritId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('spirit_id', spiritId)
      .order('production_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(batch: Omit<BatchInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .insert(batch)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: BatchUpdate): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
