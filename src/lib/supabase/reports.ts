import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Report5110_40 = Database['public']['Tables']['reports_5110_40']['Row'];
type Report5110_40Insert = Database['public']['Tables']['reports_5110_40']['Insert'];
type Report5110_40Update = Database['public']['Tables']['reports_5110_40']['Update'];

type Report5110_28 = Database['public']['Tables']['reports_5110_28']['Row'];
type Report5110_28Insert = Database['public']['Tables']['reports_5110_28']['Insert'];
type Report5110_28Update = Database['public']['Tables']['reports_5110_28']['Update'];

type Report5110_11 = Database['public']['Tables']['reports_5110_11']['Row'];
type Report5110_11Insert = Database['public']['Tables']['reports_5110_11']['Insert'];
type Report5110_11Update = Database['public']['Tables']['reports_5110_11']['Update'];

export const reports5110_40Service = {
  async getAll(organizationId: string): Promise<Report5110_40[]> {
    const { data, error } = await supabase
      .from('reports_5110_40')
      .select('*')
      .eq('organization_id', organizationId)
      .order('report_period', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByPeriod(organizationId: string, reportPeriod: string): Promise<Report5110_40 | null> {
    const { data, error } = await supabase
      .from('reports_5110_40')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('report_period', reportPeriod)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(report: Omit<Report5110_40Insert, 'id' | 'created_at' | 'updated_at'>): Promise<Report5110_40> {
    const { data, error } = await supabase
      .from('reports_5110_40')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Report5110_40Update): Promise<Report5110_40> {
    const { data, error } = await supabase
      .from('reports_5110_40')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports_5110_40')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const reports5110_28Service = {
  async getAll(organizationId: string): Promise<Report5110_28[]> {
    const { data, error } = await supabase
      .from('reports_5110_28')
      .select('*')
      .eq('organization_id', organizationId)
      .order('report_period', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByPeriod(organizationId: string, reportPeriod: string): Promise<Report5110_28 | null> {
    const { data, error } = await supabase
      .from('reports_5110_28')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('report_period', reportPeriod)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(report: Omit<Report5110_28Insert, 'id' | 'created_at' | 'updated_at'>): Promise<Report5110_28> {
    const { data, error } = await supabase
      .from('reports_5110_28')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Report5110_28Update): Promise<Report5110_28> {
    const { data, error } = await supabase
      .from('reports_5110_28')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports_5110_28')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const reports5110_11Service = {
  async getAll(organizationId: string): Promise<Report5110_11[]> {
    const { data, error } = await supabase
      .from('reports_5110_11')
      .select('*')
      .eq('organization_id', organizationId)
      .order('report_period', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByPeriod(organizationId: string, reportPeriod: string): Promise<Report5110_11 | null> {
    const { data, error } = await supabase
      .from('reports_5110_11')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('report_period', reportPeriod)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(report: Omit<Report5110_11Insert, 'id' | 'created_at' | 'updated_at'>): Promise<Report5110_11> {
    const { data, error } = await supabase
      .from('reports_5110_11')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Report5110_11Update): Promise<Report5110_11> {
    const { data, error } = await supabase
      .from('reports_5110_11')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports_5110_11')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
