"use strict";
const crypto = require("crypto");
const hash = require("object-hash");
const ocsp = require("ocsp");
const axios = require("axios");
const forge = require("node-forge");
const Buffer = require('buffer-ponyfill');

const ACSat1059 = require("./certs/AC-Sat1059");
const ACSat1066 = require("./certs/AC-Sat1066");
const ACSat1070 = require("./certs/AC-Sat1070");
const ACSat1083 = require("./certs/AC-Sat1083");
const ACSat1106 = require("./certs/AC-Sat1106");
const AC1Sat1044 = require("./certs/AC1-Sat1044");
const AC2Sat1043 = require("./certs/AC2-Sat1043");

class firmafiel {
  constructor() {
    this.acs = [
      "AC-Sat1059.crt",
      "AC-Sat1066.crt",
      "AC-Sat1070.crt",
      "AC-Sat1083.crt",
      "AC-Sat1106.crt",
      "AC1-Sat1044.crt",
      "AC2-Sat1043.crt"
    ];
    this.mapcerts = new Map();
    this.mapcerts.set("AC-Sat1059.crt", ACSat1059);
    this.mapcerts.set("AC-Sat1066.crt", ACSat1066);
    this.mapcerts.set("AC-Sat1070.crt", ACSat1070);
    this.mapcerts.set("AC-Sat1070.crt", ACSat1083);
    this.mapcerts.set("AC-Sat1106.crt", ACSat1106);
    this.mapcerts.set("AC1-Sat1044.crt", AC1Sat1044);
    this.mapcerts.set("AC2-Sat1043.crt", AC2Sat1043);

    this.map = new Map();
    this.map.set("https://cfdi.sat.gob.mx/edofiel", "cfdi.sat.gob.mx");
    this.map.set("http://sat.gob.mx/ocsp", "sat.gob.mx");
  }

  //verifica un certificado en url remota
  verificarCertificado({ certificado, url }) {
    return axios.post(
      url ? url : "http://llucio-openssl.k8s.funcionpublica.gob.mx/cert",
      {
        cert: certificado
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  verificarCertificadoFromBuffer({ derBuffer, url }) {
    const certificado = this.certBufferToPem({ derBuffer: derBuffer });
    return axios.post(
      url ? url : "http://llucio-openssl.k8s.funcionpublica.gob.mx/cert",
      {
        cert: certificado
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    // return "hola";
  }

  certBufferToPem({ derBuffer }) {
    try {
      var forgeBuffer = forge.util.createBuffer(derBuffer.toString("binary"));
      //hay que codificarlo como base64
      var encodedb64 = forge.util.encode64(forgeBuffer.data);
      var certPEM =
        "" +
        "-----BEGIN CERTIFICATE-----\n" +
        encodedb64 +
        "\n-----END CERTIFICATE-----";
    } catch (e) {
      throw "Error a lconvertir el archivo a PEM";
    }
    return certPEM;
  }

  //convierte un certificado en formato pem a un certificado forge
  pemToForgeCert({ pem }) {
    try {
      var pki = forge.pki;
      return pki.certificateFromPem(pem);
    } catch (e) {
      throw "Error al convertir la cadena PEM a un certificado forge";
    }
  }

  //recibe el certificado en formato pem y un rfc y devuelve true si la llave publica corresponde con el rfc , de l ocontrario devuelve false
  validaRfcFromPem({ pem, rfc }) {
    const cer = this.pemToForgeCert({ pem: pem });
    try {
      for (var i = 0; i < cer.subject.attributes.length; i++) {
        var val = cer.subject.attributes[i].value.trim();
        if (val == rfc.trim()) {
          return true;
        }
      }
      return false;
    } catch (e) {
      throw "Error al validar el rfc apartir del certificado en formato PEM ";
    }
  }

  //recibe el certificado en formato (forge) y un rfc y devuelve true si la llave publica corresponde con el rfc , del ocontrario devuelve false
  validaRfcFromForgeCert({ cer, rfc }) {
    try {
      for (i = 0; i < cer.subject.attributes.length; i++) {
        var val = cer.subject.attributes[i].value.trim();
        if (val == rfc.trim()) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  //recibe un buffer de una archivo de llave privada y devuelve la llave privada encryptada en formato pem
  keyBufferToPem({ derBuffer }) {
    try {
      //recibe un buffer binario que se tiene que convertir a un buffer de node-forge
      var forgeBuffer = forge.util.createBuffer(derBuffer.toString("binary"));
      //hay que codificarlo como base64
      var encodedb64 = forge.util.encode64(forgeBuffer.data);
      //se le agregan '-----BEGIN ENCRYPTED PRIVATE KEY-----\r\n' y '-----END ENCRYPTED PRIVATE KEY-----\r\n'
      //pkcs8PEM es la llave privada encriptada hay que desencriptarla con el password
      const pkcs8PEM =
        "" +
        "-----BEGIN ENCRYPTED PRIVATE KEY-----\r\n" +
        encodedb64 +
        "-----END ENCRYPTED PRIVATE KEY-----\r\n";
      return pkcs8PEM;
    } catch (e) {
      throw "Error al convertir la llave privada de archivo binario a formato pem";
    }
  }

  //recibe la llave primaria encriptada en formato pem
  //y devuelve la llave privada (forge) , por lo que necesita el password de la llave privada
  pemToForgeKey({ pemkey, pass }) {
    var pki = forge.pki;
    //privateKey es la llave privada
    var privateKey = null;
    try {
      privateKey = pki.decryptRsaPrivateKey(pemkey, pass);
    } catch (e) {
      throw "Error en la contraseña";
    }
    if (!privateKey) {
      throw "Error en la contraseña";
    }

    return privateKey;
  }

  //recibe un buffer de una archivo de llave privada y devuelve la llave privada (forge) , por lo que necesita el password de la llave privada
  keyBufferToForgeKey({ derBuffer, pass }) {
    const privatekeypem = this.keyBufferToPem({ derBuffer: derBuffer });
    return this.pemToForgeKey({ pemkey: privatekeypem, pass: pass });
  }

  //recibe el certificado y la llave privada(formato der binarioo buffer) y el password(string)
  //devuelve true si la llave publica del certificad ocorresponde con la llave publica generada por la llave primaria
  validaCertificadosFromBuffer({ derpublica, derprivada, passprivada }) {
    const cert = this.pemToForgeCert({
      pem: this.certBufferToPem({ derBuffer: derpublica })
    });
    //recibe un buffer binario que se tiene que convertir a un buffer de node-forge
    var forgeBuffer = forge.util.createBuffer(derprivada.toString("binary"));
    //hay que codificarlo como base64
    var encodedb64 = forge.util.encode64(forgeBuffer.data);
    //se le agregan '-----BEGIN ENCRYPTED PRIVATE KEY-----\r\n' y '-----END ENCRYPTED PRIVATE KEY-----\r\n'
    //pkcs8PEM es la llave privada encriptarla hay que desencriptarla con el password
    const pkcs8PEM =
      "" +
      "-----BEGIN ENCRYPTED PRIVATE KEY-----\r\n" +
      encodedb64 +
      "-----END ENCRYPTED PRIVATE KEY-----\r\n";

    var pki = forge.pki;
    //privateKey es la llave privada
    var privateKey = null;
    try {
      privateKey = pki.decryptRsaPrivateKey(pkcs8PEM, passprivada);
    } catch (e) {
      throw "Error en la contraseña";
    }
    if (!privateKey) {
      throw "Error en la contraseña";
    }
    const forgePublicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);
    return (
      pki.publicKeyToPem(forgePublicKey) === pki.publicKeyToPem(cert.publicKey)
    );
  }

  //recibe el certificado y la llave privada(formato pem) y el password(string)
  //devuelve true si la llave publica del certificad ocorresponde con la llave publica generada por la llave primaria
  validaCertificadosFromPem({ pempublica, pemprivada, passprivada }) {
    const cert = this.pemToForgeCert({ pem: pempublica });
    const privateKey = this.pemToForgeKey({
      pemkey: pemprivada,
      pass: passprivada
    });
    const forgePublicKey = forge.pki.setRsaPublicKey(
      privateKey.n,
      privateKey.e
    );
    return (
      forge.pki.publicKeyToPem(forgePublicKey) ===
      forge.pki.publicKeyToPem(cert.publicKey)
    );
  }

  //recibe el certificado en formato pem ,la llave privada en formato pem(encriptada), el password de la llave privada(para desencriptarla), la cadena a firmar
  //devuelve la cadena firmada en formato pem -----BEGIN PKCS7-----
  firmarCadena({ pempublica, pemprivada, passprivada, cadena }) {
    try {
      if (
        this.validaCertificadosFromPem({
          pempublica: pempublica,
          pemprivada: pemprivada,
          passprivada: passprivada
        })
      ) {
        const cert = this.pemToForgeCert({ pem: pempublica });
        const privateKey = this.pemToForgeKey({
          pemkey: pemprivada,
          pass: passprivada
        });
        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(cadena, "utf8");
        p7.addCertificate(cert);
        p7.addSigner({
          key: privateKey,
          certificate: cert,
          digestAlgorithm: forge.pki.oids.sha256,
          authenticatedAttributes: [
            {
              type: forge.pki.oids.contentType,
              value: forge.pki.oids.data
            },
            {
              type: forge.pki.oids.messageDigest
              // value will be auto-populated at signing time
            },
            {
              type: forge.pki.oids.signingTime,
              // will be encoded as generalized time because it's before 1950
              value: new Date()
            }
          ]
        });
        p7.sign({ detached: true }); //es importante poner {detached:true} porque si no , se anexan los datos sin encriptar es decir cualquiera con la firma puede ver los datos firmados
        const pem = forge.pkcs7.messageToPem(p7);
        return { status: "ok", firmapem: pem };
      }
    } catch (e) {
      return { status: "error en el firmado" };
    }
  }
  //verifica una firma devuelve true/false recibe la llave publica en formato pem , la cadena que se firmo, y la firma PKCS#7 en formato PEM
  verificarFirma({ pempublica, cadena, pemfirma }) {
    try {
      // pemfirma is the extracted Signature from the S/MIME
      // with added -----BEGIN PKCS7----- around it
      var msg = forge.pkcs7.messageFromPem(pemfirma.firmapem);
      var sig = msg.rawCapture.signature;
      var buf = Buffer.from(cadena, "binary");

      //esta lógica solo verifica que los dos certificados sean iguales el del mensaje firmado y el proporcionado por el usuario
      //si se utilizan cadenas de certificados entonces habria que deshabilitar esta parte
      var certfirmado = msg.certificates[0];
      var certpublico = forge.pki.certificateFromPem(pempublica);
      var algo1 = hash(certfirmado);
      var algo2 = hash(certpublico);
      if (algo1 !== algo2) {
        throw "El certificado del firmado no es el mismo que el certificado proporcionado";
      }
      //esta lógica solo verifica que los dos certificados sean iguales el del mensaje firmado y el proporcionado por el usuario

      //la verificacion de firmas pkcs#7 no ha sido implementada en node-forge
      //por eso se usa la libreria crypto la cual la resuelve como pkcs#1
      var verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(buf);
      var verified = verifier.verify(
        forge.pki.certificateToPem(certpublico),
        sig,
        "binary"
      );

      return verified;
    } catch (e) {
      return { status: "error al verificar cadena" };
    }
  }

  //la libreria ocsp no permite cambiar la url ni el host del request OCSP porque los busca en el certificado.
  //falta implementar el protocolo ocsp en browser solo se tendria que modificar la libreria para que agrege las url y host que deseamos
  //que pasamos via key , value
  async ocspAsync({ issuer, pem, key, value }) {
    return new Promise(function(resolve, reject) {
      var loquesea = ocsp.check(
        {
          cert: pem,
          issuer: issuer
        },
        function(err, res) {
          if (err) reject(err);
          else resolve(res);
        }
      );
    }).catch(error => {});
  }

  //recibe el certificado en formato PEM
  async validaOCSP({ pem }) {
    //const buf1 = Buffer.from(pem);
    var arrayLength = this.acs.length;
    for (var i = 0; i < arrayLength; i++) {
      for (var [key, value] of this.map) {
        try {
          var certdata = this.mapcerts.get(this.acs[i]);
          var respuestaOCSP = await this.ocspAsync({
            issuer: certdata,
            pem: pem,
            key: key,
            value: value
          });
          if (respuestaOCSP.indexOf("good") !== -1) {
            respuestaOCSP = "good";
            return { status: respuestaOCSP };
          }
          if (respuestaOCSP.indexOf("revoked") !== -1) {
            respuestaOCSP = "revoked";
            return { status: respuestaOCSP };
          }
          if (respuestaOCSP.indexOf("unknown") !== -1) {
            respuestaOCSP = "unknown";
            return { status: respuestaOCSP };
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
    return { status: "unknown" };
  }
}

module.exports = new firmafiel();
