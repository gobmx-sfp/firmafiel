const axios = require("axios");
class firmafiel {
  constructor() {
    //console.log("Library constructor loaded");
  }

  verificarCertificado = ({ certificado }) => {

    return axios.post(
      "http://llucio-openssl.k8s.funcionpublica.gob.mx/cert",
      {
        cert: certificado
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  };
}

export default firmafiel;
