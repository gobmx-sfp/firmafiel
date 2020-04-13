import { asn1, pki, util, pkcs7, options } from 'node-forge';
import { createVerify } from 'crypto';
import hash from 'object-hash';

options.usePureJavaScript = true;

const oscpCheckerUrl =
  process.env.OSCP_CHECKER_URL ||
  'https://v1.1.oscp-checker.apps.funcionpublica.gob.mx';

/*
 * Verifica la validez de un certificado a través de un proxy
 * hacia el endpoint OSCP en línea del SAT
 */
export async function verificarValidez(llavePublica, url = oscpCheckerUrl) {
  const axios = await import('axios');
  const cert = getCertificado(llavePublica);

  return axios
    .post(url, { cert: pki.certificateToPem(cert) })
    .then(({ data }) => data);
}

/*
 * Normaliza un certificado (llave pública) a un certificado Forge.
 */
export function getCertificado(data) {
  if (data.serialNumber) {
    // Ya normalizado como certificado Forge
    return data;
  }
  try {
    // Intentar leer desde formato DER
    const asn1Cert = asn1.fromDer(util.createBuffer(data));
    return pki.certificateFromAsn1(asn1Cert);
  } catch {}
  try {
    // Intentar leer desde formato PEM
    return pki.certificateFromPem(data);
  } catch {}
  try {
    // Intentar Leer Asn1
    return pki.certificateFromAsn1(data);
  } catch {}
  try {
    // Intentar leer desde datos binarios
    return pki.certificateFromPem(toPem(data, 'CERTIFICATE'));
  } catch (err) {
    console.error(err);
    throw new Error('Error al leer certificado');
  }
}

/*
 * Devuelve objeto con nombre y valores de todos los atributos
 * del sujeto certificado enconttados en la llave pública
 */
export function getAtributosPublicos(llavePublica) {
  const {
    subject: { attributes },
  } = getCertificado(llavePublica);

  return attributes.reduce((attrs, { name, type, value }) => ({
    ...attrs,
    [name || type]: value,
  }));
}

/*
 * Valida si un valor se encuentra listado entre los valores
 * de los atributos del sujeto certificado (por ejemplo un RFC)
 */
export function hasAtributoValor(llavePublica, valor) {
  const attributes = Object.values(getSubjectAttributes(llavePublica));
  return attributes.includes(valor);
}

/*
 * Desencripta una llave privada utilizando la contraseña
 */
export function desencriptarLlavePrivada(llavePrivada, contrasena) {
  try {
    // Intentar desencriptar diréctamente
    return pki.decryptRsaPrivateKey(llavePrivada, contrasena);
  } catch {
    try {
      // Intentar convertir primero a formato PEM
      const pemKey = toPem(llavePrivada, 'ENCRYPTED PRIVATE KEY');
      return pki.decryptRsaPrivateKey(pemKey, contrasena);
    } catch (err) {
      throw new Error('Llave inválida o contraseña incorrecta');
    }
  }
}

/*
 * Verifica que una llave privada corresponda a la llabe pública
 */
export function validarLlaves(llavePublica, llavePrivadaDesencriptada) {
  const { publicKey } = getCertificado(llavePublica);
  const { n, e } = llavePrivadaDesencriptada;
  const rsaPublicKey = pki.setRsaPublicKey(n, e);

  return pki.publicKeyToPem(rsaPublicKey) === pki.publicKeyToPem(publicKey);
}

/*
 * Firma una cadena utilizando certificado, llave privada y contraseña.
 * Opcionalmente marcado como confidencial, para no incluir el mensaje
 * firmado dentro de la misma firma.
 */
export function firmarCadena({
  llavePublica,
  llavePrivada,
  contrasena,
  cadena,
  confidencial = true,
}) {
  const cert = getCertificado(llavePublica);

  const today = new Date().getTime();
  const from = cert.validity.notBefore.getTime();
  const to = cert.validity.notAfter.getTime();

  if (today < from || today > to) {
    throw new Error('El certificado ha expirado');
  }

  const decryptedKey = desencriptarLlavePrivada(llavePrivada, contrasena);
  if (!validarLlaves(cert, decryptedKey)) {
    throw new Error(
      'La llave privada no correpsonde con el certificado provisto'
    );
  }

  // Firma mensaje
  const p7 = pkcs7.createSignedData();
  p7.content = util.createBuffer(cadena, 'utf8');
  p7.addCertificate(cert);
  p7.addSigner({
    key: decryptedKey,
    certificate: cert,
    digestAlgorithm: pki.oids.sha256,
  });
  // Si los datos formados son confidenciales, es importante poner { detached: true }
  // o bien se anexarán los datos sin encriptar y cualquiera con la firma puede ver los datos firmados
  // Si por el contrario se desea firmar un documento público, conviene { detached: false }
  p7.sign({ detached: !confidencial });

  return pkcs7.messageToPem(p7);
}

/*
 * Verifica si una firma corresponde a una cadena para un certificado
 */
export function verificarFirma({ llavePublica, cadena, firma }) {
  const cert = getCertificado(llavePublica);
  try {
    const msg = pkcs7.messageFromPem(firma);

    // Esta lógica solo verifica que los dos certificados sean iguales el del mensaje firmado y el proporcionado por el usuario
    // Si se utilizan cadenas de certificados entonces habria que deshabilitar esta parte
    if (hash(msg.certificates[0]) !== hash(cert)) {
      throw new Error(
        'El certificado del firmado no es el mismo que el certificado proporcionado'
      );
    }

    // Esta lógica verifica que los dos certificados sean iguales el del mensaje firmado y el proporcionado por el usuario
    // la verificacion de firmas pkcs#7 no ha sido implementada en node-forge
    // por eso se usa la libreria crypto la cual la resuelve como pkcs#1
    const verifier = createVerify('RSA-SHA256');
    verifier.update(util.createBuffer(cadena));

    return verifier.verify(
      pki.certificateToPem(cert),
      msg.rawCapture,
      'binary'
    );
  } catch (e) {
    console.error('Error verificando firma');
    return false;
  }
}

function toPem(data, type) {
  const base64 = util.encode64(util.createBuffer(data).data);
  return `-----BEGIN ${type}-----\n${base64}\n-----END ${type}-----`;
}
