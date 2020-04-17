import commonmark from 'pdfkit-commonmark';
import CommonmarkPDFRenderer from 'pdfkit-commonmark';
import PDFDocument from 'pdfkit';
import signer, { pdfkitAddPlaceholder } from 'node-signpdf';
import { getCertificado } from './main';

const writer = new CommonmarkPDFRenderer();
const reader = new commonmark.Parser();

export function crearPdf({ markdown, signaturaPlaceholder }) {
  const pdf = new PDFDocument();
  const parsed = reader.parse(markdown);

  writer.render(pdf, parsed);

  const refs = pdfkitAddPlaceholder({
    pdf,
    pdfBuffer: Buffer.from([pdf]),
    ...signaturaPlaceholder,
  });

  Object.keys(refs).forEach((key) => refs[key].end());

  pdf.end();

  return pdf;
}

export function firmarPdf({ pdf, cert, contrasena }) {
  return signer.sign(pdf, getCertificado(cert), { passphrase: contrasena });
}
