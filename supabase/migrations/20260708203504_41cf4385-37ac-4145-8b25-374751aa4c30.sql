
-- spirits
CREATE TABLE public.spirits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  default_proof NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spirits TO authenticated;
GRANT ALL ON public.spirits TO service_role;
ALTER TABLE public.spirits ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER spirits_updated_at BEFORE UPDATE ON public.spirits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Org members access spirits" ON public.spirits
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id))
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- batches
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  spirit_id UUID NOT NULL REFERENCES public.spirits(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  production_date TIMESTAMPTZ NOT NULL,
  proof NUMERIC NOT NULL DEFAULT 0,
  original_liters NUMERIC NOT NULL DEFAULT 0,
  current_liters NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_production',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.batches TO authenticated;
GRANT ALL ON public.batches TO service_role;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER batches_updated_at BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Org members access batches" ON public.batches
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id))
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- operations
CREATE TABLE public.operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operation_date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  spirit_id UUID REFERENCES public.spirits(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  proof NUMERIC,
  liters NUMERIC NOT NULL DEFAULT 0,
  proof_gallons NUMERIC NOT NULL DEFAULT 0,
  bottles INTEGER,
  bottle_size TEXT,
  destination_or_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operations TO authenticated;
GRANT ALL ON public.operations TO service_role;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER operations_updated_at BEFORE UPDATE ON public.operations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Org members access operations" ON public.operations
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id))
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- reports_5110_11
CREATE TABLE public.reports_5110_11 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  report_period TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, report_period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports_5110_11 TO authenticated;
GRANT ALL ON public.reports_5110_11 TO service_role;
ALTER TABLE public.reports_5110_11 ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER reports_5110_11_updated_at BEFORE UPDATE ON public.reports_5110_11
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Org members access reports_5110_11" ON public.reports_5110_11
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id))
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- reports_5110_28
CREATE TABLE public.reports_5110_28 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  report_period TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, report_period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports_5110_28 TO authenticated;
GRANT ALL ON public.reports_5110_28 TO service_role;
ALTER TABLE public.reports_5110_28 ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER reports_5110_28_updated_at BEFORE UPDATE ON public.reports_5110_28
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Org members access reports_5110_28" ON public.reports_5110_28
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id))
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- reports_5110_40
CREATE TABLE public.reports_5110_40 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  report_period TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, report_period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports_5110_40 TO authenticated;
GRANT ALL ON public.reports_5110_40 TO service_role;
ALTER TABLE public.reports_5110_40 ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER reports_5110_40_updated_at BEFORE UPDATE ON public.reports_5110_40
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Org members access reports_5110_40" ON public.reports_5110_40
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id))
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));
