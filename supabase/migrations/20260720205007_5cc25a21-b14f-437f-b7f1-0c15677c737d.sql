
-- 1. Organization filing fields required by official TTB forms
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS county text,
  ADD COLUMN IF NOT EXISTS signer_name text,
  ADD COLUMN IF NOT EXISTS signer_title text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text;

-- 2. Operation classifications required to map to official Production Account lines
ALTER TABLE public.operations
  ADD COLUMN IF NOT EXISTS production_source text
    CHECK (production_source IN ('distillation','redistillation')),
  ADD COLUMN IF NOT EXISTS transfer_destination text
    CHECK (transfer_destination IN ('storage','processing','other_bonded','export','research','other')),
  ADD COLUMN IF NOT EXISTS loss_reason text
    CHECK (loss_reason IN ('evaporation','leakage','casualty','spill','destroyed','theft','other')),
  ADD COLUMN IF NOT EXISTS kind_of_spirit text
    CHECK (kind_of_spirit IN ('whisky','brandy','rum','gin','vodka','alcohol_spirits','other'));

-- 3. Trigger requiring classification fields on new/updated rows based on operation type.
--    Existing rows (predating this migration) remain unaffected until edited; the PDF
--    validator surfaces them as "requires reclassification".
CREATE OR REPLACE FUNCTION public.enforce_operation_classification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'production' AND NEW.production_source IS NULL THEN
    RAISE EXCEPTION 'production_source is required for production operations';
  END IF;
  IF NEW.type = 'transfer_out' AND NEW.transfer_destination IS NULL THEN
    RAISE EXCEPTION 'transfer_destination is required for transfer_out operations';
  END IF;
  IF NEW.type = 'loss' AND NEW.loss_reason IS NULL THEN
    RAISE EXCEPTION 'loss_reason is required for loss operations';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS operations_classification_check ON public.operations;
CREATE TRIGGER operations_classification_check
  BEFORE INSERT OR UPDATE ON public.operations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_operation_classification();
