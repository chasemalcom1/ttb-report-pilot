-- Create spirits table
CREATE TABLE public.spirits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('whiskey', 'vodka', 'gin', 'rum', 'tequila', 'brandy', 'liqueur', 'wine', 'beer', 'other')),
  default_proof numeric(5,2) NOT NULL CHECK (default_proof >= 0 AND default_proof <= 200),
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create batches table
CREATE TABLE public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spirit_id uuid NOT NULL REFERENCES public.spirits(id) ON DELETE CASCADE,
  batch_number text NOT NULL,
  production_date timestamptz NOT NULL,
  proof numeric(5,2) NOT NULL CHECK (proof >= 0 AND proof <= 200),
  original_liters numeric(12,2) NOT NULL CHECK (original_liters >= 0),
  current_liters numeric(12,2) NOT NULL CHECK (current_liters >= 0),
  status text NOT NULL CHECK (status IN ('in_production', 'aging', 'ready_for_bottling', 'bottled', 'depleted')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, batch_number)
);

-- Create operations table (stores both liters and computed proof gallons)
CREATE TABLE public.operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('production', 'bottling', 'transfer_in', 'transfer_out', 'loss', 'addition', 'redistillation', 'tax_withdrawal')),
  operation_date timestamptz NOT NULL,
  batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
  spirit_id uuid REFERENCES public.spirits(id) ON DELETE SET NULL,
  proof numeric(5,2) CHECK (proof >= 0 AND proof <= 200),
  liters numeric(12,2) NOT NULL CHECK (liters >= 0),
  proof_gallons numeric(12,2) NOT NULL CHECK (proof_gallons >= 0),
  bottles integer CHECK (bottles >= 0),
  bottle_size text,
  destination_or_source text,
  notes text,
  operator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create reports table for Form 5110-40
CREATE TABLE public.reports_5110_40 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_period date NOT NULL,
  registration_number text NOT NULL,
  proprietor_name text NOT NULL,
  proprietor_address text NOT NULL,
  ein_number text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('original', 'amended', 'final')),
  beginning_inventory numeric(12,2) NOT NULL DEFAULT 0,
  production numeric(12,2) NOT NULL DEFAULT 0,
  transfer_in numeric(12,2) NOT NULL DEFAULT 0,
  bottling numeric(12,2) NOT NULL DEFAULT 0,
  transfer_out numeric(12,2) NOT NULL DEFAULT 0,
  loss numeric(12,2) NOT NULL DEFAULT 0,
  ending_inventory numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, report_period)
);

-- Create reports table for Form 5110-28
CREATE TABLE public.reports_5110_28 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_period date NOT NULL,
  registration_number text NOT NULL,
  proprietor_name text NOT NULL,
  proprietor_address text NOT NULL,
  ein_number text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('original', 'amended', 'final')),
  beginning_inventory numeric(12,2) NOT NULL DEFAULT 0,
  bottling numeric(12,2) NOT NULL DEFAULT 0,
  tax_withdrawal numeric(12,2) NOT NULL DEFAULT 0,
  ending_inventory numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, report_period)
);

-- Create reports table for Form 5110-11
CREATE TABLE public.reports_5110_11 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_period date NOT NULL,
  registration_number text NOT NULL,
  proprietor_name text NOT NULL,
  proprietor_address text NOT NULL,
  ein_number text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('original', 'amended', 'final')),
  beginning_inventory numeric(12,2) NOT NULL DEFAULT 0,
  production numeric(12,2) NOT NULL DEFAULT 0,
  transfer_in numeric(12,2) NOT NULL DEFAULT 0,
  bottling numeric(12,2) NOT NULL DEFAULT 0,
  loss numeric(12,2) NOT NULL DEFAULT 0,
  ending_inventory numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, report_period)
);

-- Create indexes for better query performance
CREATE INDEX idx_spirits_org_user ON public.spirits(organization_id, user_id);
CREATE INDEX idx_spirits_type ON public.spirits(type);
CREATE INDEX idx_batches_org_user ON public.batches(organization_id, user_id);
CREATE INDEX idx_batches_spirit ON public.batches(spirit_id);
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_operations_org_user ON public.operations(organization_id, user_id);
CREATE INDEX idx_operations_date ON public.operations(operation_date);
CREATE INDEX idx_operations_type ON public.operations(type);
CREATE INDEX idx_operations_batch ON public.operations(batch_id);
CREATE INDEX idx_operations_spirit ON public.operations(spirit_id);
CREATE INDEX idx_reports_40_org_period ON public.reports_5110_40(organization_id, report_period);
CREATE INDEX idx_reports_28_org_period ON public.reports_5110_28(organization_id, report_period);
CREATE INDEX idx_reports_11_org_period ON public.reports_5110_11(organization_id, report_period);

-- Enable RLS on all tables
ALTER TABLE public.spirits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_5110_40 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_5110_28 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_5110_11 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spirits
CREATE POLICY "Users can view spirits in their organization"
  ON public.spirits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = spirits.organization_id
    )
  );

CREATE POLICY "Users can insert spirits in their organization"
  ON public.spirits FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = spirits.organization_id
    )
  );

CREATE POLICY "Users can update spirits in their organization"
  ON public.spirits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = spirits.organization_id
    )
  );

CREATE POLICY "Users can delete spirits in their organization"
  ON public.spirits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = spirits.organization_id
    )
  );

-- RLS Policies for batches
CREATE POLICY "Users can view batches in their organization"
  ON public.batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = batches.organization_id
    )
  );

CREATE POLICY "Users can insert batches in their organization"
  ON public.batches FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = batches.organization_id
    )
  );

CREATE POLICY "Users can update batches in their organization"
  ON public.batches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = batches.organization_id
    )
  );

CREATE POLICY "Users can delete batches in their organization"
  ON public.batches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = batches.organization_id
    )
  );

-- RLS Policies for operations
CREATE POLICY "Users can view operations in their organization"
  ON public.operations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = operations.organization_id
    )
  );

CREATE POLICY "Users can insert operations in their organization"
  ON public.operations FOR INSERT
  WITH CHECK (
    auth.uid() = operator_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = operations.organization_id
    )
  );

CREATE POLICY "Users can update operations in their organization"
  ON public.operations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = operations.organization_id
    )
  );

CREATE POLICY "Users can delete operations in their organization"
  ON public.operations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = operations.organization_id
    )
  );

-- RLS Policies for reports_5110_40
CREATE POLICY "Users can view 5110-40 reports in their organization"
  ON public.reports_5110_40 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_40.organization_id
    )
  );

CREATE POLICY "Users can insert 5110-40 reports in their organization"
  ON public.reports_5110_40 FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_40.organization_id
    )
  );

CREATE POLICY "Users can update 5110-40 reports in their organization"
  ON public.reports_5110_40 FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_40.organization_id
    )
  );

CREATE POLICY "Users can delete 5110-40 reports in their organization"
  ON public.reports_5110_40 FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_40.organization_id
    )
  );

-- RLS Policies for reports_5110_28
CREATE POLICY "Users can view 5110-28 reports in their organization"
  ON public.reports_5110_28 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_28.organization_id
    )
  );

CREATE POLICY "Users can insert 5110-28 reports in their organization"
  ON public.reports_5110_28 FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_28.organization_id
    )
  );

CREATE POLICY "Users can update 5110-28 reports in their organization"
  ON public.reports_5110_28 FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_28.organization_id
    )
  );

CREATE POLICY "Users can delete 5110-28 reports in their organization"
  ON public.reports_5110_28 FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_28.organization_id
    )
  );

-- RLS Policies for reports_5110_11
CREATE POLICY "Users can view 5110-11 reports in their organization"
  ON public.reports_5110_11 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_11.organization_id
    )
  );

CREATE POLICY "Users can insert 5110-11 reports in their organization"
  ON public.reports_5110_11 FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_11.organization_id
    )
  );

CREATE POLICY "Users can update 5110-11 reports in their organization"
  ON public.reports_5110_11 FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_11.organization_id
    )
  );

CREATE POLICY "Users can delete 5110-11 reports in their organization"
  ON public.reports_5110_11 FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = reports_5110_11.organization_id
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_spirits_updated_at
  BEFORE UPDATE ON public.spirits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operations_updated_at
  BEFORE UPDATE ON public.operations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_5110_40_updated_at
  BEFORE UPDATE ON public.reports_5110_40
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_5110_28_updated_at
  BEFORE UPDATE ON public.reports_5110_28
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_5110_11_updated_at
  BEFORE UPDATE ON public.reports_5110_11
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();