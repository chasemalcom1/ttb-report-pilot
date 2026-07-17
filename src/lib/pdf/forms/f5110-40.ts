import type { TtbFormDefinition } from '../ttbPdfService';
import templateAsset from '@/assets/ttb/f5110-40.pdf.asset.json';

/**
 * Form definition for TTB F 5110.40 — Monthly Report of Production Operations.
 *
 * The official PDF *does* contain widget annotations, but its AcroForm
 * dictionary uses a nested XFA-style structure that pdf-lib cannot parse
 * (form.getFields() returns 0). We therefore use coordinate overlay on top
 * of the untouched government form. The service supports mixing overlays and
 * AcroForm fills, so if a future TTB revision ships a plain AcroForm we can
 * switch individual fields to `{ kind: "acroform" }` without changing the
 * runtime.
 *
 * Page 1 is landscape 1152 × 612 pt. Overlay coordinates below are the
 * bottom-left of each widget rectangle nudged in ~3 pt for margin.
 *
 * SCOPE (foundation task only): header fields only. Line-item mapping for
 * Parts I–V is intentionally deferred.
 */
export const form5110_40Definition: TtbFormDefinition = {
  templateUrl: templateAsset.url,
  fields: {
    proprietorName: { kind: 'overlay', overlay: { page: 0, x: 490, y: 567, size: 10 } },
    monthAndYear:   { kind: 'overlay', overlay: { page: 0, x: 974, y: 566, size: 10 } },
    locationOfPlant:{ kind: 'overlay', overlay: { page: 0, x: 481, y: 544, size: 10 } },
    plantNumberDsp: { kind: 'overlay', overlay: { page: 0, x: 1004, y: 544, size: 10 } },
  },
};
