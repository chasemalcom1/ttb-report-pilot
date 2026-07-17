import { PDFDocument, PDFTextField, StandardFonts, rgb } from 'pdf-lib';

/**
 * Reusable TTB PDF generation service.
 *
 * The official TTB PDFs (5110.40, 5110.28, 5110.11) contain AcroForm fields,
 * but most cells use opaque partial names (e.g. "Text8.0.0"). To support both
 * kinds of fields the service exposes two composable primitives:
 *
 *   • fillFields(...)   — fill AcroForm fields by name (used where TTB gave
 *                          the field a descriptive name, e.g. header fields).
 *   • drawOverlay(...)  — draw text at absolute page coordinates on top of
 *                          the official form (used where field names are
 *                          opaque or where no field exists).
 *
 * A form definition (`TtbFormDefinition`) declares which template asset to
 * load and the semantic-name → target mapping. Each form (5110.40, 5110.28,
 * 5110.11) will provide its own definition; this file contains no per-form
 * mappings itself so all three forms can share the exact same runtime.
 */

export type Overlay = {
  page: number;
  x: number;
  y: number;
  size?: number;
  align?: 'left' | 'right' | 'center';
};

export type FieldTarget =
  | { kind: 'acroform'; name: string }
  | { kind: 'overlay'; overlay: Overlay };

export interface TtbFormDefinition {
  /** URL to the official TTB PDF template (CDN asset). */
  templateUrl: string;
  /** Semantic key → where to write it on the PDF. */
  fields: Record<string, FieldTarget>;
}

export type TtbFormValues = Record<string, string | number | undefined | null>;

async function loadTemplate(url: string): Promise<PDFDocument> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load TTB template (${res.status})`);
  const bytes = await res.arrayBuffer();
  // TTB PDFs are flagged as encrypted with an empty owner password; pdf-lib
  // refuses to parse them unless we opt in.
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

function formatValue(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return '';
  return typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(1)) : v;
}

export async function generateTtbPdf(
  definition: TtbFormDefinition,
  values: TtbFormValues,
): Promise<Uint8Array> {
  const pdf = await loadTemplate(definition.templateUrl);
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  for (const [key, target] of Object.entries(definition.fields)) {
    const raw = values[key];
    const text = formatValue(raw);
    if (!text) continue;

    if (target.kind === 'acroform') {
      try {
        const field = form.getField(target.name);
        if (field instanceof PDFTextField) {
          field.setText(text);
        }
      } catch (err) {
        console.warn(`[ttbPdf] AcroForm field not found: ${target.name}`, err);
      }
    } else {
      const { page: pageIndex, x, y, size = 9, align = 'left' } = target.overlay;
      const page = pages[pageIndex];
      if (!page) continue;
      const width = font.widthOfTextAtSize(text, size);
      const drawX = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
      page.drawText(text, { x: drawX, y, size, font, color: rgb(0, 0, 0) });
    }
  }

  // Flatten so any AcroForm fills render as static content. Wrapped because
  // some TTB templates have malformed form dictionaries that pdf-lib can't
  // fully walk — overlay drawing is unaffected either way.
  try { form.flatten(); } catch (err) { console.warn('[ttbPdf] form.flatten skipped', err); }


  return pdf.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
