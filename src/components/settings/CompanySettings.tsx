import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Building2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Organization = Database['public']['Tables']['organizations']['Row'];

/**
 * Supabase-backed TTB filing settings. Replaces the legacy localStorage-based
 * CompanySettings. Exposes every organization-level field required to populate
 * the header and signature blocks on TTB Forms 5110.40/28/11.
 */
export const CompanySettings = () => {
  const { user } = useSupabaseAuth();
  const orgId = user?.organization?.id;
  const [org, setOrg] = useState<Partial<Organization>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).maybeSingle();
      if (error) toast.error(error.message);
      else if (data) setOrg(data);
      setLoading(false);
    })();
  }, [orgId]);

  const set = <K extends keyof Organization>(key: K, value: Organization[K] | string) => {
    setOrg((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    const payload = {
      name: org.name || '',
      legal_name: org.legal_name || null,
      type: (org.type as Organization['type']) || 'distillery',
      dsp_number: org.dsp_number || null,
      permit_number: org.permit_number || null,
      ein: org.ein || null,
      address: org.address || null,
      city: org.city || null,
      state: org.state || null,
      zip_code: org.zip_code || null,
      county: org.county || null,
      phone: org.phone || null,
      contact_name: org.contact_name || null,
      contact_email: org.contact_email || null,
      signer_name: org.signer_name || null,
      signer_title: org.signer_title || null,
    };
    const { error } = await supabase.from('organizations').update(payload).eq('id', orgId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('TTB filing information saved');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading organization…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />TTB Filing Information</CardTitle>
        <CardDescription>Values used to populate the header and signature blocks on official TTB forms.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input value={org.name ?? ''} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Legal proprietor name (as on TTB permit)</Label>
            <Input value={org.legal_name ?? ''} onChange={(e) => set('legal_name', e.target.value)} placeholder="Legal entity name" />
          </div>
          <div className="space-y-2">
            <Label>Business type</Label>
            <Select value={(org.type as string) ?? 'distillery'} onValueChange={(v) => set('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="distillery">Distillery</SelectItem>
                <SelectItem value="winery">Winery</SelectItem>
                <SelectItem value="brewery">Brewery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>DSP plant number</Label>
            <Input value={org.dsp_number ?? ''} onChange={(e) => set('dsp_number', e.target.value)} placeholder="e.g. DSP-KY-20001" />
          </div>
          <div className="space-y-2">
            <Label>TTB permit number</Label>
            <Input value={org.permit_number ?? ''} onChange={(e) => set('permit_number', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>EIN</Label>
            <Input value={org.ein ?? ''} onChange={(e) => set('ein', e.target.value)} placeholder="XX-XXXXXXX" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-medium">Premises address</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Street address</Label>
              <Input value={org.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="space-y-2"><Label>City</Label><Input value={org.city ?? ''} onChange={(e) => set('city', e.target.value)} /></div>
            <div className="space-y-2"><Label>State</Label><Input value={org.state ?? ''} onChange={(e) => set('state', e.target.value)} /></div>
            <div className="space-y-2"><Label>ZIP code</Label><Input value={org.zip_code ?? ''} onChange={(e) => set('zip_code', e.target.value)} /></div>
            <div className="space-y-2"><Label>County</Label><Input value={org.county ?? ''} onChange={(e) => set('county', e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={org.phone ?? ''} onChange={(e) => set('phone', e.target.value)} /></div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-medium">Reporting contact &amp; signer</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Contact name</Label><Input value={org.contact_name ?? ''} onChange={(e) => set('contact_name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Contact email</Label><Input type="email" value={org.contact_email ?? ''} onChange={(e) => set('contact_email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Signer name</Label><Input value={org.signer_name ?? ''} onChange={(e) => set('signer_name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Signer title</Label><Input value={org.signer_title ?? ''} onChange={(e) => set('signer_title', e.target.value)} placeholder="e.g. Distiller / Proprietor" /></div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
