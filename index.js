const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

class ServicoCalculoFatura {

   constructor(repo) {
     this.repo = repo;
   }

   calcularTotalApresentacao(apre) {
       switch (this.repo.getPeca(apre).tipo) {
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
       throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
       }
   }

   calcularCredito(apre) {
     let creditos = 0;
     creditos += Math.max(apre.audiencia - 30, 0);
     if (this.repo.getPeca(apre).tipo === "comedia") 
        creditos += Math.floor(apre.audiencia / 5);
     return creditos;   
   }

   calcularTotalCreditos(apresentacoes) {
     let creditos = 0;
     for (let apre of apresentacoes) {
       creditos += this.calcularCredito(apre);
     }
     return creditos;
   }

   calcularTotalFatura(apresentacoes) {
     let totalFatura = 0;
     for (let apre of apresentacoes) {
       totalFatura += this.calcularTotalApresentacao(apre);
     }
     return totalFatura;
   }
}

function gerarFaturaStr (fatura, calc) {
    // corpo principal
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
    return faturaStr;
}

function gerarFaturaHTML (fatura, calc) {
    // let faturaHTML = `<html>\n`;
    // faturaHTML += `<p> Fatura ${fatura.cliente} </p>\n`;
    // faturaHTML += `<ul>\n`;
    // for (let apre of fatura.apresentacoes) {
    //     faturaHTML += `<li>  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos) </li>\n`;
    // }
    // faturaHTML += `</ul>\n`;
    // faturaHTML += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))} </p>\n`;
    // faturaHTML += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} </p>\n`;
    // faturaHTML += `</html>\n`;
    // return faturaHTML;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);
