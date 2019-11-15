"use strict";
const crypto = require("crypto");
const hash = require("object-hash");
const ocsp = require("ocsp");
const axios = require("axios");
const forge = require("node-forge");

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
    this.mapcerts.set(
      "AC-Sat1059.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlGcVRDQ0JEV2dBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFd05Ua3dEUVlKS29aSWh2Y05BUUVGDQpCUUF3Z2JjeEN6QUpCZ05WQkFZVEFrMVlNUmt3RndZRFZRUUlEQkJFYVhOMGNtbDBieUJHWldSbGNtRnNNUk13DQpFUVlEVlFRSERBcERkV0YxYUhSbGJXOWpNUmd3RmdZRFZRUUtEQTlDWVc1amJ5QmtaU0JOWlhocFkyOHhKVEFqDQpCZ05WQkFNTUhFRm5aVzVqYVdFZ1VtVm5hWE4wY21Ga2IzSmhJRU5sYm5SeVlXd3hOekExQmdrcWhraUc5dzBCDQpDUUlNS0ZKbGMzQnZibk5oWW14bElFcHZjMlVnUVc1MGIyNXBieUJJWlhKdVlXNWtaWG9nUVhsMWMyOHdIaGNODQpNVEF3T0RNeE1UWXlNelUxV2hjTk1UZ3dPRE14TVRZeU16VTFXakNDQVpZeE9EQTJCZ05WQkFNTUwwRXVReTRnDQpaR1ZzSUZObGNuWnBZMmx2SUdSbElFRmtiV2x1YVhOMGNtRmphY096YmlCVWNtbGlkWFJoY21saE1TOHdMUVlEDQpWUVFLRENaVFpYSjJhV05wYnlCa1pTQkJaRzFwYm1semRISmhZMm5EczI0Z1ZISnBZblYwWVhKcFlURkVNRUlHDQpBMVVFQ3d3N1FXUnRhVzVwYzNSeVlXTnB3N051SUdSbElGTmxjblpwWTJsdmN5QlVjbWxpZFhSaGNtbHZjeUJoDQpiQ0JEYjI1MGNtbGlkWGxsYm5SbElESXhIekFkQmdrcWhraUc5dzBCQ1FFV0VHRmpjM1JqUUhOaGRDNW5iMkl1DQpiWGd4SmpBa0JnTlZCQWtNSFVGMkxpQklhV1JoYkdkdklEYzNMQ0JEYjJ3dUlFZDFaWEp5WlhKdk1RNHdEQVlEDQpWUVFSREFVd05qTXdNREVMTUFrR0ExVUVCaE1DVFZneEdUQVhCZ05WQkFnTUVFUnBjM1J5YVhSdklFWmxaR1Z5DQpZV3d4RXpBUkJnTlZCQWNNQ2tOMVlYVm9kR1Z0YjJNeEZUQVRCZ05WQkMwVERGTkJWRGszTURjd01VNU9NekUyDQpNRFFHQ1NxR1NJYjNEUUVKQWd3blVtVnpjRzl1YzJGaWJHVTZJQ0JEWlhOaGNpQk1kV2x6SUZCbGNtRnNaWE1nDQpWR1ZzYkdWNk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBNkZIUWQ4enJhWTJLDQp1dDZ1VWU4WlpaNlBzQ0VpYWR1K2hmM2g2cTFBZDI0SE1zbFFOaDdmSUk4WVNvZzFVVEFUWDAvaUQwTUJFVEdSDQo4MUZCbFU3c3N0Rm1sdUx5SlNFTVY1dUVoUU9KamswQzdCWFA4WmFvelUrSjBucG9TL0VQU1BTMXM5R3o1OG5uDQpGd0NDcFc1SG82YW4zUWNLeENlbXBRWVhYMGplVWdQaUMzTjBYcjNleW83Q1VpT1p2RXZZNVFTOWxVRVZGMEloDQpIb0N1QnF6SDZ2UzY3WlZFT2cwM1R5RmZ5SXQ5bGlqTW1xYWxwUHk5UHNWcEtLdWVrWm9HN0w0NWJQb05OM0dyDQpES3dYMFVyT3ZnVTFxS2NZbEt3alBqdm1JU3JHR1N2ZTZEUkZ3SDVhdW9LQllXQjdBVEYzYk9nd0tSeFBsRmR0DQpwZVVDYXNFT293SURBUUFCbzI4d2JUQWRCZ05WSFE0RUZnUVVNMDA5Q25GeFhpbUZxMmdaa2RVaU45ZGhmdWt3DQpEd1lEVlIwVEJBZ3dCZ0VCL3dJQkFEQUxCZ05WSFE4RUJBTUNBZVl3RVFZSllJWklBWWI0UWdFQkJBUURBZ0VHDQpNQnNHQTFVZEVRUVVNQktCRUdGamMzUmpRSE5oZEM1bmIySXViWGd3RFFZSktvWklodmNOQVFFRkJRQURnZ0ZkDQpBRlpWOGFIWWVMRVEvY0JtbVZwcVpkYlpsZTBJbzBNT1p0dm1Mak9yM3MyMGVqcGVJbzJSb1NYQzVSR2htWUl2DQorUC9lK2puYm5yOGJXL2luWkNxZ0VLczZUS1VqajB4MjJ4a3lsaE5YS3p3YUUxQkFEbnpUNnpaM2hjY21GL0pKDQpyWjZDbGlNanVXWmVQVkx6Ti91QW5nOUxyVWRtU0R0ZTlENEloZ0xOQURsc0lwT3FUaGl1aC8xeW5MOFR3Z0pMDQoxajcrbzB1azdIbG9uOEM3TlpvUnZ2WW9ablVUVklENVYrWFp4cTJGbzh6OGdMQ0thQnZYOXVnN2lEdmVHK1F2DQozTTlsSFJBR1lqblMzQzlyd1JsQUVpNVNLSVk1Q2tVZ1dseVhBdUxEeSs0UHVhQ09SU2JpZ0RHc3BKM0xMa2lJDQovS0p3bjc1aGpnS3VqL1pwMGNuMmdGbC9ycnF6OHh6SWxDT1hIRGVrZnJwRjR6QTNDR1Z3VkJTYUU2YzdLc0RFDQpla2xvSjV5Q2ppTW5RQmJzc2R0YytnMHl5MzhRODV6Nk1lUTR1dVV1ZlEzM2VwSkdMOGZzTXJtRDV4c3VGaEFIDQp3cEIydUYvOThjRnI1MGhieHc9PQ0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ0K\r\n-----END CERTIFICATE-----\r\n"
    );
    this.mapcerts.set(
      "AC-Sat1066.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlHN1RDQ0JYbWdBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFd05qWXdEUVlKS29aSWh2Y05BUUVGDQpCUUF3Z2JjeEN6QUpCZ05WQkFZVEFrMVlNUmt3RndZRFZRUUlEQkJFYVhOMGNtbDBieUJHWldSbGNtRnNNUk13DQpFUVlEVlFRSERBcERkV0YxYUhSbGJXOWpNUmd3RmdZRFZRUUtEQTlDWVc1amJ5QmtaU0JOWlhocFkyOHhKVEFqDQpCZ05WQkFNTUhFRm5aVzVqYVdFZ1VtVm5hWE4wY21Ga2IzSmhJRU5sYm5SeVlXd3hOekExQmdrcWhraUc5dzBCDQpDUUlNS0ZKbGMzQnZibk5oWW14bElFcHZjMlVnUVc1MGIyNXBieUJJWlhKdVlXNWtaWG9nUVhsMWMyOHdIaGNODQpNVEV4TWpFMk1qQXhOVEUzV2hjTk1Ua3hNakUyTWpBeE5URTNXakNDQVpVeE9EQTJCZ05WQkFNTUwwRXVReTRnDQpaR1ZzSUZObGNuWnBZMmx2SUdSbElFRmtiV2x1YVhOMGNtRmphY096YmlCVWNtbGlkWFJoY21saE1TOHdMUVlEDQpWUVFLRENaVFpYSjJhV05wYnlCa1pTQkJaRzFwYm1semRISmhZMm5EczI0Z1ZISnBZblYwWVhKcFlURTRNRFlHDQpBMVVFQ3d3dlFXUnRhVzVwYzNSeVlXTnB3N051SUdSbElGTmxaM1Z5YVdSaFpDQmtaU0JzWVNCSmJtWnZjbTFoDQpZMm5EczI0eElUQWZCZ2txaGtpRzl3MEJDUUVXRW1GemFYTnVaWFJBYzJGMExtZHZZaTV0ZURFbU1DUUdBMVVFDQpDUXdkUVhZdUlFaHBaR0ZzWjI4Z056Y3NJRU52YkM0Z1IzVmxjbkpsY204eERqQU1CZ05WQkJFTUJUQTJNekF3DQpNUXN3Q1FZRFZRUUdFd0pOV0RFWk1CY0dBMVVFQ0F3UVJHbHpkSEpwZEc4Z1JtVmtaWEpoYkRFVU1CSUdBMVVFDQpCd3dMUTNWaGRXaDB3Nmx0YjJNeEZUQVRCZ05WQkMwVERGTkJWRGszTURjd01VNU9NekUrTUR3R0NTcUdTSWIzDQpEUUVKQWd3dlVtVnpjRzl1YzJGaWJHVTZJRU5sWTJsc2FXRWdSM1ZwYkd4bGNtMXBibUVnUjJGeVk4T3RZU0JIDQpkV1Z5Y21Fd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUNyeGpSakwzUXBWY1p5DQp4Z2Fzbmg2Wkt0Q0RDSSt1KzV0VzBCNW9WWXNGMmFBeldnL1lrbWtOQXEvSE9OaitPNmdCeWpwVlE2RTlWV01oDQovWTYyQkxoNEp3VE83QitmdVRUWDRYNTJUZzV2OG53K2NLejZidVo4TWJKZlBEZHlxcnNLaThnaWt3MlBxR25ZDQpDM3hpWFdnMk94MzMxeGY5ZUNRWE0rY2lsWXFveEkxTDJjVXZCZHduckRqMDJtVUpLd2ZrZk1QUlcvaG1xby85DQpLdWQ0ZDcxbFUvcXlXVm5IaTFKdnJ2R3JtbW4zM0RNcjJsRS9Mdzl4SlRVVVViNHdybnlXa0lnY2c1L205Mjc1DQpuTEx1dUtPdXM0Z1hGekhDRGtrbmwwZlh4bVJHVklOUjA4ZkJlbWJLY0RFa29nVmJQSkwrOElOV3ZEWjFIVlJqDQoyRjh3c1MxekFnTUJBQUdqZ2dHeU1JSUJyakFkQmdOVkhRNEVGZ1FVU1lIbGNZMlNwTHZIMDFpOU5OTDV2YnJnDQpJYTh3Z2ZjR0ExVWRJd1NCN3pDQjdJQVVWVk9ib01QakJuN1JWa0NEb1g5KzkxOUVXWGVoZ2Iya2dib3dnYmN4DQpDekFKQmdOVkJBWVRBazFZTVJrd0Z3WURWUVFJREJCRWFYTjBjbWwwYnlCR1pXUmxjbUZzTVJNd0VRWURWUVFIDQpEQXBEZFdGMWFIUmxiVzlqTVJnd0ZnWURWUVFLREE5Q1lXNWpieUJrWlNCTlpYaHBZMjh4SlRBakJnTlZCQU1NDQpIRUZuWlc1amFXRWdVbVZuYVhOMGNtRmtiM0poSUVObGJuUnlZV3d4TnpBMUJna3Foa2lHOXcwQkNRSU1LRkpsDQpjM0J2Ym5OaFlteGxJRXB2YzJVZ1FXNTBiMjVwYnlCSVpYSnVZVzVrWlhvZ1FYbDFjMitDRkRBd01EQXdNREF3DQpNREF3TURBd01EQXdNREF5TUE4R0ExVWRFd1FJTUFZQkFmOENBUUF3Q3dZRFZSMFBCQVFEQWdIK01Db0dBMVVkDQpId1FqTUNFd0g2QWRvQnVHR1doMGRIQTZMeTkzZDNjdWMyRjBMbWR2WWk1dGVDOURVa3d3TmdZSUt3WUJCUVVIDQpBUUVFS2pBb01DWUdDQ3NHQVFVRkJ6QUJoaHBvZEhSd09pOHZkM2QzTG5OaGRDNW5iMkl1YlhndmIyTnpjREFSDQpCZ2xnaGtnQmh2aENBUUVFQkFNQ0FRWXdEUVlKS29aSWh2Y05BUUVGQlFBRGdnRmRBSDhoVU1vSGF6U2FMeUF5DQoreHIvQXlyQ1Y2d3lTNHloci9YRm1YUkk2U0o1NXM4REtEQzlsVDd1dDIwT1RrUGFiSVY1RjRYQVhERVQrbkhFDQpYUXhZNklWYWZ2MEdUaEVMYTNDOGpabWtCNFVXRERydk1JTURaZEtsODIrSXJYcFJMUU45dHFOcDd5TG9HME9UDQp6OExETjBFdjVnSzY1dkl0M0FORzZPNDJYZ2JDL0t5U1k1K3NzbXpDby9ZOVhUeXoyS1pzeXcyVlVWMFVzeHNCDQpSbG5mQjNvZXRheDhRL2lyNExQYUFSQ0lSWnB3VTk1dmRTN1RISUdONDZQQ3ZtNVJpMy9wTnNnMGlqU1VhVk5QDQpTKzVSV2k1NFFnaDI1TEpYTHcvbHI4ek4yRmh6cGJxd1Z5UGs0cmxhMFZYR0FERUlNYks3Vy92eDdQeXFQNFl2DQpNQUhielYvZVlGaVRONG1COGdZV0hzemtlTFhVTDd1MVVsRTIxZ3JYaDJadkV1TEc5QmdkdnNvUWVxa0E0dWwwDQptWTQ5NFNkVUxpOUxNT1AxejNaYUE5U21EelBpOXJvVVMrdGQzMW10SVJjTkxoNFJHeW51VFl0cmVQYTNiczJrDQpqdz09DQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tDQo=\r\n-----END CERTIFICATE-----\r\n"
    );
    this.mapcerts.set(
      "AC-Sat1070.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlISFRDQ0JhbWdBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFd056QXdEUVlKS29aSWh2Y05BUUVGDQpCUUF3Z2JjeEN6QUpCZ05WQkFZVEFrMVlNUmt3RndZRFZRUUlEQkJFYVhOMGNtbDBieUJHWldSbGNtRnNNUk13DQpFUVlEVlFRSERBcERkV0YxYUhSbGJXOWpNUmd3RmdZRFZRUUtEQTlDWVc1amJ5QmtaU0JOWlhocFkyOHhKVEFqDQpCZ05WQkFNTUhFRm5aVzVqYVdFZ1VtVm5hWE4wY21Ga2IzSmhJRU5sYm5SeVlXd3hOekExQmdrcWhraUc5dzBCDQpDUUlNS0ZKbGMzQnZibk5oWW14bElFcHZjMlVnUVc1MGIyNXBieUJJWlhKdVlXNWtaWG9nUVhsMWMyOHdIaGNODQpNVE13TkRJNU1UWTBNVFUyV2hjTk1qRXdOREk1TVRZME1UVTJXakNDQVlveE9EQTJCZ05WQkFNTUwwRXVReTRnDQpaR1ZzSUZObGNuWnBZMmx2SUdSbElFRmtiV2x1YVhOMGNtRmphY096YmlCVWNtbGlkWFJoY21saE1TOHdMUVlEDQpWUVFLRENaVFpYSjJhV05wYnlCa1pTQkJaRzFwYm1semRISmhZMm5EczI0Z1ZISnBZblYwWVhKcFlURTRNRFlHDQpBMVVFQ3d3dlFXUnRhVzVwYzNSeVlXTnB3N051SUdSbElGTmxaM1Z5YVdSaFpDQmtaU0JzWVNCSmJtWnZjbTFoDQpZMm5EczI0eEh6QWRCZ2txaGtpRzl3MEJDUUVXRUdGamIyUnpRSE5oZEM1bmIySXViWGd4SmpBa0JnTlZCQWtNDQpIVUYyTGlCSWFXUmhiR2R2SURjM0xDQkRiMnd1SUVkMVpYSnlaWEp2TVE0d0RBWURWUVFSREFVd05qTXdNREVMDQpNQWtHQTFVRUJoTUNUVmd4R1RBWEJnTlZCQWdNRUVScGMzUnlhWFJ2SUVabFpHVnlZV3d4RkRBU0JnTlZCQWNNDQpDME4xWVhWb2RNT3BiVzlqTVJVd0V3WURWUVF0RXd4VFFWUTVOekEzTURGT1RqTXhOVEF6QmdrcWhraUc5dzBCDQpDUUlNSmxKbGMzQnZibk5oWW14bE9pQkRiR0YxWkdsaElFTnZkbUZ5Y25WaWFXRnpJRTlqYUc5aE1JSUJJakFODQpCZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUE0Vnd5L2dsOHBZL2R5SkpMUGE2VTNmMHJxR3lIDQp0YjZlRzFBdkkvUjZuQjRxWHVHcmNYQjlsR3BKMjFhQlNEMVJ5dkVOL2NTNUd2RFFVTStHemt2MStvZzNUWnRoDQpGcy9GZkluVy9HdXFGZXhTdEpYTWQvTnN5cGdPZEJKT0p4ajY4V3JiV3d5aFQ5eWwyNzFieDhHUGlwdXVCM2RBDQo0YzByU2lwNTFidEgyZklCUkZXZURBMWNEdWRhd0loZ3kzWjkwcUZGMVAvcldObm83K0xKMzVMekI3K1NaZzVrDQpQRTRSRnM4YTROZFdzOVRJMkVlaS9KaEFTNnJ6M2c1QkRJa0pFR0xkWW5mRjY3aEpyMlJPMUJRei9ZbDRhRU9BDQp5RWFmS1NFZ2t6QkpxVDZOZVpSNDNWS1BNVHlSSEhiYXliVllDSVZRa0h6SktLazU4YVpQaVlhOE53SURBUUFCDQpvNElCN1RDQ0Fla3dIUVlEVlIwT0JCWUVGTHdwNkk1cnZqRTJaNFhHTjYrY0F2UWgwa3pNTUlIM0JnTlZIU01FDQpnZTh3Z2V5QUZGVlRtNkRENHdaKzBWWkFnNkYvZnZkZlJGbDNvWUc5cElHNk1JRzNNUXN3Q1FZRFZRUUdFd0pODQpXREVaTUJjR0ExVUVDQXdRUkdsemRISnBkRzhnUm1Wa1pYSmhiREVUTUJFR0ExVUVCd3dLUTNWaGRXaDBaVzF2DQpZekVZTUJZR0ExVUVDZ3dQUW1GdVkyOGdaR1VnVFdWNGFXTnZNU1V3SXdZRFZRUUREQnhCWjJWdVkybGhJRkpsDQpaMmx6ZEhKaFpHOXlZU0JEWlc1MGNtRnNNVGN3TlFZSktvWklodmNOQVFrQ0RDaFNaWE53YjI1ellXSnNaU0JLDQpiM05sSUVGdWRHOXVhVzhnU0dWeWJtRnVaR1Y2SUVGNWRYTnZnaFF3TURBd01EQXdNREF3TURBd01EQXdNREF3DQpNakFQQmdOVkhSTUVDREFHQVFIL0FnRUFNQXNHQTFVZER3UUVBd0lCL2pBMEJnTlZIU1VFTFRBckJnZ3JCZ0VGDQpCUWNEQWdZSUt3WUJCUVVIQXdnR0NXQ0dTQUdHK0VJRUFRWUtLd1lCQkFHQ053b0RBekE3QmdnckJnRUZCUWNCDQpBUVF2TUMwd0t3WUlLd1lCQlFVSE1BR0dIMmgwZEhCek9pOHZZMlprYVM1ellYUXVaMjlpTG0xNEwyVmtiMlpwDQpaV3d3S2dZRFZSMGZCQ013SVRBZm9CMmdHNFlaYUhSMGNEb3ZMM2QzZHk1ellYUXVaMjlpTG0xNEwyTnliREFSDQpCZ2xnaGtnQmh2aENBUUVFQkFNQ0FRWXdEUVlKS29aSWh2Y05BUUVGQlFBRGdnRmRBRVJWdXczMXZDVSs4aEdHDQpoY2c3MDVNK2pkZm5KTWNmNDU2eFNHL3lzb0Y5QUoxVnQ1RVpQdHQ0a2dFZ0M2STl3SlFtZFAvOU1POGo5T1pKDQpSdVhndklXaUU2QUZ1eHFGUVdDTUxTQW50WFllOWlNZGpiR1JaWldSaTFKanZqczN1NXdLWVNMdHk1T0lPTTcyDQprNTJGa1N2clpBRVF6Sjk1b0NSRm5RTzVBclVmYnFrWDdlcUc3RTcwb3VYVmM2MllENmJzeG55eHNmWFlXRXQrDQptNmtjUlpRSzBtcnR5a2N5VzUwQ2FSZFZLUkVlcnVoZ0s0cnpzYnFHdSs4SS94T0JoSjAzelNxc2ZxTEdPQTFXDQpHSDRaSzJvZ3VhSWF1TkNWUU93bVNyREFiQjVEVWcwN2liaHI0QnIycUN0YmZCdjBVYWlIeTJ1ZzY2Zjh6K2M4DQpwekdTMVJkaXhtVVE0ZXhWVGV3cmNoVlNaVWNoeWVFYUJOL21PeUxXdWlKMU1FRFVWMWJQZ2xaVUhQMk5ZNGZ5DQpPdGZodFN5dnBqSEVIQnY0cnBqRzdLZ3NDSTFvMkc4U3diQk1Yak8zQXVBVmd6Z3BGV3pYTm56UXJ0cjlSbHE1DQphdz09DQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tDQo=\r\n-----END CERTIFICATE-----\r\n"
    );
    this.mapcerts.set(
      "AC-Sat1070.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlIbVRDQ0JpV2dBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFd09ETXdEUVlKS29aSWh2Y05BUUVMDQpCUUF3Z2JjeEN6QUpCZ05WQkFZVEFrMVlNUmt3RndZRFZRUUlEQkJFYVhOMGNtbDBieUJHWldSbGNtRnNNUk13DQpFUVlEVlFRSERBcERkV0YxYUhSbGJXOWpNUmd3RmdZRFZRUUtEQTlDWVc1amJ5QmtaU0JOWlhocFkyOHhKVEFqDQpCZ05WQkFNTUhFRm5aVzVqYVdFZ1VtVm5hWE4wY21Ga2IzSmhJRU5sYm5SeVlXd3hOekExQmdrcWhraUc5dzBCDQpDUUlNS0ZKbGMzQnZibk5oWW14bElFcHZjMlVnUVc1MGIyNXBieUJJWlhKdVlXNWtaWG9nUVhsMWMyOHdIaGNODQpNVFV3TlRJMU1UZ3dOREl3V2hjTk1qTXdOVEkxTVRnd05ESXdXakNDQWJJeE9EQTJCZ05WQkFNTUwwRXVReTRnDQpaR1ZzSUZObGNuWnBZMmx2SUdSbElFRmtiV2x1YVhOMGNtRmphY096YmlCVWNtbGlkWFJoY21saE1TOHdMUVlEDQpWUVFLRENaVFpYSjJhV05wYnlCa1pTQkJaRzFwYm1semRISmhZMm5EczI0Z1ZISnBZblYwWVhKcFlURTRNRFlHDQpBMVVFQ3d3dlFXUnRhVzVwYzNSeVlXTnB3N051SUdSbElGTmxaM1Z5YVdSaFpDQmtaU0JzWVNCSmJtWnZjbTFoDQpZMm5EczI0eEh6QWRCZ2txaGtpRzl3MEJDUUVXRUdGamIyUnpRSE5oZEM1bmIySXViWGd4SmpBa0JnTlZCQWtNDQpIVUYyTGlCSWFXUmhiR2R2SURjM0xDQkRiMnd1SUVkMVpYSnlaWEp2TVE0d0RBWURWUVFSREFVd05qTXdNREVMDQpNQWtHQTFVRUJoTUNUVmd4R1RBWEJnTlZCQWdNRUVScGMzUnlhWFJ2SUVabFpHVnlZV3d4RkRBU0JnTlZCQWNNDQpDME4xWVhWb2RNT3BiVzlqTVJVd0V3WURWUVF0RXd4VFFWUTVOekEzTURGT1RqTXhYVEJiQmdrcWhraUc5dzBCDQpDUUlNVGxKbGMzQnZibk5oWW14bE9pQkJaRzFwYm1semRISmhZMm5EczI0Z1EyVnVkSEpoYkNCa1pTQlRaWEoyDQphV05wYjNNZ1ZISnBZblYwWVhKcGIzTWdZV3dnUTI5dWRISnBZblY1Wlc1MFpUQ0NBaUl3RFFZSktvWklodmNODQpBUUVCQlFBRGdnSVBBRENDQWdvQ2dnSUJBTEJ2dnNhSC9WMGhYdW1QWUFINW5HZW16ekFTQzVuUUkxclQwaWI4DQptM016SmxXMWZBN1l6eHBDU3A4NEZoV1hhU2ZQTjJVVmhTaHpnZExTTGJRMWwxd1FjSnJFazJUYTJoYjc2cGxaDQpreFBzbHVNeDh3d1U4elQwMDhFNUZ2eldQRDNJcUkzTnZBQjBJckRqN1loTXMwT1I1M0Zwai81elRBbHRXbG44DQpGZ2U0elRyazZVVmcvREhFMC9tSm9Zc0hmcmJ3WE03eEJCTHRNcWRDbmIyK0NUdnpkVmd3N2E3MldCemlheU9rDQpSWko2L2loNDQ4NThjMGo5Mm1FL0xiRCs4Ym1GRzQrYU1JQzF5c2FNaEZnV0JSNjBBQWhlN1duaVdGL2FFZ0g4DQpwWTROOGR2dC82TE5hWDNXRlRxdEtoL3FlOC9aU3J2eWVvSTEybU53bFN3ZlhrTFZvbXFSQnM1cFNHQzRLUGt1DQo5Rlo5Z1Z4RVR2c2U1TlU4ZEpNSmE0dzA0OGZKYmgwUTQweDQrcUZSWVRMT1Y4bnIrT1c2d1FBZEI0Z1BDR2k0DQpUS0JRaXpXYi9BNDVpVGU1OHFhUDQyNDFWOVJBaHg4bGo3TDl2Q2dGYVdkZXlOblRLUEpJMTViRU5QaVgyeThNDQpqVmNrN2ljV2l4RFBSNTE4b3RKVXRVaTZQODEzem9yWG9uY0VKZnhGSW5aaks3bTUyTWFBbVNGNURvZEh6dCtaDQpFWTV1b3ZWS1FneGZVRk5FdGJra3BjSWdISjFOUkFiNVhYeUNpMy81VXk5U3BYZHFERmRxU3ZGZ1djeDB1YXFwDQpjYVRGaGJQcjlTeVE4TmsvZUc0dEhYTGR0OThJNkMzdEdvYTBVRjFlRFNET3BIVUxTYUhWRHJ4VzYxRmFiL0J4DQpQSmV6QWdNQkFBR2pnZ0ZCTUlJQlBUQ0I5d1lEVlIwakJJSHZNSUhzZ0JSVlU1dWd3K01HZnRGV1FJT2hmMzczDQpYMFJaZDZHQnZhU0J1akNCdHpFTE1Ba0dBMVVFQmhNQ1RWZ3hHVEFYQmdOVkJBZ01FRVJwYzNSeWFYUnZJRVpsDQpaR1Z5WVd3eEV6QVJCZ05WQkFjTUNrTjFZWFZvZEdWdGIyTXhHREFXQmdOVkJBb01EMEpoYm1OdklHUmxJRTFsDQplR2xqYnpFbE1DTUdBMVVFQXd3Y1FXZGxibU5wWVNCU1pXZHBjM1J5WVdSdmNtRWdRMlZ1ZEhKaGJERTNNRFVHDQpDU3FHU0liM0RRRUpBZ3dvVW1WemNHOXVjMkZpYkdVZ1NtOXpaU0JCYm5SdmJtbHZJRWhsY201aGJtUmxlaUJCDQplWFZ6YjRJVU1EQXdNREF3TURBd01EQXdNREF3TURBd01ESXdIUVlEVlIwT0JCWUVGR294dk5YMVlGM240WTZQDQpLTXVobmNHNkxVeE5NQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUF3RGdZRFZSMFBBUUgvQkFRREFnSDJNQTBHDQpDU3FHU0liM0RRRUJDd1VBQTRJQlhRQVNuSENLRnRNeGlmTC9GVjlTcXNBU2V1SlhvTzlyZDc3dGN2NW1CSTZGDQpudXJBTkRzOTVQcmtVWUlYbzl4UzBaOU9kUXhvem1YUGtoL2JCWm95UmNnaU5yMUNvV3NiaUF6eElmdlM0eWRjDQo5OE9aRjNHMUJjS0R1WWMrek8zSEV5RHpQWU5NbHFGNjQrOXRjcHB0UVk0anJlWERDM2xxcktjMGhaNndMNFFLDQpMRXZURTdBT25MT0JRYXVVbDlablBtNnVFTjlBV2tJcXU1WklFVzFGTDZjUnJTOUhFZUJOejN2aWFUNEt6ZDNsDQp3Sm1NSzAveUdBS2pSV1h3bnJ1bmNJcEpYN0xMQncrdHpkVVZDbGpXOGpMZHdpTTFXNGdYazNDSjZPRGpudUx6DQp2UVNkN0RyMmUrOHF1d2pTV2pGb3J5NEk2Y0YwRUpLU1hwOXA1c3pMVW9iNVZJK0hsUm1vQndkeGtMZ3RvTGxQDQp0VjZzWjBKZDZKRW9wNERaN1J6M25NSjJIcWRnUzF2QzRTUVVyTUR4SzBqT2hCMUExTWhzRVdkelVYYUZJalhODQpGeUUvUFI4UUtpU25Ca29ZZHFFN21FQjZVTUhQRS9OSDJQanNUdkk9DQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tDQo=\r\n-----END CERTIFICATE-----\r\n"
    );
    this.mapcerts.set(
      "AC-Sat1106.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlJeWpDQ0JyS2dBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFeE1EWXdEUVlKS29aSWh2Y05BUUVMDQpCUUF3Z2dFUk1Rc3dDUVlEVlFRR0V3Sk5XREVOTUFzR0ExVUVDQk1FUTBSTldERVRNQkVHQTFVRUJ4TUtRMVZCDQpWVWhVUlUxUFF6RVlNQllHQTFVRUNoTVBRa0ZPUTA4Z1JFVWdUVVZZU1VOUE1RMHdDd1lEVlFRTEV3UkhWRk5RDQpNU1V3SXdZRFZRUURFeHhCUjBWT1EwbEJJRkpGUjBsVFZGSkJSRTlTUVNCRFJVNVVVa0ZNTVJJd0VBWUdkWWhkDQpqelVmRXdaR01EazJOalV4RVRBUEJnWjFpRjJQTlJFVEJUQTJNREF3TVJjd0ZRWUdkWWhkanpVVEV3czFJRVJGDQpJRTFCV1U4Z01qRW9NQ1lHQ1NxR1NJYjNEUUVKQWhNWlNsVkJUaUJCVGxSUFRrbFBJRkpQUTBoQklGWkJURVJGDQpXakVrTUNJR0NTcUdTSWIzRFFFSkFSWVZZWEpBYVdWekxtSmhibmhwWTI4dWIzSm5MbTE0TUI0WERURTVNRFV3DQpNekUyTVRrd09Wb1hEVEkzTURVd016RTJNVGt3T1Zvd2dnR0VNU0F3SGdZRFZRUUREQmRCVlZSUFVrbEVRVVFnDQpRMFZTVkVsR1NVTkJSRTlTUVRFdU1Dd0dBMVVFQ2d3bFUwVlNWa2xEU1U4Z1JFVWdRVVJOU1U1SlUxUlNRVU5KDQpUMDRnVkZKSlFsVlVRVkpKUVRFYU1CZ0dBMVVFQ3d3UlUwRlVMVWxGVXlCQmRYUm9iM0pwZEhreEtqQW9CZ2txDQpoa2lHOXcwQkNRRVdHMk52Ym5SaFkzUnZMblJsWTI1cFkyOUFjMkYwTG1kdllpNXRlREVtTUNRR0ExVUVDUXdkDQpRVll1SUVoSlJFRk1SMDhnTnpjc0lFTlBUQzRnUjFWRlVsSkZVazh4RGpBTUJnTlZCQkVNQlRBMk16QXdNUXN3DQpDUVlEVlFRR0V3Sk5XREVaTUJjR0ExVUVDQXdRUTBsVlJFRkVJRVJGSUUxRldFbERUekVUTUJFR0ExVUVCd3dLDQpRMVZCVlVoVVJVMVBRekVWTUJNR0ExVUVMUk1NVTBGVU9UY3dOekF4VGs0ek1Wd3dXZ1lKS29aSWh2Y05BUWtDDQpFMDF5WlhOd2IyNXpZV0pzWlRvZ1FVUk5TVTVKVTFSU1FVTkpUMDRnUTBWT1ZGSkJUQ0JFUlNCVFJWSldTVU5KDQpUMU1nVkZKSlFsVlVRVkpKVDFNZ1FVd2dRMDlPVkZKSlFsVlpSVTVVUlRDQ0FpSXdEUVlKS29aSWh2Y05BUUVCDQpCUUFEZ2dJUEFEQ0NBZ29DZ2dJQkFNREFOdjJyb01NcVZRVXBGZUtOR28xU0dKUnNwNXhFak8vWmpDVjgwZmRFDQovRlFMUDNlV25wcUowUGlBS2E0ekRRejhFNUVLMnpjeW0vTlNNUjFNV1JQak41ZDRaSGg0WXN1NGlySWo0dDFUDQoxRFF5Z1J0UVA4S01vZk5OSVM0WGFQOExBLzJiejMzcWhoYjBvNDBWU21YN0xnTmNkYlpad1lCUGM0dGtPK1ZvDQpFUHZubjhTTHljRkFDbWdiMjh4ZDduTVpQbVdvbElZMTFaeWtmM2dNWThydlhWWWZOck1RcEpISk5qTUg1S2hMDQpsdWhpVjRKQzl4Y2dxaGFPMnJKWDQzRDNFajhaNVNEV0kzQ1ZxZHQ4UndSTWZaYUdDTjhKcWpOeW5tMGFvZUlvDQpRbWxlb3dLcVF2NFRDbHNxZ3lCb0cxN1Q3b2tGSXNZQzdlSFNWUjMvQUNiV0VFVXpYTnNWaXo3SHJmQ3psRURxDQpBNlllYVcxWk1iVytPNDJRSURKeDgvM1N1Q1NRMTl1cFh2a0p1VmNnN21STnFXRFJrV2t5YXlXUllWVVVsMklwDQpSR0Nncm1aUGpjMEMyeTNYeDVNSENib0NWL3FzaFlTN0pQTTNHcmg4clVoOVFvdEthR0JYanMySGxtY20rRXpjDQpySGd3YTRERURHc3phbm8wY0tLcks3c0dFSjgvQVhNODhWcFpBUmx6eFRWWTBOZ0ZCOUV4clNyNW9UbEx0NzJtDQppRkQrd2Z1YyttRVFJZ2huQytHNUJKUmVpTXIwM2hxUUcwR0xTc0FIWjg5cjBLamxFODA0OTFDRVljekd1QzdSDQpnbWJIaW5taHE1NElidVdjaWhhQVFnaGdtVStiK2RiaHoyMUY5SFlrQ1MyTTBDeER4dTZneXI1cUNNZ0crVTJsDQpBZ01CQUFHamdnR2hNSUlCblRDQ0FWWUdBMVVkSXdTQ0FVMHdnZ0ZKZ0JSdnNKZVdQS0FPVnlkVTlzQ1NOb1I3DQpnTkpCYWFHQ0FSbWtnZ0VWTUlJQkVURUxNQWtHQTFVRUJoTUNUVmd4RFRBTEJnTlZCQWdUQkVORVRWZ3hFekFSDQpCZ05WQkFjVENrTlZRVlZJVkVWTlQwTXhHREFXQmdOVkJBb1REMEpCVGtOUElFUkZJRTFGV0VsRFR6RU5NQXNHDQpBMVVFQ3hNRVIxUlRVREVsTUNNR0ExVUVBeE1jUVVkRlRrTkpRU0JTUlVkSlUxUlNRVVJQVWtFZ1EwVk9WRkpCDQpUREVTTUJBR0JuV0lYWTgxSHhNR1JqQTVOalkxTVJFd0R3WUdkWWhkanpVUkV3VXdOakF3TURFWE1CVUdCbldJDQpYWTgxRXhNTE5TQkVSU0JOUVZsUElESXhLREFtQmdrcWhraUc5dzBCQ1FJVEdVcFZRVTRnUVU1VVQwNUpUeUJTDQpUME5JUVNCV1FVeEVSVm94SkRBaUJna3Foa2lHOXcwQkNRRVdGV0Z5UUdsbGN5NWlZVzU0YVdOdkxtOXlaeTV0DQplSUlVTURBd01EQXdNREF3TURBd01EQXdNREF3TURRd0hRWURWUjBPQkJZRUZOOXAzQWwyNkNaUTMyODMzdDRVDQpyTExua0Nrak1CSUdBMVVkRXdFQi93UUlNQVlCQWY4Q0FRQXdEZ1lEVlIwUEFRSC9CQVFEQWdIMk1BMEdDU3FHDQpTSWIzRFFFQkN3VUFBNElDQVFCd1p2bnNpMEpyRDVXdFBrSERiQmRYTStJcHFudUV4Zyt0ZzJBeG10SFJ6SFhHDQpSakRYR0VsSFlSYVFKM3F6VE5UQ0UyVC9jQlZvZFd0aGhoU2l2a1BCaHRKZC9FVm16MmJiMVFFT3Q5QWg3b2c0DQo3MEFjZHFKY1ZmYXdrSG5xSkkwNktuUndwOER3RXZxYnYyR1M5R0xOK2VZcktnbVJlODRpM2NrRHlhTFNaS01YDQpmK1BkZDdCQmtZVFdGVnFyTlF0VzRodmhQcGhWdWpvTGo0WnhsMXp1OHI0L1ZyV3FiSVQrS2Roc0tpd0JrMldoDQpGSHFVQjZNU09qSUE0bk42ZjJvVmFBTjd2Tm5PSWs4VG1XUDNYK3hCcngvdTN1NnY4KzNtVWY2WVRQN05hYkV5DQpwVk01NXlIRzU3eE5qejN5L1ppZVBhaXUrS2FsaStKR0RFeThZOS82MitPWkxSQnVta2x1WmJ5czdxaUtwa3VzDQpwaHNBaU1CSFhrRU9PRk4xcld6SkpOb0l4SUh2RHlEWjlyaGpkVGQzY1BteG9QVlhpRjVIZ21VQ0QwVlN1aS9ODQpFTVNRQmMyc1ZlalVvS294Qm5XL1hZeXpSMzNGS1p1Mlp2emszU0NMaUU2MXpwUFVibzQ5bVJPWE1zSE1QMGluDQpzZ05FdS9KdXppMzhuVWxsTGxQRU9NMFhhckVrL2pKdGkrdDJyWWdFazZZdUNiUlMwNFBxTWl1WTlnVWlKK0EzDQpOZGlwaVZLR25ScDdHVEZvSzNrRmZZdmtzdWIrMXl4aEg5UWZId2dBbVl4bVJPajZGaEdPWmk3WnNVeUJQUDE2DQpQZzF1WGtadkgwVUh4ekpVNnBDMGthU0JjYUxxNmdFSXlSWlA2Und0dDRVbXpJOUVKTnFJYTlON1UxazJHUT09DQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tDQo=\r\n-----END CERTIFICATE-----\r\n"
    );
    this.mapcerts.set(
      "AC1-Sat1044.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlHQ0RDQ0JQQ2dBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFd05EUXdEUVlKS29aSWh2Y05BUUVGDQpCUUF3ZnpFWU1CWUdBMVVFQ2d3UFFtRnVZMjhnWkdVZ1RXVjRhV052TVFzd0NRWURWUVFHRXdKTldERWxNQ01HDQpBMVVFQXd3Y1FXZGxibU5wWVNCU1pXZHBjM1J5WVdSdmNtRWdRMlZ1ZEhKaGJERXZNQzBHQTFVRUN3d21TVzVtDQpjbUZsYzNSeWRXTjBkWEpoSUVWNGRHVnVaR2xrWVNCa1pTQlRaV2QxY21sa1lXUXdIaGNOTURneE1ERTJNVGd5DQpPVFF3V2hjTk1USXhNREkzTVRneU9UUXdXakNDQVU4eE9EQTJCZ05WQkFNTUwwRXVReTRnWkdWc0lGTmxjblpwDQpZMmx2SUdSbElFRmtiV2x1YVhOMGNtRmphY096YmlCVWNtbGlkWFJoY21saE1TOHdMUVlEVlFRS0RDWlRaWEoyDQphV05wYnlCa1pTQkJaRzFwYm1semRISmhZMm5EczI0Z1ZISnBZblYwWVhKcFlURWZNQjBHQ1NxR1NJYjNEUUVKDQpBUllRWVdOdlpITkFjMkYwTG1kdllpNXRlREVtTUNRR0ExVUVDUXdkUVhZdUlFaHBaR0ZzWjI4Z056Y3NJRU52DQpiQzRnUjNWbGNuSmxjbTh4RGpBTUJnTlZCQkVNQlRBMk16QXdNUXN3Q1FZRFZRUUdFd0pOV0RFWk1CY0dBMVVFDQpDQXdRUkdsemRISnBkRzhnUm1Wa1pYSmhiREVUTUJFR0ExVUVCd3dLUTNWaGRXaDBaVzF2WXpFVk1CTUdBMVVFDQpMUk1NVTBGVU9UY3dOekF4VGs0ek1UVXdNd1lKS29aSWh2Y05BUWtDRENaU1pYTndiMjV6WVdKc1pUb2dRMlZ6DQpZWElnVEhWcGN5QlFaWEpoYkdWeklGUmxiR3hsZWpDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDDQpBUW9DZ2dFQkFOd3daRTAxb2FPYy9aVFBJRDNUYnhzSEpDT2F6a2JqZ0puQ0dOTThvL2daR1VLVUNNenJRMndFDQpxUDhXLzZLTmhML29MRXN5TkZRNWNqZkdGQXBCRFd2VXhXSkhieTFZbGZHWXVqa25tOEQrK0FMdXNVSmNwV0krDQpsdTU4QkVyMWl2dnBlOS9SaVNBdHI4OVl4VzN5c256VzlrU2pzU05Cc0hGdjNCSWpXREtMWGdIZS92Rm1FcVNIDQpTNitDd1VxYUx4dThScVo1Q2d2ZEdrVWR0R25wNG1LRUtDTmtTWWdiZ3krUkhwNmhFcXF4NXFRQUttSTJ1ZUI3DQp2bWdmU3hGcEVoa0g3aDJKYU05QVNuZGFhSVljQkhDQXp5ZHRvK2RJTmlkMml1KzZhZ3puL2k4V25iV2FLYURHDQo0RWhuLzJsb0cwNlQ3OGZmMk1kcGhPSDRIa3h5NVNrQ0F3RUFBYU9DQWFnd2dnR2tNQjBHQTFVZEVnUVdNQlNCDQpFbWxsYzBCaVlXNTRhV052TG05eVp5NXRlREFiQmdOVkhSRUVGREFTZ1JCaFkyOWtjMEJ6WVhRdVoyOWlMbTE0DQpNSUcrQmdOVkhTTUVnYll3Z2JPQUZCVUdqcHNrQXdSL1RzNHNEM3MzRjRIc1B3UGpvWUdFcElHQk1IOHhHREFXDQpCZ05WQkFvTUQwSmhibU52SUdSbElFMWxlR2xqYnpFTE1Ba0dBMVVFQmhNQ1RWZ3hKVEFqQmdOVkJBTU1IRUZuDQpaVzVqYVdFZ1VtVm5hWE4wY21Ga2IzSmhJRU5sYm5SeVlXd3hMekF0QmdOVkJBc01Ka2x1Wm5KaFpYTjBjblZqDQpkSFZ5WVNCRmVIUmxibVJwWkdFZ1pHVWdVMlZuZFhKcFpHRmtnaFF3TURBd01EQXdNREF3TURBd01EQXdNREF3DQpNVEFkQmdOVkhRNEVGZ1FVMlJsaEdyeC9DVDkvOWZrTVNoMS9scitZcWhrd0VnWURWUjBUQVFIL0JBZ3dCZ0VCDQovd0lCQURBT0JnTlZIUThCQWY4RUJBTUNBUVl3S2dZRFZSMGZCQ013SVRBZm9CMmdHNFlaYUhSMGNEb3ZMM2QzDQpkeTV6WVhRdVoyOWlMbTE0TDJOeWJEQTJCZ2dyQmdFRkJRY0JBUVFxTUNnd0pnWUlLd1lCQlFVSE1BR0dHbWgwDQpkSEE2THk5M2QzY3VjMkYwTG1kdllpNXRlQzl2WTNOd01BMEdDU3FHU0liM0RRRUJCUVVBQTRJQkFRQUdVa0s4DQpEUWhUVDI5UGJKNWE1ZmczZjd2ZmxNSzlXQ0JOUm05SVJkWFIxT1owZEFWMEJMNlcyODZFenhSS3FrWEdHWkdODQpjOHFVQ3ZkVXJzOTRRYUNJTmZRVzJ4UGpWT3gvUEttYS9ObGJhT3M5eW9PNGs1RXRTSEVST1lUaitFb2lUc2hvDQpvNjJ0ZDJvdUF3NEZQejVPVGFVRUhJUlgvWmY5UmYvYS8xY1dlc3JMV253N0RQcmYrOWZ6d1lVbnV2REtvVmJJDQpuRk1Tejhwdkx5Y3NQcEdKL3VycW9TcUEva1FlWi9IOW1IME5NM3JhQkZ2am16UmNVVXFMVmhoMHRFenQ3S1JaDQpIeWEyMmI5Q2pJTHRVd2dHODB4N1d1WFRYZWlGWWFiTEYrWmR6bFdOdW5sYnhTY3M4RzJQZ2NUVytCMVpESjE3DQprcDhLRmF3RnYzbWFwMzdLDQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tDQo=\r\n-----END CERTIFICATE-----\r\n"
    );
    this.mapcerts.set(
      "AC2-Sat1043.crt",
      "-----BEGIN CERTIFICATE-----\r\nLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlGN3pDQ0JOZWdBd0lCQWdJVU1EQXdNREF3TURBd01EQXdNREF3TURFd05ETXdEUVlKS29aSWh2Y05BUUVGDQpCUUF3ZnpFWU1CWUdBMVVFQ2d3UFFtRnVZMjhnWkdVZ1RXVjRhV052TVFzd0NRWURWUVFHRXdKTldERWxNQ01HDQpBMVVFQXd3Y1FXZGxibU5wWVNCU1pXZHBjM1J5WVdSdmNtRWdRMlZ1ZEhKaGJERXZNQzBHQTFVRUN3d21TVzVtDQpjbUZsYzNSeWRXTjBkWEpoSUVWNGRHVnVaR2xrWVNCa1pTQlRaV2QxY21sa1lXUXdIaGNOTURneE1ERTJNVGd5DQpPVFF3V2hjTk1USXhNREkzTVRneU9UUXdXakNDQVRZeE9EQTJCZ05WQkFNTUwwRXVReTRnWkdWc0lGTmxjblpwDQpZMmx2SUdSbElFRmtiV2x1YVhOMGNtRmphY096YmlCVWNtbGlkWFJoY21saE1TOHdMUVlEVlFRS0RDWlRaWEoyDQphV05wYnlCa1pTQkJaRzFwYm1semRISmhZMm5EczI0Z1ZISnBZblYwWVhKcFlURWZNQjBHQ1NxR1NJYjNEUUVKDQpBUllRWVdOdlpITkFjMkYwTG1kdllpNXRlREVtTUNRR0ExVUVDUXdkUVhZdUlFaHBaR0ZzWjI4Z056Y3NJRU52DQpiQzRnUjNWbGNuSmxjbTh4RGpBTUJnTlZCQkVNQlRBMk16QXdNUXN3Q1FZRFZRUUdFd0pOV0RFWk1CY0dBMVVFDQpDQXdRUkdsemRISnBkRzhnUm1Wa1pYSmhiREVUTUJFR0ExVUVCd3dLUTNWaGRXaDBaVzF2WXpFek1ERUdDU3FHDQpTSWIzRFFFSkFnd2tVbVZ6Y0c5dWMyRmliR1U2SUVabGNtNWhibVJ2SUUxaGNuVERyVzVsZWlCRGIzTnpNSUlCDQpJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBNVpCUS9USzZoZURROGRnMFh6amVrTDJBDQpzV3FEMkJiQ3lEQjdrYzNOaFpXQ09HUTJKYXZqZ04rTmEzNEQ5bEtnRklBdnpGeWRuVnp4NXZ4SUpJTmU5RjlEDQo2ZGtwdkNDYmlrcWpQYURpUHExQTdhb2ZJbFE2THIwQmlKRW1va05JVEs3Zkc3VUhZekQ2N2tzRkgrYmR0RklMDQpHRHovU0IrRUhxM2hqUmhRNzQ3d0RxaFFPT0xkZ3pVRXVnWG5ORTVYWXVyTzQvb0NIQ0xWeHNUV3o5OURhd1owDQpmdTJacElHa05WU1o0NGRoM2NyMFc0anJpSW5DdUZncGUzS056bC9PWVRZcTNKQUJ2OWdlRGptT1h2ZnRRWkRoDQplQVFQSDluVXpwb1cvNlU2a2FESVd3NzZxV3lLbE9Ub0c4V1pvdWJhYnhKVVZUN0lVaWkxYWpYdWRVZWkwd0lEDQpBUUFCbzRJQnFEQ0NBYVF3SFFZRFZSMFNCQll3RklFU2FXVnpRR0poYm5ocFkyOHViM0puTG0xNE1Cc0dBMVVkDQpFUVFVTUJLQkVHRmpiMlJ6UUhOaGRDNW5iMkl1Ylhnd2diNEdBMVVkSXdTQnRqQ0JzNEFVRlFhT215UURCSDlPDQp6aXdQZXpjWGdldy9BK09oZ1lTa2dZRXdmekVZTUJZR0ExVUVDZ3dQUW1GdVkyOGdaR1VnVFdWNGFXTnZNUXN3DQpDUVlEVlFRR0V3Sk5XREVsTUNNR0ExVUVBd3djUVdkbGJtTnBZU0JTWldkcGMzUnlZV1J2Y21FZ1EyVnVkSEpoDQpiREV2TUMwR0ExVUVDd3dtU1c1bWNtRmxjM1J5ZFdOMGRYSmhJRVY0ZEdWdVpHbGtZU0JrWlNCVFpXZDFjbWxrDQpZV1NDRkRBd01EQXdNREF3TURBd01EQXdNREF3TURBeE1CMEdBMVVkRGdRV0JCVHB6ZkI3Zk10TVc0ZnNmczlIDQpXVWF2UHFQRE5qQVNCZ05WSFJNQkFmOEVDREFHQVFIL0FnRUFNQTRHQTFVZER3RUIvd1FFQXdJQkJqQXFCZ05WDQpIUjhFSXpBaE1CK2dIYUFiaGhsb2RIUndPaTh2ZDNkM0xuTmhkQzVuYjJJdWJYZ3ZZM0pzTURZR0NDc0dBUVVGDQpCd0VCQkNvd0tEQW1CZ2dyQmdFRkJRY3dBWVlhYUhSMGNEb3ZMM2QzZHk1ellYUXVaMjlpTG0xNEwyOWpjM0F3DQpEUVlKS29aSWh2Y05BUUVGQlFBRGdnRUJBQlhQd2JpUE1sL25jalBUbDJCSlprTGdOS0dnbGxETW5CVnYvZnByDQpwd25tcWNVKzRDdWYrMXhub2RXclY4dnhwd3V6ZE83RmhVcjRPSHZmWTNsZnM2WFEzbWo0d3FVR042REpxYm5tDQpSQ3c0cDZHaUN5cXU5STJpTS9YcEFXVHNHV3B2dHIwOW5WeFJJYmkyVGlpc3dBL1U4ZUovWWZXTDgwOGxjWnJXDQpKUnR4UGViMHhnRzUzc2lZdTBqZ3hDNlVDbWV6VjV1RFlHdVZqTkQzM2k4Rk9QVm82aE9vL3p5YzByRlZYY3QwDQpWNmZ2bTl6N0QvdXJWNFo0VXIyOW5YUGtHb04rY3BjOENyK1E0cDZnTVIyRWUvMjd3ZG8wRWNrQTloNE1qYzJFDQo1Nzc2c0hSM3g5d0xxWWdmSGs1UFVTR2FDc041YlZBeUJQd3dhd0RtUGwxMCtYZz0NCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0NCg==\r\n-----END CERTIFICATE-----\r\n"
    );

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
