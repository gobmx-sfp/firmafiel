import fs from 'fs';
import Helvetica from '!!raw-loader!pdfkit/js/data/Helvetica.afm';
import HelveticaBold from '!!raw-loader!pdfkit/js/data/Helvetica-Bold.afm';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from 'pdfkit-commonmark';
import PDFDocument from 'pdfkit';
import signer, { pdfkitAddPlaceholder } from 'node-signpdf';
import { getCertificado } from './main';

fs.writeFileSync('data/Helvetica.afm', Helvetica);
fs.writeFileSync('data/Helvetica-Bold.afm', HelveticaBold);

const writer = new CommonmarkPDFRenderer();
const reader = new commonmark.Parser();

export function crearPdf({ markdown, signaturaPlaceholder = {} }) {
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
