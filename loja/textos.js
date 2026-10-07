/* ==========================================================================
   TEXTOS DA LOJA
   --------------------------------------------------------------------------
   Todo texto que aparece no site está aqui. Troque à vontade, só não apague
   as aspas, as vírgulas do fim das linhas nem o que estiver entre { }.

   O que está entre { } é preenchido sozinho pela loja:
     {nome}  nome do produto        {preco}  preço        {taxa}  taxa do cartão
     {tam}   tamanho                {n}      quantidade   {prazo} entrega prevista
     {valor} valor em reais         {numero} número do pedido
   ========================================================================== */

const TEXTOS = {

  /* ----------------------------------------------------------- ENTREGA
     Mudou o lugar da retirada? É só aqui. */
  entrega: {
    retiradaTitulo: "Retirada",
    retiradaPreco: "Grátis",
    retiradaTexto: "Combinada pelo WhatsApp depois da compra.",
    retiradaPreVenda: "Itens de pré-venda: quando a produção ficar pronta.",
    appTitulo: "Entrega por app",
    appPreco: "Pago no app",
    appTexto: "Uber Flash ou 99 Entrega no seu endereço. O frete é pago no app."
  },

  /* ----------------------------------------------------------- TOPO E RODAPÉ */
  topo: {
    loja: "Loja",
    colecao: "Coleção",
    sacola: "Sacola"
  },
  rodape: {
    cidade: "Recife, Pernambuco.",
    contato: "Pedidos, trocas e dúvidas:",
    whatsapp: "WhatsApp da loja",
    instagram: "Instagram",
    mensagemWhats: "Olá! Estou na loja da Shitbot Coral e preciso de ajuda."
  },

  /* ----------------------------------------------------------- CAPA (abertura do site) */
  capa: {
    letreiro1: "Shitbot",
    letreiro2: "Coral",
    seloPreVenda: "Pré-venda aberta",
    seloProntaEntrega: "Pronta entrega",
    botaoPreVenda: "Garantir a minha",
    botaoProntaEntrega: "Comprar agora",
    botaoColecao: "Ver coleção",
    rolar: "Role para ver tudo",
    maisProdutos: "Mais da loja",       // faixa com os outros produtos, logo abaixo do destaque
    verTudo: "Ver tudo",
    entregaPrevista: "Entrega prevista: {prazo}",
    ultimas: "Últimas {n} peças"
  },

  /* Fita que corre embaixo da capa (adicione ou tire frases à vontade) */
  fita: [
    "PIX copia e cola",
    "Aceitamos cartão de crédito",
    "Retirada grátis",
    "Entrega por app em Recife",
    "É tradição e também é moda!"
  ],

  /* ----------------------------------------------------------- COLEÇÃO */
  colecao: {
    titulo: "Coleção",
    contagem1: "1 produto à venda",
    contagemN: "{n} produtos à venda",
    lancamento: "Tem lançamento chegando.",
    filtroTudo: "Tudo",
    filtroPronta: "Pronta entrega",
    filtroPre: "Pré-venda",
    compraRapida: "Adicionar rápido",
    emBreve: "Em breve",
    esgotado: "Esgotado",
    encerrado: "Encerrado",
    preVendaEncerrada: "Pré-venda encerrada",
    notaEsgotado: "Esgotado em todos os tamanhos.",
    notaEncerrado: "Vendas encerradas.",
    notaUltimas: "Últimas {n} peças.",
    notaPrazo: "Entrega prevista: {prazo}.",
    notaTamanhos: "Tamanhos {tamanhos}."
  },

  /* Os três quadrinhos de "como funciona" no fim da página inicial */
  garantias: [
    { icone: "pix", titulo: "PIX copia e cola", texto: "Valor já preenchido, ou cartão pelo Mercado Pago." },
    { icone: "local", titulo: "Retirada grátis", texto: "Combinada pelo WhatsApp. Ou entrega por app." },
    { icone: "zap", titulo: "Atendimento no WhatsApp", texto: "A gente confirma o pedido e avisa cada etapa." }
  ],

  /* ----------------------------------------------------------- PÁGINA DO PRODUTO */
  produto: {
    migalhaLoja: "Loja",
    seloPreVenda: "Pré-venda",
    seloProntaEntrega: "Pronta entrega",
    precoPix: "no PIX",
    precoCartao: "ou {valor} no cartão",
    entregaPrevista: "Entrega prevista",
    aDefinir: "A definir",
    preVendaAte: "Pré-venda até",
    preVendaEncerraEm: "Pré-venda encerra em",
    fimDoEstoque: "Acabar o estoque",
    tamanho: "Tamanho",
    guiaMedidas: "Guia de medidas",
    medidasLegenda: "Medidas da peça em centímetros, estendida numa superfície plana.",
    adicionar: "Adicionar à sacola",
    adicionado: "Na sacola",
    adicionarCurto: "Adicionar",
    verSacola: "Ver sacola e finalizar",
    escolhaTamanho: "Escolha o tamanho",
    tamanhoEscolhido: "Tamanho {tam} escolhido.",
    conferindo: "Conferindo o estoque…",
    ultimasUnidades: "Últimas unidades em alguns tamanhos.",
    tudoNaSacola: "Você já tem na sacola todas as peças disponíveis.",
    esgotado: "Esgotado em todos os tamanhos.",
    preVendaEncerrada: "A pré-venda foi encerrada.",
    vendasEncerradas: "Vendas encerradas.",
    indisponivel: "Indisponível",
    detalhes: "Detalhes",
    entregaPagamento: "Entrega e pagamento",
    infoPagamento: "PIX copia e cola com o valor já preenchido, ou cartão pelo Mercado Pago (taxa de {taxa}).",
    infoComprovante: "O comprovante é anexado no fim da compra."
  },

  /* ----------------------------------------------------------- SACOLA */
  sacola: {
    titulo: "Sacola",
    vazia: "Sua sacola está vazia. Escolha uma camisa na coleção.",
    verColecao: "Ver a coleção",
    subtotal: "Subtotal, {n}",
    peca: "peça",
    pecas: "peças",
    tamanho: "Tamanho {tam}",
    preVenda: "pré-venda",
    remover: "Remover",
    avisoPreVenda: "Tem pré-venda na sacola: esses itens são entregues depois da produção.",
    finalizar: "Finalizar compra",
    continuar: "Continuar comprando"
  },

  /* ----------------------------------------------------------- FINALIZAR COMPRA */
  checkout: {
    titulo: "Finalizar compra",
    etapas: ["Seus dados", "Entrega", "Pagamento"],
    resumo: "Seu pedido",
    editar: "Editar",
    subtotal: "Subtotal",
    taxaCartao: "Taxa do cartão ({taxa})",
    total: "Total",
    avisoPreVenda: "Itens de pré-venda são entregues depois da produção.",
    voltar: "Voltar",
    voltarLoja: "Voltar para a loja",
    sacolaVazia: "Sacola vazia",
    sacolaVaziaTexto: "Escolha uma camisa na coleção para começar o pedido.",

    dadosTitulo: "Seus dados",
    dadosTexto: "O WhatsApp serve para confirmar o pedido e combinar a entrega.",
    nome: "Nome completo",
    whatsapp: "WhatsApp com DDD",
    whatsappExemplo: "Exemplo: (81) 99999-0000",
    continuar: "Continuar",

    entregaTitulo: "Entrega",
    entregaPergunta: "Como você quer receber?",
    cep: "CEP",
    cepDica: "Preenche rua, bairro e cidade sozinho.",
    naoSeiCep: "Não sei meu CEP",
    rua: "Rua",
    numero: "Número",
    complemento: "Complemento",
    bairro: "Bairro",
    cidade: "Cidade",
    uf: "UF",
    ufDica: "Sigla, ex.: PE",
    opcional: "(opcional)",
    irPagamento: "Ir para o pagamento",

    pagamentoTitulo: "Pagamento",
    pagamentoPergunta: "Como você quer pagar?",
    pix: "PIX",
    pixDescricao: "Copia e cola ou QR Code, com o valor já preenchido.",
    cartao: "Cartão ou saldo Mercado Pago",
    cartaoDescricao: "Taxa de {taxa}. Você digita o valor no link.",
    pixIndisponivel: "O PIX está indisponível no momento. Pague pelo cartão ou fale com a gente no WhatsApp.",
    valorPix: "Valor do PIX",
    instrucaoPix: "No celular, copie o código e cole na área PIX copia e cola do seu banco. No computador, aponte a câmera do celular para o QR Code.",
    copiarPix: "Copiar código PIX",
    pixCopiado: "Código copiado",
    valorCartao: "Valor para digitar no Mercado Pago",
    instrucaoCartao: "Já inclui a taxa de {taxa} do cartão. O link abre em nova aba; depois volte aqui para anexar o comprovante.",
    abrirMercadoPago: "Copiar valor e abrir o Mercado Pago",
    avisoCartao: "O envio acontece depois da compensação no Mercado Pago (pode levar até 7 dias).",
    avisoCartaoPreVenda: "Pedidos no cartão entram na produção depois da compensação no Mercado Pago (pode levar até 7 dias).",
    comprovante: "Comprovante do pagamento",
    comprovanteDica: "Obrigatório. Print, foto ou PDF (até 5 MB).",
    anexar: "Anexar comprovante",
    anexarDica: "Imagem ou PDF",
    trocar: "Toque para trocar",
    finalizar: "Finalizar pedido",
    enviando: "Enviando pedido"
  },

  /* Mensagens de erro dos formulários */
  erros: {
    titulo1: "Falta corrigir 1 item",
    tituloN: "Faltam corrigir {n} itens",
    nome: "Escreva nome e sobrenome.",
    whatsapp: "Digite um celular com DDD, 11 números. Exemplo: (81) 99999-0000.",
    escolhaEntrega: "Escolha retirada ou entrega por app.",
    cep: "O CEP tem 8 números. Corrija ou deixe em branco.",
    rua: "Preencha a rua.",
    numero: "Preencha o número (ou escreva S/N).",
    bairro: "Preencha o bairro.",
    cidade: "Preencha a cidade.",
    uf: "Escreva a UF com 2 letras, ex.: PE.",
    comprovante: "Anexe o comprovante do pagamento.",
    vendasFechadas: "As vendas de {nome} foram fechadas. Tire da sacola para continuar.",
    acabouEstoque: "Acabou o {tam} da {nome} enquanto você comprava. A sacola foi ajustada: confira e finalize de novo. Se já pagou, chame a gente no WhatsApp com o comprovante.",
    naoSalvou: "O pedido não foi salvo: {valor}. Se já pagou, chame a gente no WhatsApp com o comprovante.",
    lojaFora: "Não conseguimos conferir o estoque agora, então ainda não mostramos o PIX. Tente de novo em instantes ou chame a gente no WhatsApp.",
    estoqueAntesPagar: "Algumas peças acabaram enquanto você escolhia e a sua sacola foi ajustada. Confira o resumo e continue.",
    semPlanilha: "A loja ainda não está ligada à planilha. Fale com a gente no WhatsApp para fechar o pedido.",
    semConexao: "Sem conexão com a loja agora. O comprovante continua anexado: tente de novo em instantes. Se já pagou, chame a gente no WhatsApp."
  },

  /* ----------------------------------------------------------- CONFIRMAÇÃO */
  confirmacao: {
    titulo: "Pedido recebido",
    numero: "Número do pedido",
    itens: "Itens:",
    total: "Total:",
    recebimento: "Recebimento:",
    preVenda: "Pré-venda:",
    preVendaTexto: "entrega depois da produção",
    texto: "A gente confere o pagamento e chama você no WhatsApp para combinar a entrega. Guarde o número do pedido.",
    whatsapp: "Falar com a loja no WhatsApp",
    voltar: "Voltar para a loja",
    mensagemWhats: "Olá! Acabei de fazer o pedido {numero} na loja. Quero acompanhar o andamento."
  },

  /* ----------------------------------------------------------- AVISOS (balõezinhos) */
  avisos: {
    naSacola: "{nome}, tamanho {tam}, na sacola. Agora são {n}.",
    saiu: "{nome} tamanho {tam} saiu da sacola.",
    escolhaTamanho: "Escolha um tamanho primeiro.",
    conferindo: "Conferindo o estoque, só um segundinho.",
    tamanhoEsgotado: "O tamanho {tam} está esgotado.",
    semMais: "Não tem mais {tam} disponível.",
    limite: "O limite é de {n} peças por pedido.",
    fechado: "As vendas deste produto estão fechadas.",
    estoqueFora: "Não deu pra conferir o estoque agora. Pode seguir: a gente confere na hora de finalizar.",
    estoqueMudou: "O estoque mudou e a sua sacola foi ajustada. Confira as quantidades.",
    buscandoCep: "Buscando o endereço pelo CEP…",
    cepOk: "Endereço preenchido. Falta o número.",
    cepErro: "Não achamos esse CEP. Preencha o endereço à mão.",
    pixCopiado: "Código PIX copiado. Cole no app do seu banco.",
    pixNaoCopiou: "Não deu pra copiar sozinho. Selecione o código e copie.",
    valorCopiado: "Valor {valor} copiado. Cole no Mercado Pago.",
    comprovanteOk: "Comprovante anexado.",
    imagemRuim: "Não deu pra ler essa imagem. Tente um print ou um PDF.",
    pdfGrande: "PDF grande demais: o máximo é 5 MB.",
    arquivoErrado: "Anexe uma imagem ou um PDF."
  },

  /* ----------------------------------------------------------- PÁGINAS VAZIAS */
  naoEncontrada: {
    titulo: "Não achamos essa página",
    texto: "O produto pode ter saído da loja. Veja o que está à venda agora.",
    botao: "Ver a coleção"
  }
};