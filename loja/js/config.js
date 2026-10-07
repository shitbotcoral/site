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
       destaqueNoSite: "pipico",
     Deixe "" para usar o primeiro produto à venda da lista.
     --------------------------------------------------------------- */
  destaqueNoSite: "navio-pirata",

  /* ---------------------------------------------------------------
     TAXA DO CARTÃO (em %)
     5 = 5% sobre o valor das camisas. A planilha manda a dela
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
  }
};
