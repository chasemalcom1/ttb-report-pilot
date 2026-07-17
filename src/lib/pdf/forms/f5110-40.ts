import type { TtbFormDefinition } from '../ttbPdfService';
import templateAsset from '@/assets/ttb/f5110-40.pdf.asset.json';

/**
 * Form definition for TTB F 5110.40 — Monthly Report of Production Operations.
 *
 * SCOPE (foundation task only): header fields are filled via the AcroForm
 * fields TTB gave meaningful names to. Body-cell mapping (Parts I–V) will be
 * added in a follow-up task; the runtime already supports mixing AcroForm
 * fills and coordinate overlays, so extending this mapping does not require
 * any service changes.
 *
 * Page layout is landscape 1152 × 612 pt. Coordinates listed here for
 * reference come from the PDF widget rectangles.
 */
export const form5110_40Definition: TtbFormDefinition = {
  templateUrl: templateAsset.url,
  fields: {
    // Header — TTB assigned these fields human-readable partial names.
    proprietorName: { kind: 'acroform', name: ' NAME OF PROPRIETOR' },
    monthAndYear: { kind: 'acroform', name: ' MONTH AND YEAR' },
    locationOfPlant: { kind: 'acroform', name: ' LOCATION OF PLANT' },
    plantNumberDsp: { kind: 'acroform', name: ' PLANT NUMBER DSP' },
  },
};
