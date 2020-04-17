import fs from 'fs';
import Helvetica from '!!raw-loader!pdfkit/js/data/Helvetica.afm';
import HelveticaBold from '!!raw-loader!pdfkit/js/data/Helvetica-Bold.afm';
import TimesRoman from '!!raw-loader!pdfkit/js/data/Times-Roman.afm';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from 'pdfkit-commonmark';
import PDFDocument from 'pdfkit';
import signer, { pdfkitAddPlaceholder } from 'node-signpdf';
import { getCertificado } from './main';

fs.writeFileSync('data/Helvetica.afm', Helvetica);
fs.writeFileSync('data/Helvetica-Bold.afm', HelveticaBold);
fs.writeFileSync('data/Times-Roman.afm', TimesRoman);

export function crearPdf({ markdown, texto, signaturaPlaceholder = {} }) {
  const pdf = new PDFDocument();

  if (markdown) {
    const writer = new CommonmarkPDFRenderer();
    const reader = new commonmark.Parser();
    const parsed = reader.parse(markdown);
    writer.render(pdf, parsed);
  } else if (texto) {
    pdf.text(texto, 0, 0);
  } else {
    throw new Error('Requerido markdown o texto');
  }

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
