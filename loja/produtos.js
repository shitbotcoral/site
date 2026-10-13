/* ==========================================================================
   PRODUTOS DA LOJA
   --------------------------------------------------------------------------
   Cada produto é um bloco { ... }. Para lançar um novo:
     1. Crie a pasta loja/produtos/<id>/ com as fotos 1.png, 2.png...
        (aceita .png, .webp, .jpg e .jpeg; a 1 é a capa)
     2. Copie um bloco abaixo e troque o id (igual ao nome da pasta) e os textos.
     3. Na planilha, aba "Produtos", crie a linha com o MESMO id.
   Para colocar o produto na abertura do site: js/config.js > destaqueNoSite.

   ▸ tipo      "pronta-entrega"  ou  "pre-venda"
               Chegou a camisa? Troque "pre-venda" por "pronta-entrega" e pronto:
               somem a entrega prevista e os avisos de produção, no site e na
               mensagem do WhatsApp.
   ▸ status    "ativo" (à venda) | "em-breve" (aparece sem compra)
               "encerrado" (aparece fechado) | "oculto" (não aparece)
   ▸ tema      "escuro" (palco preto) ou "claro" (palco branco)
   ▸ ajuste    "conter" para PNG recortado (a camisa flutua)
               "cobrir" para foto com cenário (ocupa o quadro todo)
   ▸ preco     só aparece enquanto a planilha não responde; o que vale é
               o PREÇO da aba Produtos.
   ========================================================================== */

const PRODUTOS = [
  {
    id: "navio-pirata",
    nome: "Navio Pirata",
    categoria: "Camisa",
    tipo: "pre-venda",
    status: "ativo",
    tema: "escuro",
    ajuste: "conter",
    preco: 149.90,
    tamanhos: ["P", "M", "G", "GG", "XG", "XXG"],
    fotos: [
      { arquivo: "1", alt: "Camisa Navio Pirata do Arruda, frente" },
      { arquivo: "2", alt: "Camisa Navio Pirata do Arruda, costas" }
    ],
    // Texto curto embaixo do preço. Pode ter um para cada tipo; o site usa o do tipo atual.
    resumo: {
      "pre-venda": "A camisa ainda vai ser produzida. Você garante a sua agora e recebe quando a produção ficar pronta.",
      "pronta-entrega": "Pronta entrega. Retire grátis ou receba por app no seu endereço."
    },
    entregaPrevista: "16 de outubro",   // só aparece na pré-venda
    encerraEm: "",                      // ex.: "2026-10-10T23:59:00-03:00" mostra contagem regressiva
    detalhes: [
      "Retirada grátis ou entrega por app, combinadas pelo WhatsApp",
      "A gente avisa cada etapa do pedido pelo WhatsApp"
    ],
    medidas: null                       // modelo no fim do arquivo
  },
  {
    id: "pipico",
    nome: "Pipico",
    categoria: "Camisa",
    tipo: "pronta-entrega",
    status: "ativo",
    tema: "claro",
    ajuste: "conter",
    preco: 99.90,
    tamanhos: ["P", "M", "G", "GG", "XG", "XXG"],
    fotos: [
      { arquivo: "1", alt: "Camisa Pipico, frente" },
      { arquivo: "2", alt: "Camisa Pipico, costas" }
    ],
    resumo: "Pronta entrega. Retire grátis ou receba por app no seu endereço.",
    detalhes: [
      "Pronta entrega",
      "Retirada grátis ou entrega por app, combinadas pelo WhatsApp"
    ],
    medidas: null
  },
  {
    // Vaga do próximo lançamento. Troque pelo produto real ou mude status para "oculto".
    id: "proximo",
    nome: "Próximo lançamento",
    categoria: "Em breve",
    tipo: "pre-venda",
    status: "em-breve",
    tema: "escuro",
    preco: 0,
    tamanhos: [],
    fotos: [],
    resumo: "Tem coisa nova vindo. Siga a gente no Instagram para saber primeiro."
  }
];

/* --------------------------------------------------------------------------
   MODELO DE TABELA DE MEDIDAS (opcional, por produto)
   Meça a peça estendida numa mesa, em centímetros. Quando existir,
   a página do produto mostra o "Guia de medidas".

   medidas: {
     colunas: ["Largura (cm)", "Comprimento (cm)"],
     linhas: { P: [50, 70], M: [53, 72], G: [56, 74], GG: [59, 76], XG: [62, 78], XXG: [65, 80] }
   }
   -------------------------------------------------------------------------- */
