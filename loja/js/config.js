/* ==========================================================================
   CONFIGURAÇÃO DA LOJA
   Os textos que aparecem no site ficam em js/textos.js.
   Os produtos ficam em js/produtos.js.
   ========================================================================== */
const LOJA = {

  /* ---------------------------------------------------------------
     DESTAQUE NO SITE
     O id do produto que aparece grande na abertura da loja.
     Use o mesmo id de js/produtos.js. Exemplos:
       destaqueNoSite: "navio-pirata",
       destaqueNoSite: "arruda",
       destaqueNoSite: "pipico",
     Deixe "" para usar o primeiro produto à venda da lista.
     --------------------------------------------------------------- */
  destaqueNoSite: "navio-pirata",

  /* ---------------------------------------------------------------
     TAXA DO CARTÃO (em %)
     5 = 5% sobre o valor total (camisas + frete). A planilha manda a dela
     (Codigo.gs, CONFIG.taxaCartaoPercentual) e ela é a que vale;
     esta só aparece se a planilha não responder. Mantenha as duas iguais.
     --------------------------------------------------------------- */
  taxaCartaoPercentual: 5,

  /* Teto de peças por pedido (evita toque acidental; o estoque é quem limita) */
  maxItens: 30,

  /* Contatos e links */
  whatsapp: "5581994465372",          // só números, com 55 e DDD
  instagram: "https://instagram.com/shitbotcoral",
  mercadoPago: "https://link.mercadopago.com.br/shitbotcoral",

  /* URL do App da Web do Apps Script NOVO (termina em /exec).
     Você recebe ela ao implantar o Codigo.gs (passo a passo no LEIA-ME). */
  scriptUrl: "https://script.google.com/macros/s/AKfycbzkmdPNVlX-ECt0VqDl8ieFTg6SAcX7rTpTPOpYO6tOjbiaPtZPs1Gr9cT5KfRth-KJ/exec",

  /* PIX copia e cola. Com a chave vazia, o site esconde o PIX e oferece só o cartão. */
  pix: {
    chave: "d071f949-a0bb-432e-8ad6-d3659cdb3da8",
    nome: "Gabriel da Silva Marques",
    cidade: "Recife"
  },

  /* ---------------------------------------------------------------
     FRETE AUTOMÁTICO (Saída: Recife/PE)
     - Grande Recife (cidadesRMR): Motoqueiro Fantasma (taxa fixa).
     - Resto do Brasil: Correios (Capital vs. Interior por Estado),
       já com +15% de margem de segurança e +3 dias úteis no prazo.
     - Para mudar o valor de algum estado, edite capital ou interior abaixo.
     --------------------------------------------------------------- */
  frete: {
    taxaMotoqueiro: 10.00,
    adicionalPorCamisaExtra: 5.20, // somado a partir da 3ª camisa no mesmo pacote

    cidadesRMR: [
      "recife", "jaboatao dos guararapes", "olinda", "paulista",
      "camaragibe", "sao lourenco da mata", "abreu e lima",
      "igarassu", "cabo de santo agostinho", "moreno"
    ],

    capitais: [
      "aracaju", "belem", "belo horizonte", "boa vista", "brasilia",
      "campo grande", "cuiaba", "curitiba", "florianopolis", "fortaleza",
      "goiania", "joao pessoa", "macapa", "maceio", "manaus", "natal",
      "palmas", "porto alegre", "porto velho", "recife", "rio branco",
      "rio de janeiro", "salvador", "sao luis", "sao paulo", "teresina", "vitoria"
    ],

    tabelaEstados: {
      "PE": { capital: 10.00, interior: 25.50, prazo: "6 a 9 dias úteis" },

      // NORDESTE
      "AL": { capital: 26.50, interior: 33.50, prazo: "7 a 11 dias úteis" },
      "PB": { capital: 26.50, interior: 33.50, prazo: "7 a 11 dias úteis" },
      "RN": { capital: 28.90, interior: 37.90, prazo: "8 a 12 dias úteis" },
      "SE": { capital: 28.90, interior: 37.90, prazo: "8 a 12 dias úteis" },
      "CE": { capital: 30.90, interior: 41.50, prazo: "8 a 13 dias úteis" },
      "BA": { capital: 30.90, interior: 42.50, prazo: "8 a 13 dias úteis" },
      "PI": { capital: 33.50, interior: 45.90, prazo: "9 a 14 dias úteis" },
      "MA": { capital: 34.50, interior: 49.50, prazo: "9 a 15 dias úteis" },

      // SUDESTE
      "SP": { capital: 30.90, interior: 42.50, prazo: "8 a 12 dias úteis" },
      "RJ": { capital: 32.50, interior: 44.90, prazo: "8 a 13 dias úteis" },
      "MG": { capital: 33.50, interior: 48.50, prazo: "9 a 14 dias úteis" },
      "ES": { capital: 33.50, interior: 45.90, prazo: "9 a 14 dias úteis" },

      // CENTRO-OESTE
      "DF": { capital: 32.50, interior: 41.50, prazo: "8 a 12 dias úteis" },
      "GO": { capital: 34.50, interior: 50.50, prazo: "9 a 14 dias úteis" },
      "MS": { capital: 38.90, interior: 57.50, prazo: "10 a 16 dias úteis" },
      "MT": { capital: 41.50, interior: 63.50, prazo: "11 a 17 dias úteis" },

      // SUL
      "PR": { capital: 33.50, interior: 67.90, prazo: "9 a 15 dias úteis" },
      "SC": { capital: 34.50, interior: 56.50, prazo: "9 a 15 dias úteis" },
      "RS": { capital: 31.90, interior: 57.50, prazo: "9 a 15 dias úteis" },

      // NORTE
      "TO": { capital: 40.50, interior: 60.90, prazo: "11 a 17 dias úteis" },
      "PA": { capital: 40.50, interior: 65.50, prazo: "11 a 18 dias úteis" },
      "AM": { capital: 44.90, interior: 80.50, prazo: "13 a 21 dias úteis" },
      "AP": { capital: 45.90, interior: 74.90, prazo: "13 a 21 dias úteis" },
      "RO": { capital: 48.50, interior: 76.90, prazo: "13 a 21 dias úteis" },
      "RR": { capital: 51.90, interior: 83.90, prazo: "15 a 23 dias úteis" },
      "AC": { capital: 51.90, interior: 83.90, prazo: "15 a 23 dias úteis" }
    }
  }
};