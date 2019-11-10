const fs = require('fs-extra');
const path = require('path');
const rp = require('request-promise');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const parserPresidentes = require('./parserPresidentes');

const url = 'https://pt.wikipedia.org/wiki/Lista_de_presidentes_do_Brasil';
let xPath_presidentes = '/html/body/div[3]/div[3]/div[4]/div/table/tbody/tr[l#inha_president#e]/td[2]/b/a'

async function gravarDados(dados, nome_arquivo) {
  const json = JSON.stringify(dados, null, 4);
  let caminho = path.resolve('data', `${nome_arquivo}.json`)
  try {
    await fs.writeFile(caminho, json);

  } catch (error) {
    console.log(error);
  }
}

rp(url)
  .then(async function (html) {
    //success!
    var doc = new dom().parseFromString(html)
    let xPath_table_presidentes = '/html/body/div[3]/div[3]/div[4]/div/table/tbody'
    let max = xpath.select(xPath_table_presidentes, doc)[0].childNodes.length;

    const wikiUrls = [];
    for (let i = 3; i < max; i++) {
      try {
        let xPath_presidente = xPath_presidentes.replace('l#inha_president#e', i);
        var nodes = xpath.select(xPath_presidente, doc);
        if (nodes[0].attributes) {
          let nome = 1;
          if (nodes[0].attributes.length > 2) {
            nome = 2;
          }
          let wiki = { nome: nodes[0].attributes[nome].textContent, url: nodes[0].attributes[0].textContent }
          wikiUrls.push(wiki);
        }
      } catch (error) {
        //console.log(error);
      }
    }
    return Promise.all(
      wikiUrls.map(function (wiki) {
        if (typeof wiki.url == 'string') {
          return parserPresidentes('https://pt.wikipedia.org' + wiki.url);
        }
      })
    );
  })
  .then(async function (presidentes) {
    await gravarDados(presidentes,'presidentes');
  })
  .catch(function (err) {
    //console.log(err);
  });