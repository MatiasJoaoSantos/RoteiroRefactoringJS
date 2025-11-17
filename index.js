const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(pecas, apre) {
  return pecas[apre.id];
}

class ServicoCalculoFatura {

   calcularTotalApresentacao(pecas, apre) {
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

   calcularCredito(pecas, apre) {
     let creditos = 0;
     creditos += Math.max(apre.audiencia - 30, 0);
     if (getPeca(pecas, apre).tipo === "comedia") 
        creditos += Math.floor(apre.audiencia / 5);
     return creditos;   
   }

   calcularTotalCreditos(pecas, apresentacoes) {
     let creditos = 0;
     for (let apre of apresentacoes) {
       creditos += this.calcularCredito(pecas, apre);
     }
     return creditos;
   }

   calcularTotalFatura(pecas, apresentacoes) {
     let totalFatura = 0;
     for (let apre of apresentacoes) {
       totalFatura += this.calcularTotalApresentacao(pecas, apre);
     }
     return totalFatura;
   }
}

function gerarFaturaStr (fatura, pecas, calc) {
    // corpo principal
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
}

function gerarFaturaHTML (fatura, pecas, calc) {
    // let faturaHTML = `<html>\n`;
    // faturaHTML += `<p> Fatura ${fatura.cliente} </p>\n`;
    // faturaHTML += `<ul>\n`;
    // for (let apre of fatura.apresentacoes) {
    //     faturaHTML += `<li>  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
    // }
    // faturaHTML += `</ul>\n`;
    // faturaHTML += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
    // faturaHTML += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
    // faturaHTML += `</html>\n`;
    // return faturaHTML;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);
// const faturaHTML = gerarFaturaHTML(faturas, pecas, calc);
// console.log(faturaHTML);
