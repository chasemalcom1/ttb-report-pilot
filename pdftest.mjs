import { readFileSync, writeFileSync } from "node:fs";
import { PDFDocument, PDFTextField, StandardFonts } from "pdf-lib";

const bytes = readFileSync("/tmp/f5110-40.pdf");
const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
const form = pdf.getForm();
const values = {
  " NAME OF PROPRIETOR": "TEST DISTILLERY LLC",
  " MONTH AND YEAR": "July 2026",
  " LOCATION OF PLANT": "123 Test St, Louisville, KY 40202",
  " PLANT NUMBER DSP": "DSP-KY-20001",
};
for (const [name, text] of Object.entries(values)) {
  const f = form.getField(name);
  if (f instanceof PDFTextField) f.setText(text);
  console.log("filled:", name);
}
form.flatten();
writeFileSync("/tmp/out.pdf", await pdf.save());
console.log("wrote /tmp/out.pdf");
