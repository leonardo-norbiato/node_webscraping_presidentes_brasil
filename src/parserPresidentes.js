const rp = require('request-promise');
const $ = require('cheerio');
const dom = require('xmldom').DOMParser;
const xpath = require('xpath');

const xPath_tabela_dados = '/html/body/div[3]/div[3]/div[4]/div/table[1]';

var xPath_nascimento = '/html/body/div[3]/div[3]/div[4]/div/table[1]/tbody/tr[l#inh#a]';

function buscadados(_xPath_linha, doc) {
    let _xPath = `${_xPath_linha}/td[2]`;
    let content = xpath.select(_xPath, doc);
    return content[0].textContent.replace(/\r?\n|\r/g, " ").toString();
}

function contalinhatabela(tabela, atual, profundidade) {
    if (profundidade == 0) { return atual };
    let _maxchield = 2;
    for (let index = 0; index < _maxchield; index++) {
        if (tabela[index].childNodes) {
            if (tabela[index].childNodes.length > 0) {
                atual = tabela[index].childNodes.length;
                return contalinhatabela(tabela[index].childNodes, atual, profundidade - 1);
            }
        }
    }
}

const parserPresidents = async function (url) {
    return await rp(url)
        .then(function (html) {
            let retorno = {
                nome: $('.firstHeading', html).text()
            };
            let max = 0;
            var doc = new dom().parseFromString(html)
            max = contalinhatabela(xpath.select(xPath_tabela_dados, doc), 0, 2);

            for (let i = 0; i < max; i++) {
                let _xPath_linha = xPath_nascimento.replace('l#inh#a', i)
                try {
                    let _xPath_text_nascimento = `${_xPath_linha}/td[1]`;
                    let nodes = xpath.select(_xPath_text_nascimento, doc);
                    if (nodes) {
                        if (nodes[0].textContent) {
                            if (nodes[0].textContent.replace(/\r?\n|\r/g, "").toString() == "Nascimento") {
                                retorno.datanasc = buscadados(_xPath_linha, doc);
                            }
                            if (nodes[0].textContent.replace(/\r?\n|\r/g, "").toString() == "Morte") {
                                retorno.datafalec = buscadados(_xPath_linha, doc);
                            }
                        }
                    }
                } catch (err) {
                    //console.log(err);
                }
            };
            return retorno;
        })
        .catch(function (err) {
            //handle erro
        });
}

module.exports = parserPresidents;