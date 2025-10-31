-- Fix security: Add secure search_path to update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate triggers after function update
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