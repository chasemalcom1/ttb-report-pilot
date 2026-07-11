
-- Cross-organization foreign key protection: enforce that referenced spirit/batch belong to the same organization.

CREATE OR REPLACE FUNCTION public.enforce_batch_same_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE spirit_org uuid;
BEGIN
  IF NEW.spirit_id IS NOT NULL THEN
    SELECT organization_id INTO spirit_org FROM public.spirits WHERE id = NEW.spirit_id;
    IF spirit_org IS NULL OR spirit_org <> NEW.organization_id THEN
      RAISE EXCEPTION 'Batch spirit_id must belong to the same organization';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS batches_same_org ON public.batches;
CREATE TRIGGER batches_same_org BEFORE INSERT OR UPDATE ON public.batches
FOR EACH ROW EXECUTE FUNCTION public.enforce_batch_same_org();

CREATE OR REPLACE FUNCTION public.enforce_operation_same_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE spirit_org uuid; batch_org uuid;
BEGIN
  IF NEW.spirit_id IS NOT NULL THEN
    SELECT organization_id INTO spirit_org FROM public.spirits WHERE id = NEW.spirit_id;
    IF spirit_org IS NULL OR spirit_org <> NEW.organization_id THEN
      RAISE EXCEPTION 'Operation spirit_id must belong to the same organization';
    END IF;
  END IF;
  IF NEW.batch_id IS NOT NULL THEN
    SELECT organization_id INTO batch_org FROM public.batches WHERE id = NEW.batch_id;
    IF batch_org IS NULL OR batch_org <> NEW.organization_id THEN
      RAISE EXCEPTION 'Operation batch_id must belong to the same organization';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS operations_same_org ON public.operations;
CREATE TRIGGER operations_same_org BEFORE INSERT OR UPDATE ON public.operations
FOR EACH ROW EXECUTE FUNCTION public.enforce_operation_same_org();

-- Performance: indexes on organization_id
CREATE INDEX IF NOT EXISTS idx_spirits_org ON public.spirits(organization_id);
CREATE INDEX IF NOT EXISTS idx_batches_org ON public.batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_operations_org ON public.operations(organization_id);
CREATE INDEX IF NOT EXISTS idx_operations_org_date ON public.operations(organization_id, operation_date);
CREATE INDEX IF NOT EXISTS idx_reports_5110_40_org ON public.reports_5110_40(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_5110_28_org ON public.reports_5110_28(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_5110_11_org ON public.reports_5110_11(organization_id);
