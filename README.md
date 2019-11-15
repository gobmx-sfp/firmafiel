# Api de Firmado electronico PKI

Se puede implementar desde el browser o desde el servidor

## Installing

```bash
$ npm install firmafiel
```

## Stages

1. verificación del certificado via OCSP
2. firmado desde el navegador
3. validacion de cadenas firmadas

Ejemplo:

```javascript
var firmafiel = require("firmafiel");
var fs = require("fs");

var privateKey = fs.readFileSync("PRIVATEKEY.key");
var publicKey = fs.readFileSync("PUBLICKEY.cer");

test = async () => {
  //convertir el archivo a formato PEM
  const pemPublicKey = firmafiel.certBufferToPem({ derBuffer: publicKey });
  //verifica el certificado
  var prueba = await firmafiel.verificarCertificado({
    certificado: pemPublicKey
  });

  var rfc = "XXXXXXXXXXXXX"; //rfc
  var password = "secret"; //contraseña de la llave privada
  var cadena = "TEST"; // cadena a firmar
  var firma = null; //donde quedara la firma

  const pemPrivateKey = firmafiel.keyBufferToPem({ derBuffer: privateKey });

  if (
    prueba.data.status === "good" && //good revoked unknown
    firmafiel.validaRfcFromPem({ pem: pemPublicKey, rfc: rfc })
  ) {
    firma = firmafiel.firmarCadena({
      pempublica: pemPublicKey,
      pemprivada: pemPrivateKey,
      passprivada: password,
      cadena: cadena
    });

    console.log(firma);
  }
  var valid = firmafiel.verificarFirma({
    pempublica: pem,
    cadena: "TEST",
    pemfirma: cadenafirmada
  });

  console.log(valid); //true | false
};

test();
```

## Funciones

Convertir un certificado desde un archivo .cer a una cadena pem

```javascript
const publickey = fs.readFileSync("publickey.cer");

const pem = firmafiel.certBufferToPem({ derBuffer: publickey });
```

Convertir una llave pública desde un archivo .key a una cadena pem(encriptada)

```javascript
const privatekey = fs.readFileSync("privatekey.key");

const pemkey = firmafiel.keyBufferToPem({ derBuffer: privatekey });
```

Verificar un certificado via OCSP

```javascript
const verified = firmafiel.verificarCertificado({ certificado: pem }); //true | false
//url opcional
const verified = firmafiel.verificarCertificado({
  certificado: pem,
  url: "http://servicio-de-verificacion"
});
//desde un buffer
const verified = firmafiel.verificarCertificadoFromBuffer({
  derBuffer: publickey
});
```

Convierte un certificado en formato pem a un certificado node-forge

```javascript
const forgeCert = firmafiel.pemToForgeCert({ pem: pem });
```

Convierte la llave primaria encriptada en formato pem
y devuelve la llave privada desencriptada (forge) , por lo que necesita el password de la llave privada

```javascript
const forgeKey = firmafiel.pemToForgeKey({ pemkey: pemkey, pass: "secret" });
```

Convierte la llave primaria encriptada desde un archivo (buffer)
y devuelve la llave privada desencriptada (forge) , por lo que necesita el password de la llave privada

```javascript
const forgeKey = firmafiel.keyBufferToForgeKey({
  derBuffer: privatekey,
  pass: "secret"
});
```

Recibe el certificado en formato pem y un rfc , devuelve true si la llave pública corresponde con el rfc , de lo contrario devuelve false

```javascript
const validado = firmafiel.validaRfcFromPem({ pem: pem, rfc: "RFCT000000XXX" }); //true | false
```

Recibe el certificado en formato (forge) y un rfc , devuelve true si la llave pública corresponde con el rfc , de lo contrario devuelve false

```javascript
const validado = firmafiel.validaRfcFromForgeCert({
  cer: forgeCert,
  rfc: "RFCT000000XXX"
});
```

Recibe el certificado , la llave privada y el password de la llave privada(string)
devuelve true si la llave pública del certificado corresponde con la llave pública generada por la llave primaria

```javascript
const valid = firmafiel.validaCertificadosFromPem({
  pempublica: pem,
  pemprivada: pemkey,
  passprivada: "secret"
}); //true | false

const valid = firmafiel.validaCertificadosFromBuffer({
  derpublica: publickey,
  derprivada: privatekey,
  passprivada: "secret"
}); //true | false
```

Recibe el certificado en formato pem ,la llave privada en formato pem(encriptada), el password de la llave privada(para desencriptarla), la cadena a firmar
devuelve la cadena firmada en formato pem -----BEGIN PKCS7-----

```javascript
const signature = firmafiel.firmarCadena({
  pempublica: pem,
  pemprivada: pemkey,
  passprivada: "secret",
  cadena: "TEST"
});
```

Verifica una firma devuelve true/false recibe la llave pública en formato pem , la cadena que se firmo, y la firma PKCS#7 en formato PEM

```javascript
const verified = firmafiel.verificarFirma({ pempublica: pem, cadena: "TEST" , pemfirma: signature }): //true | false
```

**Notas**: Falta implementar el protocolo ocsp desde el browser
la libreria ocsp nos permite validar los certificados pero se tiene que modificar
para que acepte una url y host en caso de que el certificado no los tenga, como es el
caso de los certificados del SAT en México.

#### LICENSE

MIT License

Copyright (c) 2019 Luis Lucio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
