import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Spirit = Database['public']['Tables']['spirits']['Row'];
type SpiritInsert = Database['public']['Tables']['spirits']['Insert'];
type SpiritUpdate = Database['public']['Tables']['spirits']['Update'];

export const spiritsService = {
  async getAll(organizationId: string): Promise<Spirit[]> {
    const { data, error } = await supabase
      .from('spirits')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Spirit | null> {
    const { data, error } = await supabase
      .from('spirits')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(spirit: Omit<SpiritInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Spirit> {
    const { data, error } = await supabase
      .from('spirits')
      .insert(spirit)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: SpiritUpdate): Promise<Spirit> {
    const { data, error } = await supabase
      .from('spirits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('spirits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
