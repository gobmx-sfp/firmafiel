# Firafiel

Librería para firmado electrónico PKI y verificación de certificados vía
proxy hacia servicio OCSP, orientado a firmar y verificar certificados
de Firma Electrónica Avanzada (FIEL) expedidos por el SAT.

## Instalación

```bash
# Con Yarn
yarn add @gobmx-sfp/firmafiel

# Con NPM
npm install @gobmx-sfp/firmafiel
```

## Funciones

1. Verificación de la vigencia y validez del certificado vía un proxy hacia servicio OCSP
2. Firmado de mensajes a través del nevagador (llame privada nunca viaja por la red)
3. Validación de cadenas firmadas

## APi

### Información y verificación de certificados

```javascript
getCertificado(llavePublica): object

verificarValidez(llavePublica, url = oscpCheckerUrl): object

getAtributosPúblicos(llavePublica): object

hasAtributoValor(llavePublica, valor): string
```

### Firmado y verificación de documentos digitales

```javascript
firmarCadena({ llavePublica, llavePrivada, contrasena, cadena, confidencial = true })

verificarFirma({ llavePublica, cadena, firma }) {

desencriptarLlavePrivada(llavePrivada, contrasena): string

validarLlaves(llavePublica, llavePrivadaDesencriptada): boolean
```
