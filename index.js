const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(pecas, apre) {
  return pecas[apre.id];
}

function calcularTotalApresentacao(pecas, apre) {
    switch (getPeca(pecas, apre).tipo) {
      case "tragedia": {
    let total = 40000;
    if (apre.audiencia > 30) {
      total += 1000 * (apre.audiencia - 30);
    } 
    return total;
      }
      case "comedia": {
    let total = 30000;
    if (apre.audiencia > 20) {
      total += 10000 + 500 * (apre.audiencia - 20);
    }
    total += 300 * apre.audiencia;
    return total;
      }
      default:
    throw new Error(`Peça desconhecia: ${getPeca(pecas, apre).tipo}`);
    }
}

function calcularCredito(pecas, apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas, apre).tipo === "comedia") 
     creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function calcularTotalCreditos(pecas, apresentacoes) {
  let creditos = 0;
  for (let apre of apresentacoes) {
    creditos += calcularCredito(pecas, apre);
  }
  return creditos;
}

function calcularTotalFatura(pecas, apresentacoes) {
  let totalFatura = 0;
  for (let apre of apresentacoes) {
    totalFatura += calcularTotalApresentacao(pecas, apre);
  }
  return totalFatura;
}

function gerarFaturaStr (fatura, pecas) {
    // corpo principal
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
