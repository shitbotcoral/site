/* ==========================================================================
   SHITBOT CORAL — Loja (uma página para todos os produtos)
   Não precisa mexer aqui para trocar textos, produtos ou destaque:
     textos   → js/textos.js
     produtos → js/produtos.js
     destaque, taxa, contatos, PIX → js/config.js
   Rotas:  #/  início · #/p/<id> produto · #/finalizar/<etapa> · #/pedido/<número>
   ========================================================================== */
(() => {
  "use strict";

  // ================================================================ utilidades
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dinheiro = v => brl.format(v || 0).replace(/ /g, " ");
  const r2 = v => Math.round(v * 100) / 100;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const calmo = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ponteiroFino = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const guarda = {
    ler(k, area = localStorage) { try { return JSON.parse(area.getItem(k)); } catch (e) { return null; } },
    gravar(k, v, area = localStorage) { try { area.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
    apagar(k, area = localStorage) { try { area.removeItem(k); } catch (e) { /* */ } }
  };
  const ss = window.sessionStorage;

  // Textos (js/textos.js): t("Olá {nome}", {nome: "Ana"}) → "Olá Ana"
  const T = typeof TEXTOS !== "undefined" ? TEXTOS : {};
  const t = (modelo, v = {}) => String(modelo ?? "").replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const pecas = n => `${n} ${n === 1 ? T.sacola.peca : T.sacola.pecas}`;

  const CATALOGO = (typeof PRODUTOS !== "undefined" ? PRODUTOS : []).filter(p => p.status !== "oculto");
  const porId = id => CATALOGO.find(p => p.id === id);
  const PIX_OK = !!(LOJA.pix && LOJA.pix.chave && !String(LOJA.pix.chave).startsWith("COLE"));
  const resumoDe = p => (p.resumo && typeof p.resumo === "object") ? (p.resumo[p.tipo] || "") : (p.resumo || "");

  // ================================================================ estado
  const st = {
    servidor: { status: "carregando", produtos: {}, taxa: Number(LOJA.taxaCartaoPercentual) || 0 },
    sacola: guarda.ler("sc-sacola") || [],
    cliente: guarda.ler("sc-cliente", ss) || {},
    entrega: guarda.ler("sc-entrega", ss) || null,
    pagamento: PIX_OK ? "pix" : "card",
    txid: guarda.ler("sc-txid", ss),
    comprovante: null,
    tamSel: null
  };
  const salvarSacola = () => guarda.gravar("sc-sacola", st.sacola);

  // ================================================================ produto, preço, estoque
  function encerradoPorData(p) {
    if (!p.encerraEm) return false;
    const x = new Date(p.encerraEm).getTime();
    return !isNaN(x) && Date.now() > x;
  }
  function situacao(p) {
    if (p.status === "em-breve") return "em-breve";
    if (p.status === "encerrado" || encerradoPorData(p)) return "encerrado";
    const sv = st.servidor.produtos[p.id];
    if (st.servidor.status === "ok" && sv && sv.ativo === false) return "encerrado";
    return "ativo";
  }
  function preco(p) {
    const sv = st.servidor.produtos[p.id];
    return st.servidor.status === "ok" && sv && sv.preco > 0 ? sv.preco : p.preco;
  }
  const prazo = p => (p.tipo === "pre-venda" ? (p.entregaPrevista || (st.servidor.produtos[p.id] || {}).prazo || "") : "");
  function estoque(id, tam) {
    if (st.servidor.status === "carregando") return 0;
    if (st.servidor.status === "falhou") return Infinity;   // o servidor confere ao finalizar
    const sv = st.servidor.produtos[id];
    if (!sv) return 0;
    return Math.max(0, Number(sv.estoque[tam] || 0));
  }
  const naSacola = (id, tam) => st.sacola.filter(i => i.produto === id && (!tam || i.tamanho === tam)).reduce((a, i) => a + i.qtd, 0);
  const livre = (id, tam) => estoque(id, tam) - naSacola(id, tam);
  const qtdSacola = () => st.sacola.reduce((a, i) => a + i.qtd, 0);
  const subtotal = () => r2(st.sacola.reduce((a, i) => a + i.qtd * preco(porId(i.produto) || { preco: 0 }), 0));
  // Taxa do cartão em %: 5 → 5% do valor das camisas
  const taxaPct = () => st.servidor.taxa;
  const taxaTexto = () => `${String(taxaPct()).replace(".", ",")}%`;
  const taxaDe = v => Math.round(v * taxaPct()) / 100;   // mesma conta do Apps Script
  const comTaxa = v => r2(v + taxaDe(v));
  const taxa = () => st.pagamento === "card" ? taxaDe(subtotal()) : 0;
  const total = () => r2(subtotal() + taxa());
  const temPreVenda = () => st.sacola.some(i => (porId(i.produto) || {}).tipo === "pre-venda");
  const estoqueTotalLivre = p => (p.tamanhos || []).reduce((a, x) => a + Math.max(0, livre(p.id, x)), 0);
  const prazosNaSacola = () => [...new Set(st.sacola.map(i => porId(i.produto)).filter(p => p && p.tipo === "pre-venda").map(prazo).filter(Boolean))];
  const comPrazos = (frase, prazos) => prazos.length ? frase.replace(/\.$/, "") + ` (${prazos.join(", ")}).` : frase;

  // ================================================================ imagens
  const EXTS = ["png", "webp", "jpg", "jpeg"];
  const FOTO_VAZIA = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460"><path d="M140 70l-70 40 25 60 30-14v234h150V156l30 14 25-60-70-40c-10 22-30 34-60 34s-50-12-60-34z" fill="none" stroke="#8a8b93" stroke-width="5" stroke-linejoin="round" stroke-dasharray="12 10"/></svg>');
  const caminhoFoto = (p, f) => `produtos/${p.id}/${typeof f === "string" ? f : f.arquivo}`;
  const altFoto = (p, f, i) => (typeof f === "object" && f.alt) || `${p.categoria || ""} ${p.nome}, foto ${i + 1}`.trim();
  // decorativa = true quando a foto só repete o texto ao lado (alt vazio para o leitor de tela)
  function imgTag(p, i, extra = "", decorativa = false) {
    const f = (p.fotos || [])[i];
    const ajuste = p.ajuste === "cobrir" ? "cobrir" : "";
    if (!f) return `<img src="${FOTO_VAZIA}" alt="" ${extra}>`;
    const attrs = /class="/.test(extra) ? extra.replace('class="', `class="${ajuste} `) : `class="${ajuste}" ${extra}`;
    return `<img data-base="${esc(caminhoFoto(p, f))}" alt="${decorativa ? "" : esc(altFoto(p, f, i))}" ${attrs} decoding="async">`;
  }
  function carregarImagens(raiz = document) {
    $$("img[data-base]", raiz).forEach(img => {
      const base = img.dataset.base;
      img.removeAttribute("data-base");
      let k = 0;
      img.onerror = () => {
        k++;
        if (k < EXTS.length) img.src = encodeURI(`${base}.${EXTS[k]}`);
        else { img.onerror = null; img.src = FOTO_VAZIA; }
      };
      img.src = encodeURI(`${base}.${EXTS[0]}`);
    });
  }

  // Logo: usa img/logo.png se existir; se não, fica o nome escrito
  (() => {
    const logo = $(".marca-logo"), marca = $(".marca");
    if (!logo) return;
    const ok = () => { if (logo.naturalWidth > 1) marca.classList.add("com-logo"); };
    logo.addEventListener("load", ok);
    logo.addEventListener("error", () => logo.remove());
    if (logo.complete) ok();
  })();

  // Textos fixos do HTML (topo, rodapé): data-t="rodape.cidade"
  $$("[data-t]").forEach(el => {
    const v = el.dataset.t.split(".").reduce((o, k) => (o ? o[k] : undefined), T);
    if (typeof v === "string") el.textContent = v;
  });

  // ================================================================ servidor
  const SEM_PLANILHA = !LOJA.scriptUrl || String(LOJA.scriptUrl).includes("COLE_AQUI");
  async function chamar(corpo, { tempo = 8000, tentativas = 2, keepalive = false } = {}) {
    if (SEM_PLANILHA) throw Object.assign(new Error("scriptUrl não configurada em js/config.js"), { semPlanilha: true });
    let ultimo;
    for (let n = 1; n <= tentativas; n++) {
      try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), tempo);
        const res = await fetch(LOJA.scriptUrl, { method: "POST", body: JSON.stringify(corpo), signal: ctl.signal, keepalive });
        clearTimeout(timer);
        const texto = await res.text();
        try { return JSON.parse(texto); }
        catch (e) { throw new Error("A planilha não devolveu JSON (implantação sem acesso para 'Qualquer pessoa' ou código com erro): " + texto.slice(0, 120)); }
      } catch (e) {
        ultimo = e;
        if (n < tentativas) await espera(1500);
      }
    }
    throw ultimo || new Error("sem resposta");
  }

  // devolve { ok: conseguiu falar com a planilha, mudou: a sacola teve que ser ajustada }
  async function buscarEstoque(silencioso = false) {
    let ok = false, mudou = false;
    try {
      const r = await chamar({ action: "catalogo" });
      if (r.status !== "sucesso") throw new Error(r.detalhe || "resposta inesperada");
      const pct = Number(r.taxaCartaoPercentual);
      st.servidor = { status: "ok", produtos: r.produtos || {}, taxa: isFinite(pct) && r.taxaCartaoPercentual !== undefined ? pct : (Number(LOJA.taxaCartaoPercentual) || 0) };
      mudou = ajustarSacolaAoEstoque();
      ok = true;
    } catch (e) {
      console.warn("Estoque indisponível:", e);
      if (st.servidor.status === "carregando") st.servidor.status = "falhou";
      if (!silencioso) avisar(T.avisos.estoqueFora);
    }
    atualizarAoVivo();
    return { ok, mudou };
  }

  function ajustarSacolaAoEstoque() {
    let mudou = false;
    st.sacola.forEach(i => {
      const p = porId(i.produto);
      if (!p || situacao(p) !== "ativo") { i.qtd = 0; mudou = true; return; }
      const max = estoque(i.produto, i.tamanho);
      if (i.qtd > max) { i.qtd = Math.max(0, max); mudou = true; }
    });
    if (mudou) {
      st.sacola = st.sacola.filter(i => i.qtd > 0);
      salvarSacola();
      avisar(T.avisos.estoqueMudou);
    }
    return mudou;
  }

  // ================================================================ avisos
  let avisoTimer;
  function avisar(msg) {
    const box = $("#avisos");
    clearTimeout(avisoTimer);
    box.innerHTML = "";
    const el = document.createElement("div");
    el.className = "aviso";
    el.textContent = msg;
    box.appendChild(el);
    avisoTimer = setTimeout(() => { el.classList.add("sumindo"); setTimeout(() => el.remove(), 320); }, Math.max(3500, msg.length * 55));
  }

  function atualizarContador(pular = false) {
    const n = qtdSacola();
    const el = $("#sacola-qtd");
    el.textContent = n;
    el.setAttribute("aria-label", n === 1 ? "1 item" : `${n} itens`);
    if (pular && !calmo()) { el.classList.remove("pulo"); void el.offsetWidth; el.classList.add("pulo"); }
  }

  // ================================================================ efeitos (rolagem, parallax, inclinação, revelar)
  let rafRolagem = 0;
  window.addEventListener("scroll", () => {
    if (rafRolagem) return;
    rafRolagem = requestAnimationFrame(() => {
      rafRolagem = 0;
      const y = window.scrollY;
      $("#topo").classList.toggle("rolado", y > 40);
      const capa = $(".capa");
      if (capa && !calmo()) capa.style.setProperty("--rolagem", Math.min(y, 900));
    });
  }, { passive: true });

  document.addEventListener("pointermove", e => {
    const capa = $(".capa");
    if (!capa || calmo() || e.pointerType !== "mouse") return;
    capa.style.setProperty("--mx", ((e.clientX / innerWidth - .5) * 2).toFixed(3));
    capa.style.setProperty("--my", ((e.clientY / innerHeight - .5) * 2).toFixed(3));
  }, { passive: true });

  function ligarCards(raiz) {
    if (calmo() || !ponteiroFino()) return;
    $$(".card[data-id]", raiz).forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1100px) rotateX(${(.5 - y) * 5}deg) rotateY(${(x - .5) * 7}deg)`;
        card.style.setProperty("--px", `${x * 100}%`);
        card.style.setProperty("--py", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  function ligarMagneticos(raiz) {
    if (calmo() || !ponteiroFino()) return;
    $$(".js-ima", raiz).forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  let observadorRevela;
  function ligarRevela(raiz) {
    const els = $$(".js-revela", raiz);
    if (calmo() || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("visivel")); return; }
    if (observadorRevela) observadorRevela.disconnect();
    observadorRevela = new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("visivel"); observadorRevela.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e, i) => { e.style.setProperty("--atraso", `${(i % 3) * 90}ms`); observadorRevela.observe(e); });
  }

  // ================================================================ rotas + transições
  let primeiraVez = true;
  let rotaAtual = "";
  let relogio = 0;   // contagem regressiva da pré-venda
  function rota() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a, b] = h.split("/");
    if (!a) return { nome: "vitrine" };
    if (a === "p" && b) return { nome: "produto", id: decodeURIComponent(b) };
    if (a === "finalizar") return { nome: "finalizar", etapa: b || "dados" };
    if (a === "pedido" && b) return { nome: "pedido", id: decodeURIComponent(b) };
    return { nome: "nada" };
  }
  const fotoDoProduto = () => $("#trilho figure:first-child img");
  const fotoDoCard = id => {
    const cands = [`.card[data-id="${CSS.escape(id)}"] .card-palco img:not(.alt)`, `.capa[data-id="${CSS.escape(id)}"] .capa-foto img`, `.mini-link[href="#/p/${encodeURIComponent(id)}"] img`];
    // usa a foto que estiver visível na tela (a da faixa, a da capa ou a da coleção)
    for (const s of cands) { const el = $(s); if (el) { const r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) return el; } }
    return $(cands[0]) || $(cands[1]);
  };

  // A foto do card "voa" até a página do produto (e volta) com View Transitions
  async function navegar() {
    const r = rota();
    const chave = r.nome + ":" + (r.id || r.etapa || "");
    const anterior = rotaAtual;
    fecharSacola(false);
    clearInterval(relogio);
    if (!primeiraVez) $("#avisos").innerHTML = "";

    const pode = !primeiraVez && chave !== anterior && !calmo() && document.startViewTransition;
    if (pode) {
      const idAnterior = anterior.startsWith("produto:") ? anterior.slice(8) : null;
      let origem = null;
      if (r.nome === "produto") origem = fotoDoCard(r.id);
      else if (idAnterior && r.nome === "vitrine") origem = fotoDoProduto();
      if (origem) origem.style.viewTransitionName = "foto-viva";
      const vt = document.startViewTransition(() => {
        if (origem) origem.style.viewTransitionName = "";
        desenhar(r);
        const destino = r.nome === "produto" ? fotoDoProduto() : (idAnterior ? fotoDoCard(idAnterior) : null);
        if (origem && destino) {
          destino.style.viewTransitionName = "foto-viva";
          if (r.nome === "vitrine") destino.scrollIntoView({ block: "center" });
          else window.scrollTo(0, 0);
        } else window.scrollTo(0, 0);
      });
      vt.finished.finally(() => $$("img").forEach(i => { if (i.style.viewTransitionName) i.style.viewTransitionName = ""; }));
    } else {
      desenhar(r);
      window.scrollTo(0, 0);
      if (!primeiraVez && !calmo()) { const m = $("#conteudo"); m.classList.remove("entrando"); void m.offsetWidth; m.classList.add("entrando"); }
    }
    if (!primeiraVez) {
      const h1 = $("#conteudo h1");
      if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    }
    primeiraVez = false;
    rotaAtual = chave;
  }

  function aplicarTema(tema) {
    document.body.dataset.tema = tema;
    $('meta[name="theme-color"]').setAttribute("content", tema === "escuro" ? "#0A0A0C" : "#F3F3F5");
  }

  function desenhar(r) {
    const main = $("#conteudo");
    document.body.classList.remove("com-barra");
    $$(".topo-link[data-rota]").forEach(a => { if (r.nome === "vitrine") a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if (r.nome === "vitrine") telaVitrine(main);
    else if (r.nome === "produto") telaProduto(main, r.id);
    else if (r.nome === "finalizar") telaFinalizar(main, r.etapa);
    else if (r.nome === "pedido") telaPedido(main, r.id);
    else telaNada(main);
    carregarImagens(main);
    ligarRevela(main);
    ligarCards(main);
    ligarMagneticos(main);
  }

  function atualizarAoVivo() {
    const r = rota();
    if (r.nome === "vitrine") { $$(".card[data-id]").forEach(atualizarCard); atualizarCapa(); }
    if (r.nome === "produto") atualizarProduto();
    if (r.nome === "finalizar") { desenharResumo(); desenharPagamento(); }
    if (!$("#sacola").hidden) desenharSacola();
    atualizarContador();
  }

  // ================================================================ INÍCIO (capa + coleção)
  const ICONES = {
    pix: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 12l-9 9-9-9 9-9Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    local: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    zap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8L4 20Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    caminhao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="18" r="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    seta: '<svg class="seta" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    anexo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  // Produto da abertura: config.js > destaqueNoSite
  function produtoDestaque() {
    const vendaveis = CATALOGO.filter(p => p.status !== "em-breve");
    return porId(String(LOJA.destaqueNoSite || "").trim().toLowerCase()) || vendaveis.find(p => p.status === "ativo") || vendaveis[0];
  }

  function telaVitrine(main) {
    aplicarTema("escuro");
    document.title = "Loja | Shitbot Coral";
    const C = T.capa, K = T.colecao;
    const vendaveis = CATALOGO.filter(p => p.status !== "em-breve");
    const destaque = produtoDestaque();
    const comFiltro = vendaveis.length >= 4;
    const filtro = guarda.ler("sc-filtro", ss) || "todos";
    const fita = [destaque ? (destaque.tipo === "pre-venda" ? `${C.seloPreVenda}: ${destaque.nome}` : `${destaque.nome}: ${C.seloProntaEntrega.toLowerCase()}`) : null].concat(T.fita || []).filter(Boolean);
    const fitaHTML = fita.map(x => `<span>${esc(x)}</span>`).join("");
    const pre = destaque && destaque.tipo === "pre-venda";
    // a ordem da grade: destaque primeiro
    const ordem = destaque ? [destaque].concat(CATALOGO.filter(p => p !== destaque)) : CATALOGO;
    // faixa "Mais da loja": todos os outros (à venda primeiro, lançamentos no fim)
    const outros = CATALOGO.filter(p => p !== destaque).sort((a, b) => (a.status === "em-breve") - (b.status === "em-breve"));

    main.innerHTML = `
      ${destaque ? `
      <section class="capa" data-id="${esc(destaque.id)}" aria-labelledby="titulo-capa">
        <div class="capa-luz" aria-hidden="true"></div>
        <div class="capa-letreiro" aria-hidden="true"><span>${esc(C.letreiro1)}</span><span>${esc(C.letreiro2)}</span></div>
        <div class="capa-foto">${imgTag(destaque, 0, 'fetchpriority="high"')}</div>
        <div class="capa-info">
          <div class="capa-cartao">
            <span class="selo ${pre ? "claro" : ""}"><span class="ponto" aria-hidden="true"></span><span>${esc(pre ? C.seloPreVenda : C.seloProntaEntrega)}</span></span>
            <h1 id="titulo-capa">${esc(destaque.nome)}</h1>
            <p class="capa-preco"><strong class="js-capa-preco">${dinheiro(preco(destaque))}</strong><span class="js-capa-nota"></span></p>
            <div class="capa-acoes">
              <a class="btn btn-principal js-ima" href="#/p/${encodeURIComponent(destaque.id)}">${esc(pre ? C.botaoPreVenda : C.botaoProntaEntrega)}${ICONES.seta}</a>
              <a class="btn btn-vidro" href="#colecao" data-acao="ir-colecao">${esc(C.botaoColecao)}</a>
            </div>
          </div>
          <a class="capa-rolar" href="#colecao" data-acao="ir-colecao"><i aria-hidden="true"></i>${esc(C.rolar)}</a>
        </div>
      </section>
      ${outros.length ? `
      <section class="mais" aria-labelledby="titulo-mais">
        <div class="mais-cab">
          <h2 id="titulo-mais">${esc(C.maisProdutos)}</h2>
          <a href="#colecao" data-acao="ir-colecao">${esc(C.verTudo)}</a>
        </div>
        <ul class="mais-trilho">${outros.map(miniCardHTML).join("")}</ul>
      </section>` : ""}
      <div class="fita" aria-hidden="true"><div class="fita-trilho">${fitaHTML.repeat(4)}</div></div>` : ""}

      <section class="secao" id="colecao" aria-labelledby="titulo-colecao" tabindex="-1">
        <div class="secao-cab">
          <div>
            <h2 id="titulo-colecao">${esc(K.titulo)}</h2>
            <p>${esc(vendaveis.length === 1 ? K.contagem1 : t(K.contagemN, { n: vendaveis.length }))}${CATALOGO.length > vendaveis.length ? ". " + esc(K.lancamento) : "."}</p>
          </div>
          ${comFiltro ? `<div class="filtros" role="group" aria-label="Filtrar produtos">
            ${[["todos", K.filtroTudo], ["pronta-entrega", K.filtroPronta], ["pre-venda", K.filtroPre]].map(([v, x]) =>
              `<button type="button" class="filtro" data-acao="filtro" data-valor="${v}" aria-pressed="${filtro === v}">${esc(x)}</button>`).join("")}
          </div>` : ""}
        </div>
        <ul class="grade" id="grade">
          ${ordem.filter(p => !comFiltro || filtro === "todos" || p.tipo === filtro || p.status === "em-breve")
            .map(p => cardHTML(p, p === destaque)).join("")}
        </ul>
      </section>

      <section class="secao" aria-label="Como funciona a compra">
        <ul class="garantias">
          ${(T.garantias || []).map(g => `<li class="js-revela">${ICONES[g.icone] || ICONES.ok}<div><strong>${esc(g.titulo)}</strong><span>${esc(g.texto)}</span></div></li>`).join("")}
        </ul>
      </section>`;
    $$(".card[data-id]", main).forEach(atualizarCard);
    atualizarCapa();
  }

  // Card pequeno da faixa "Mais da loja"
  function miniCardHTML(p, i) {
    const breve = p.status === "em-breve";
    const corpo = `
      <div class="mini-palco" data-t="${esc(p.tema || "escuro")}">
        ${p.fotos && p.fotos.length ? imgTag(p, 0, 'loading="lazy"', true) : `<svg class="silhueta" viewBox="0 0 200 220" aria-hidden="true"><path d="M70 20 35 40l12 30 15-7v117h76V63l15 7 12-30-35-20c-5 11-15 17-30 17S75 31 70 20Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-dasharray="9 8"/></svg>`}
        <span class="selo mini-selo ${!breve && p.tipo === "pre-venda" ? "claro" : ""}">${esc(breve ? T.colecao.emBreve : p.tipo === "pre-venda" ? T.produto.seloPreVenda : T.produto.seloProntaEntrega)}</span>
      </div>
      <div class="mini-info">
        <span class="mini-nome">${esc(p.nome)}</span>
        <span class="mini-preco js-mini-preco" data-id="${esc(p.id)}">${breve ? "" : dinheiro(preco(p))}</span>
      </div>`;
    return `<li class="mini-card${breve ? " breve" : ""}" style="--i:${i}">${breve ? corpo : `<a href="#/p/${encodeURIComponent(p.id)}" class="mini-link">${corpo}</a>`}</li>`;
  }

  function atualizarCapa() {
    $$(".js-mini-preco").forEach(el => { const p = porId(el.dataset.id); if (p && p.status !== "em-breve") el.textContent = dinheiro(preco(p)); });
    const capa = $(".capa");
    if (!capa) return;
    const p = porId(capa.dataset.id);
    $(".js-capa-preco").textContent = dinheiro(preco(p));
    const nota = $(".js-capa-nota");
    const n = estoqueTotalLivre(p);
    if (situacao(p) === "encerrado") nota.textContent = p.tipo === "pre-venda" ? T.colecao.preVendaEncerrada : T.colecao.encerrado;
    else if (st.servidor.status === "ok" && n > 0 && n <= 10) nota.textContent = t(T.capa.ultimas, { n });
    else nota.textContent = prazo(p) ? t(T.capa.entregaPrevista, { prazo: prazo(p) }) : "";
  }

  function cardHTML(p, grande) {
    const K = T.colecao;
    if (p.status === "em-breve") {
      return `<li class="card card-breve js-revela"><div class="card-dentro">
        <div class="card-palco">
          ${p.fotos && p.fotos.length ? imgTag(p, 0) : `<svg class="silhueta" viewBox="0 0 200 220" aria-hidden="true"><path d="M70 20 35 40l12 30 15-7v117h76V63l15 7 12-30-35-20c-5 11-15 17-30 17S75 31 70 20Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-dasharray="9 8"/></svg>`}
          <div class="card-selos"><span class="selo"><span class="ponto" aria-hidden="true"></span>${esc(K.emBreve)}</span></div>
        </div>
        <div class="card-info"><div><p class="card-cat">${esc(p.categoria || "")}</p><p class="card-nome">${esc(p.nome)}</p></div></div>
        <p class="card-nota">${esc(resumoDe(p))} <a href="${esc(LOJA.instagram)}" target="_blank" rel="noopener">${esc(T.rodape.instagram)}<span class="so-leitor"> (abre em nova aba)</span></a></p>
      </div></li>`;
    }
    const temAlt = p.fotos && p.fotos.length > 1;
    return `<li class="card js-revela${grande ? " grande" : ""}${temAlt ? " tem-alt" : ""}" data-id="${esc(p.id)}" data-card-tema="${esc(p.tema || "escuro")}">
      <div class="card-palco">
        ${imgTag(p, 0, 'loading="lazy"')}
        ${temAlt ? imgTag(p, 1, 'class="alt" loading="lazy"', true) : ""}
        <div class="card-selos"><span class="selo js-selo"></span></div>
        ${p.tamanhos && p.tamanhos.length ? `<div class="rapida js-rapida" role="group" aria-label="${esc(K.compraRapida)}: ${esc(p.nome)}">
          <p aria-hidden="true">${esc(K.compraRapida)}</p>
          ${p.tamanhos.map((x, i) => `<button type="button" data-acao="rapida" data-id="${esc(p.id)}" data-tam="${esc(x)}" style="--i:${i}">${esc(x)}</button>`).join("")}
        </div>` : ""}
      </div>
      <div class="card-info">
        <div><p class="card-cat">${esc(p.categoria || "")}</p><a class="card-link" href="#/p/${encodeURIComponent(p.id)}"><span class="card-nome">${esc(p.nome)}</span></a></div>
        <p class="card-preco js-preco"></p>
      </div>
      <p class="card-nota js-nota"></p>
    </li>`;
  }

  function atualizarCard(card) {
    const p = porId(card.dataset.id);
    if (!p) return;
    const K = T.colecao;
    const sit = situacao(p);
    const selo = $(".js-selo", card), nota = $(".js-nota", card);
    $(".js-preco", card).textContent = dinheiro(preco(p));
    let txt = p.tipo === "pre-venda" ? T.produto.seloPreVenda : T.produto.seloProntaEntrega;
    let destaqueSelo = p.tipo === "pre-venda";
    nota.classList.remove("alerta");
    const padrao = prazo(p) ? t(K.notaPrazo, { prazo: prazo(p) }) : t(K.notaTamanhos, { tamanhos: p.tamanhos.join(", ") });
    if (sit === "encerrado") { txt = p.tipo === "pre-venda" ? K.preVendaEncerrada : K.encerrado; destaqueSelo = false; nota.textContent = K.notaEncerrado; }
    else if (st.servidor.status === "ok") {
      const n = estoqueTotalLivre(p);
      if (n <= 0 && naSacola(p.id) === 0) { txt = K.esgotado; destaqueSelo = false; nota.textContent = K.notaEsgotado; }
      else if (n > 0 && n <= 5) { nota.textContent = t(K.notaUltimas, { n }); nota.classList.add("alerta"); }
      else nota.textContent = padrao;
    } else nota.textContent = padrao;
    selo.textContent = txt;
    selo.className = "selo js-selo" + (destaqueSelo ? " claro" : "");
    estadoCarga($(".js-rapida", card), st.servidor.status === "carregando" && sit === "ativo");
    $$(".js-rapida button", card).forEach(b => {
      const x = b.dataset.tam;
      const ok = sit === "ativo" && st.servidor.status !== "carregando" && livre(p.id, x) > 0;
      b.setAttribute("aria-disabled", String(!ok));
      b.setAttribute("aria-label", `${T.produto.tamanho} ${x}${ok ? "" : st.servidor.status === "carregando" ? ", conferindo estoque" : ", indisponível"}`);
    });
  }

  function compraRapida(btn) {
    const p = porId(btn.dataset.id);
    if (btn.getAttribute("aria-disabled") === "true") return avisar(st.servidor.status === "carregando" ? T.avisos.conferindo : t(T.avisos.semMais, { tam: btn.dataset.tam }));
    if (!colocarNaSacola(p, btn.dataset.tam)) return;
    voarParaSacola($("img:not(.alt)", btn.closest(".card-palco")));
    $$(".card[data-id]").forEach(atualizarCard);
  }

  // Botões de tamanho: brilho enquanto o estoque carrega em segundo plano,
  // e entrada animada (um de cada vez) quando ele chega
  function estadoCarga(el, carregando) {
    if (!el) return;
    const antes = el.dataset.carga;
    const agora = carregando ? "carregando" : "pronto";
    el.classList.toggle("carregando", carregando);
    if (antes === "carregando" && agora === "pronto" && !calmo()) {
      el.classList.remove("revela"); void el.offsetWidth; el.classList.add("revela");
      clearTimeout(el._revela);
      el._revela = setTimeout(() => el.classList.remove("revela"), 1400);
    }
    el.dataset.carga = agora;
  }

  // ================================================================ PRODUTO
  let observadorBarra;
  function telaProduto(main, id) {
    const p = porId(id);
    if (!p || p.status === "em-breve") return telaNada(main);
    const P = T.produto;
    aplicarTema(p.tema || "escuro");
    document.title = `${p.nome} | Shitbot Coral`;
    if (st.tamSel && st.tamSel.produto !== p.id) st.tamSel = null;
    const fotos = p.fotos && p.fotos.length ? p.fotos : [null];
    const pre = p.tipo === "pre-venda";
    const dataFim = pre && p.encerraEm && !isNaN(new Date(p.encerraEm).getTime()) ? new Date(p.encerraEm) : null;

    main.innerHTML = `
      <article class="produto" aria-labelledby="titulo-produto">
        <nav class="migalhas" aria-label="Você está em">
          <ol><li><a href="#/">${esc(P.migalhaLoja)}</a></li><li aria-current="page">${esc(p.nome)}</li></ol>
        </nav>

        <div class="galeria">
          <div class="galeria-trilho" id="trilho" tabindex="0" role="region" aria-label="Fotos do produto. Use as setas para passar.">
            ${fotos.map((f, i) => `<figure>${f ? imgTag(p, i, i ? 'loading="lazy"' : 'fetchpriority="high"') : `<img src="${FOTO_VAZIA}" alt="">`}</figure>`).join("")}
          </div>
          ${fotos.length > 1 ? `
            <div class="pontos" aria-hidden="true">${fotos.map((f, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
            <div class="galeria-miniaturas">
              ${fotos.map((f, i) => `<button type="button" class="mini" data-acao="foto" data-i="${i}" aria-label="Ver foto ${i + 1} de ${fotos.length}" ${i === 0 ? 'aria-current="true"' : ""}>${imgTag(p, i, "", true)}</button>`).join("")}
            </div>` : ""}
        </div>

        <div class="produto-info">
          <div class="produto-selos">
            <span class="selo ${pre ? "claro" : ""}" id="p-selo">${esc(pre ? P.seloPreVenda : P.seloProntaEntrega)}</span>
            ${p.categoria ? `<span class="selo">${esc(p.categoria)}</span>` : ""}
          </div>
          <h1 class="produto-nome" id="titulo-produto">${esc(p.nome)}</h1>
          <div class="preco-destaque">
            <p class="preco-valor"><strong id="p-preco">${dinheiro(preco(p))}</strong><span class="preco-pix">${esc(P.precoPix)}</span></p>
            <p class="preco-cartao" id="p-cartao"></p>
          </div>
          ${resumoDe(p) ? `<p class="produto-resumo">${esc(resumoDe(p))}</p>` : ""}
          ${pre ? `<div class="infos"><dl>
              <div><dt>${esc(P.entregaPrevista)}</dt><dd id="p-prazo">${esc(prazo(p) || P.aDefinir)}</dd></div>
              <div><dt>${esc(dataFim ? P.preVendaEncerraEm : P.preVendaAte)}</dt><dd id="p-fim">${dataFim ? "" : esc(P.fimDoEstoque)}</dd></div>
            </dl></div>` : ""}

          <div class="tamanhos">
            <fieldset>
              <legend><span>${esc(P.tamanho)}</span>${p.medidas ? `<button type="button" class="link-btn" data-acao="medidas">${esc(P.guiaMedidas)}</button>` : ""}</legend>
              <div class="tam-grade" id="tam-grade">
                ${p.tamanhos.map((x, i) => `<button type="button" class="tam" data-acao="tam" data-tam="${esc(x)}" aria-pressed="false" style="--i:${i}">${esc(x)}</button>`).join("")}
              </div>
              <p class="tam-nota" id="tam-nota" aria-live="polite"></p>
            </fieldset>
          </div>

          <div class="acoes-produto">
            <button type="button" class="btn btn-principal btn-larga js-ima" id="btn-add" data-acao="adicionar"><span class="btn-txt">${esc(P.adicionar)}</span></button>
            <button type="button" class="btn btn-vidro btn-larga" id="btn-ver-sacola" data-acao="abrir-sacola" hidden>${esc(P.verSacola)}</button>
          </div>

          <div class="sanfona">
            ${p.detalhes && p.detalhes.length ? `<details open><summary>${esc(P.detalhes)}</summary><div class="conteudo"><ul>${p.detalhes.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>` : ""}
            ${p.medidas ? `<details id="det-medidas"><summary>${esc(P.guiaMedidas)}</summary><div class="conteudo">${tabelaMedidas(p)}</div></details>` : ""}
            <details><summary>${esc(P.entregaPagamento)}</summary><div class="conteudo"><ul>
              <li>${esc(T.entrega.retiradaTitulo)}: ${esc(T.entrega.retiradaTexto)}</li>
              <li>${esc(T.entrega.appTitulo)}: ${esc(T.entrega.appTexto)}</li>
              <li class="js-info-pag">${esc(t(P.infoPagamento, { taxa: taxaTexto() }))}</li>
              <li>${esc(P.infoComprovante)}</li>
            </ul></div></details>
          </div>
        </div>
      </article>
      <div class="barra-compra" id="barra-compra" aria-hidden="true">
        <div><p class="bc-preco" id="bc-preco">${dinheiro(preco(p))}</p><p class="bc-tam" id="bc-tam">${esc(P.escolhaTamanho)}</p></div>
        <button type="button" class="btn btn-principal" data-acao="adicionar" tabindex="-1">${esc(P.adicionarCurto)}</button>
      </div>`;

    const trilho = $("#trilho");
    trilho.addEventListener("scroll", () => {
      const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
      $$(".mini").forEach((m, k) => { if (k === i) m.setAttribute("aria-current", "true"); else m.removeAttribute("aria-current"); });
      $$(".pontos i").forEach((d, k) => d.classList.toggle("on", k === i));
    }, { passive: true });
    trilho.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      trilho.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * trilho.clientWidth, behavior: calmo() ? "auto" : "smooth" });
    });
    // Zoom na foto (computador)
    if (ponteiroFino()) {
      $$("figure", trilho).forEach(fig => {
        const img = $("img", fig);
        fig.addEventListener("click", () => fig.classList.toggle("zoom"));
        fig.addEventListener("pointermove", e => {
          if (!fig.classList.contains("zoom")) return;
          const r = fig.getBoundingClientRect();
          img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        });
        fig.addEventListener("pointerleave", () => fig.classList.remove("zoom"));
      });
    }

    // Contagem regressiva da pré-venda
    if (dataFim) {
      const fim = $("#p-fim");
      const tic = () => {
        const ms = dataFim - Date.now();
        if (ms <= 0) { fim.textContent = T.colecao.preVendaEncerrada; clearInterval(relogio); atualizarProduto(); return; }
        const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
        fim.innerHTML = `<span class="contagem" role="timer" aria-label="${d} dias, ${h} horas e ${m} minutos">
          <span>${d}<small>dias</small></span><span>${String(h).padStart(2, "0")}<small>horas</small></span><span>${String(m).padStart(2, "0")}<small>min</small></span><span aria-hidden="true">${String(s).padStart(2, "0")}<small>seg</small></span></span>`;
      };
      tic();
      relogio = setInterval(tic, 1000);
    }

    if (observadorBarra) observadorBarra.disconnect();
    observadorBarra = new IntersectionObserver(([e]) => {
      const barra = $("#barra-compra");
      if (!barra) return;
      const mostrar = !e.isIntersecting && e.boundingClientRect.top < 0;
      barra.classList.toggle("on", mostrar);
      barra.setAttribute("aria-hidden", String(!mostrar));
      document.body.classList.toggle("com-barra", mostrar && innerWidth < 960);
    });
    observadorBarra.observe($("#btn-add"));
    atualizarProduto();
  }

  function tabelaMedidas(p) {
    const m = p.medidas;
    return `<table class="tabela-medidas">
      <caption>${esc(T.produto.medidasLegenda)}</caption>
      <thead><tr><th scope="col">${esc(T.produto.tamanho)}</th>${m.colunas.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${Object.entries(m.linhas).map(([x, v]) => `<tr><th scope="row">${esc(x)}</th>${v.map(y => `<td>${esc(y)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
  }

  function atualizarProduto() {
    const p = porId(rota().id);
    if (!p || !$("#tam-grade")) return;
    const P = T.produto;
    const sit = situacao(p);
    const carregando = st.servidor.status === "carregando";
    let baixo = false;
    estadoCarga($("#tam-grade"), carregando && sit === "ativo");
    $("#tam-nota").classList.toggle("carregando", carregando && sit === "ativo");
    $$(".tam", $("#tam-grade")).forEach(b => {
      const x = b.dataset.tam;
      const resta = livre(p.id, x);
      const esgotado = !carregando && (resta <= 0 || sit !== "ativo");
      b.classList.toggle("carregando", carregando && sit === "ativo");
      b.setAttribute("aria-disabled", String(esgotado || carregando));
      const sel = st.tamSel && st.tamSel.produto === p.id && st.tamSel.tamanho === x && !esgotado;
      b.setAttribute("aria-pressed", String(!!sel));
      let badge = $(".tam-resta", b);
      if (!carregando && !esgotado && resta <= 3 && isFinite(resta)) {
        baixo = true;
        if (!badge) { badge = document.createElement("span"); badge.className = "tam-resta"; badge.setAttribute("aria-hidden", "true"); b.appendChild(badge); }
        badge.textContent = resta;
      } else if (badge) badge.remove();
      const extra = carregando ? ", conferindo estoque" : esgotado ? (sit === "ativo" ? ", esgotado" : ", indisponível") : (resta <= 3 && isFinite(resta) ? `, ${resta === 1 ? "resta 1" : "restam " + resta}` : "");
      b.setAttribute("aria-label", `${P.tamanho} ${x}${extra}`);
    });
    if (st.tamSel && $(`.tam[data-tam="${CSS.escape(st.tamSel.tamanho)}"]`)?.getAttribute("aria-disabled") === "true") st.tamSel = null;

    const nota = $("#tam-nota");
    nota.classList.remove("alerta");
    if (sit === "encerrado") { nota.textContent = p.tipo === "pre-venda" ? P.preVendaEncerrada : P.vendasEncerradas; nota.classList.add("alerta"); }
    else if (carregando) nota.textContent = P.conferindo.replace(/[.…\s]+$/, "");   // as reticências são animadas
    else if (st.servidor.status === "ok" && estoqueTotalLivre(p) <= 0 && naSacola(p.id) > 0) nota.textContent = P.tudoNaSacola;
    else if (st.servidor.status === "ok" && estoqueTotalLivre(p) <= 0) { nota.textContent = P.esgotado; nota.classList.add("alerta"); }
    else if (baixo) { nota.textContent = P.ultimasUnidades; nota.classList.add("alerta"); }
    else nota.textContent = st.tamSel ? t(P.tamanhoEscolhido, { tam: st.tamSel.tamanho }) : "";

    const add = $("#btn-add");
    const fechado = sit !== "ativo";
    add.disabled = fechado;
    if (!add.classList.contains("feito")) $(".btn-txt", add).textContent = fechado ? (p.tipo === "pre-venda" ? T.colecao.preVendaEncerrada : P.indisponivel) : P.adicionar;
    $("#p-preco").textContent = dinheiro(preco(p));
    $("#p-cartao").textContent = taxaPct() > 0 ? t(P.precoCartao, { valor: dinheiro(comTaxa(preco(p))) }) : "";
    $$(".js-info-pag").forEach(e => { e.textContent = t(P.infoPagamento, { taxa: taxaTexto() }); });
    $("#bc-preco").textContent = dinheiro(preco(p));
    $("#bc-tam").textContent = st.tamSel ? `${P.tamanho} ${st.tamSel.tamanho}` : P.escolhaTamanho;
    $("#barra-compra .btn").disabled = fechado;
    if ($("#p-prazo")) $("#p-prazo").textContent = prazo(p) || P.aDefinir;
    if (fechado) { const s = $("#p-selo"); s.textContent = p.tipo === "pre-venda" ? T.colecao.preVendaEncerrada : T.colecao.encerrado; s.classList.remove("claro"); }
    $("#btn-ver-sacola").hidden = naSacola(p.id) === 0;
  }

  function escolherTamanho(btn) {
    const p = porId(rota().id);
    if (st.servidor.status === "carregando") return avisar(T.avisos.conferindo);
    if (btn.getAttribute("aria-disabled") === "true") return avisar(situacao(p) !== "ativo" ? T.avisos.fechado : t(T.avisos.tamanhoEsgotado, { tam: btn.dataset.tam }));
    st.tamSel = { produto: p.id, tamanho: btn.dataset.tam };
    atualizarProduto();
  }

  // Põe na sacola (página do produto e compra rápida)
  function colocarNaSacola(p, x) {
    const A = T.avisos;
    if (!p || situacao(p) !== "ativo") { avisar(A.fechado); return false; }
    if (st.servidor.status === "carregando") { avisar(A.conferindo); return false; }
    if (livre(p.id, x) <= 0) { avisar(t(A.semMais, { tam: x })); return false; }
    if (qtdSacola() >= LOJA.maxItens) { avisar(t(A.limite, { n: LOJA.maxItens })); return false; }
    const item = st.sacola.find(i => i.produto === p.id && i.tamanho === x);
    if (item) item.qtd++; else st.sacola.push({ produto: p.id, tamanho: x, qtd: 1 });
    salvarSacola();
    atualizarContador(true);
    avisar(t(A.naSacola, { nome: p.nome, tam: x, n: pecas(qtdSacola()) }));
    return true;
  }

  function adicionar() {
    const p = porId(rota().id);
    if (!st.tamSel) {
      avisar(T.avisos.escolhaTamanho);
      if (!calmo()) $("#tam-grade").animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 320 });
      const primeiro = $('.tam[aria-disabled="false"]');
      if (primeiro) { primeiro.focus(); primeiro.scrollIntoView({ block: "center", behavior: calmo() ? "auto" : "smooth" }); }
      return;
    }
    if (!colocarNaSacola(p, st.tamSel.tamanho)) return;
    voarParaSacola(fotoDoProduto());
    st.tamSel = null;
    const b = $("#btn-add");
    b.classList.add("feito");
    $(".btn-txt", b).textContent = T.produto.adicionado;
    setTimeout(() => { if (document.contains(b)) { b.classList.remove("feito"); atualizarProduto(); } }, 1600);
    atualizarProduto();
  }

  function voarParaSacola(fonte) {
    if (calmo() || !fonte) return;
    const alvo = $("#sacola-btn");
    const fr = fonte.getBoundingClientRect(), b = alvo.getBoundingClientRect();
    let a = { left: fr.left, top: fr.top, width: fr.width, height: fr.height };
    if (fr.bottom < 0 || fr.top > innerHeight) { const o = ($("#btn-add") || alvo).getBoundingClientRect(); a = { left: o.left + o.width / 2 - 60, top: o.top - 140, width: 120, height: 140 }; }
    const w = Math.min(a.width, 240), h = Math.min(a.height, w * 1.15);
    const x0 = a.left + (a.width - w) / 2, y0 = a.top + (a.height - h) / 2;
    const clone = document.createElement("img");
    clone.src = fonte.currentSrc || fonte.src; clone.alt = ""; clone.className = "voando";
    Object.assign(clone.style, { left: `${x0}px`, top: `${y0}px`, width: `${w}px`, height: `${h}px` });
    document.body.appendChild(clone);
    const dx = b.left + b.width / 2 - (x0 + w / 2), dy = b.top + b.height / 2 - (y0 + h / 2);
    clone.animate([
      { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
      { transform: `translate(${dx * .4}px, ${dy * .2 - 80}px) scale(.6) rotate(-10deg)`, opacity: 1, offset: .45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.06) rotate(-25deg)`, opacity: .4 }
    ], { duration: 800, easing: "cubic-bezier(.5,0,.15,1)" }).onfinish = () => clone.remove();
  }

  // ================================================================ SACOLA
  let focoAntes = null;
  function abrirSacola() {
    focoAntes = document.activeElement;
    desenharSacola();
    const s = $("#sacola"), v = $("#veu");
    s.hidden = false; v.hidden = false;
    $("#sacola-btn").setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => { s.classList.add("on"); v.classList.add("on"); }));
    setTimeout(() => $("#sacola-fechar").focus(), 60);
  }
  function fecharSacola(devolverFoco = true) {
    const s = $("#sacola"), v = $("#veu");
    if (s.hidden) return;
    s.classList.remove("on"); v.classList.remove("on");
    $("#sacola-btn").setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(() => { s.hidden = true; v.hidden = true; }, calmo() ? 0 : 520);
    if (devolverFoco && focoAntes && document.contains(focoAntes)) focoAntes.focus();
  }

  function linhaItemHTML(i, idx, compacto) {
    const p = porId(i.produto);
    if (!p) return "";
    const S = T.sacola;
    const max = Math.min(estoque(p.id, i.tamanho), i.qtd + (LOJA.maxItens - qtdSacola()));
    const foto = `<div class="item-foto" data-t="${esc(p.tema || "escuro")}">${imgTag(p, 0, "", true)}</div>`;
    const tam = t(S.tamanho, { tam: i.tamanho });
    if (compacto) {
      return `<li>${foto}
        <div><p class="r-nome">${esc(p.nome)}</p><p class="r-meta">${esc(tam)}, ${i.qtd} × ${dinheiro(preco(p))}</p></div>
        <p class="r-preco">${dinheiro(i.qtd * preco(p))}</p></li>`;
    }
    return `<li class="item" data-idx="${idx}" style="animation-delay:${idx * 50}ms">
      ${foto}
      <div>
        <p class="item-nome">${esc(p.nome)}</p>
        <p class="item-meta">${esc(tam)}${p.tipo === "pre-venda" ? `, ${esc(S.preVenda)}${prazo(p) ? " (" + esc(prazo(p)) + ")" : ""}` : ""}</p>
        <div class="item-linha">
          <div class="qtd" role="group" aria-label="Quantidade de ${esc(p.nome)} ${esc(tam)}">
            <button type="button" data-acao="menos" data-idx="${idx}" aria-label="Diminuir">−</button>
            <output aria-live="polite">${i.qtd}</output>
            <button type="button" data-acao="mais" data-idx="${idx}" aria-label="Aumentar" ${i.qtd >= max ? "disabled" : ""}>+</button>
          </div>
          <p class="item-preco">${dinheiro(i.qtd * preco(p))}</p>
        </div>
        <button type="button" class="link-btn item-remover" data-acao="remover" data-idx="${idx}">${esc(S.remover)}<span class="so-leitor"> ${esc(p.nome)} ${esc(tam)}</span></button>
      </div>
    </li>`;
  }

  function desenharSacola() {
    const S = T.sacola;
    const corpo = $("#sacola-corpo"), pe = $("#sacola-pe");
    if (!st.sacola.length) {
      corpo.innerHTML = `<div class="sacola-vazia"><p>${esc(S.vazia)}</p>
        <a class="btn btn-principal" href="#/" data-acao="fechar-sacola">${esc(S.verColecao)}${ICONES.seta}</a></div>`;
      pe.innerHTML = ""; pe.hidden = true;
      return;
    }
    pe.hidden = false;
    corpo.innerHTML = `<ul class="lista-itens">${st.sacola.map((i, k) => linhaItemHTML(i, k)).join("")}</ul>`;
    pe.innerHTML = `
      <div class="total-linha"><span>${esc(t(S.subtotal, { n: pecas(qtdSacola()) }))}</span><strong>${dinheiro(subtotal())}</strong></div>
      ${temPreVenda() ? `<p class="nota">${esc(comPrazos(S.avisoPreVenda, prazosNaSacola()))}</p>` : ""}
      <a class="btn btn-principal btn-larga" href="#/finalizar/dados">${esc(S.finalizar)}${ICONES.seta}</a>
      <button type="button" class="link-btn" data-acao="fechar-sacola">${esc(S.continuar)}</button>`;
    carregarImagens(corpo);
  }

  function mudarQtd(idx, delta) {
    const i = st.sacola[idx];
    if (!i) return;
    if (delta > 0) {
      if (livre(i.produto, i.tamanho) <= 0) return avisar(t(T.avisos.semMais, { tam: i.tamanho }));
      if (qtdSacola() >= LOJA.maxItens) return avisar(t(T.avisos.limite, { n: LOJA.maxItens }));
    }
    i.qtd += delta;
    if (i.qtd <= 0) return remover(idx);
    salvarSacola();
    desenharSacola();
    $$(".item").forEach(e => { e.style.animation = "none"; });
    $(`.item[data-idx="${idx}"] [data-acao="${delta > 0 ? "mais" : "menos"}"]`)?.focus();
    atualizarContador(true);
    atualizarForaDaSacola();
  }
  function remover(idx) {
    const i = st.sacola[idx];
    const p = porId(i.produto);
    const el = $(`.item[data-idx="${idx}"]`);
    const fim = () => {
      st.sacola.splice(idx, 1);
      salvarSacola();
      desenharSacola();
      $$(".item").forEach(e => { e.style.animation = "none"; });
      atualizarContador();
      atualizarForaDaSacola();
      avisar(t(T.avisos.saiu, { nome: p ? p.nome : "Item", tam: i.tamanho }));
      ($('.item [data-acao="menos"]') || $("#sacola-fechar")).focus();
    };
    if (el && !calmo()) { el.classList.add("saindo"); setTimeout(fim, 320); } else fim();
  }
  function atualizarForaDaSacola() {
    const r = rota();
    if (r.nome === "produto") atualizarProduto();
    if (r.nome === "vitrine") $$(".card[data-id]").forEach(atualizarCard);
    if (r.nome === "finalizar") {
      if (!st.sacola.length) { fecharSacola(false); desenhar(r); }
      else { desenharResumo(); desenharPagamento(); }
    }
  }

  document.addEventListener("keydown", e => {
    const s = $("#sacola");
    if (s.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); fecharSacola(); return; }
    if (e.key !== "Tab") return;
    const foc = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', s).filter(x => x.offsetParent !== null);
    if (!foc.length) return;
    const pri = foc[0], ult = foc[foc.length - 1];
    if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
    else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
  });

  // Arrastar a folha para baixo fecha (celular)
  (() => {
    const s = $("#sacola");
    let y0 = null, dy = 0;
    s.addEventListener("touchstart", e => {
      if (innerWidth > 640 || ($("#sacola-corpo").scrollTop > 0 && !e.target.closest(".sacola-topo, .sacola-alca"))) return;
      y0 = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    s.addEventListener("touchmove", e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      s.style.transition = "none"; s.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    s.addEventListener("touchend", () => {
      if (y0 === null) return;
      s.style.transition = ""; s.style.transform = "";
      if (dy > 110) fecharSacola();
      y0 = null;
    });
  })();

  // ================================================================ FINALIZAR
  const ETAPAS = ["dados", "entrega", "pagamento"];
  function dadosOk() {
    const c = st.cliente, zap = String(c.zap || "").replace(/\D/g, "");
    return (c.nome || "").trim().split(/\s+/).length >= 2 && zap.length === 11;
  }
  function entregaOk() {
    if (st.entrega === "retirada") return true;
    if (st.entrega !== "app") return false;
    const c = st.cliente;
    return !!(c.rua && c.numero && c.bairro && c.cidade && c.estado && c.estado.length === 2);
  }

  function telaFinalizar(main, etapa) {
    const K = T.checkout;
    aplicarTema("escuro");
    if (!st.sacola.length) {
      document.title = `${K.sacolaVazia} | Shitbot Coral`;
      main.innerHTML = `<section class="vazio-tela"><h1>${esc(K.sacolaVazia)}</h1><p>${esc(K.sacolaVaziaTexto)}</p><a class="btn btn-principal" href="#/">${esc(T.sacola.verColecao)}${ICONES.seta}</a></section>`;
      return;
    }
    if ((etapa === "entrega" || etapa === "pagamento") && !dadosOk()) return location.replace("#/finalizar/dados");
    if (etapa === "pagamento" && !entregaOk()) return location.replace("#/finalizar/entrega");
    const idx = Math.max(0, ETAPAS.indexOf(etapa));
    document.title = `${K.etapas[idx]} (etapa ${idx + 1} de 3) | Shitbot Coral`;
    main.innerHTML = `
      <div class="checkout">
        <section aria-labelledby="titulo-checkout">
          <h1 id="titulo-checkout">${esc(K.titulo)}</h1>
          <ol class="progresso" aria-label="Etapas da compra">
            ${ETAPAS.map((k, i) => `<li ${i === idx ? 'aria-current="step"' : ""} data-estado="${i < idx ? "feita" : i === idx ? "atual" : "proxima"}">${i < idx ? `<a href="#/finalizar/${k}">${i + 1}. ${esc(K.etapas[i])}<span class="so-leitor">, concluída</span></a>` : `${i + 1}. ${esc(K.etapas[i])}`}</li>`).join("")}
          </ol>
          <div class="painel" id="etapa"></div>
        </section>
        <aside class="resumo" aria-labelledby="titulo-resumo" id="resumo"></aside>
      </div>`;
    desenharResumo();
    const box = $("#etapa");
    if (etapa === "entrega") etapaEntrega(box);
    else if (etapa === "pagamento") etapaPagamento(box);
    else etapaDados(box);
  }

  function desenharResumo() {
    const el = $("#resumo");
    if (!el) return;
    const K = T.checkout;
    const naPag = rota().etapa === "pagamento";
    el.innerHTML = `
      <div class="resumo-cab"><h2 id="titulo-resumo">${esc(K.resumo)}</h2><button type="button" class="link-btn" data-acao="abrir-sacola">${esc(K.editar)}</button></div>
      <ul class="resumo-lista">${st.sacola.map((i, k) => linhaItemHTML(i, k, true)).join("")}</ul>
      <div class="resumo-tot">
        <div><span>${esc(K.subtotal)}</span><span>${dinheiro(subtotal())}</span></div>
        ${st.pagamento === "card" && naPag ? `<div><span>${esc(t(K.taxaCartao, { taxa: taxaTexto() }))}</span><span>+ ${dinheiro(taxa())}</span></div>` : ""}
        <div class="grande"><span>${esc(K.total)}</span><span>${dinheiro(naPag ? total() : subtotal())}</span></div>
      </div>
      ${temPreVenda() ? `<p class="resumo-aviso">${esc(comPrazos(K.avisoPreVenda, prazosNaSacola()))}</p>` : ""}`;
    carregarImagens(el);
  }

  // ---------- campos e validação ----------
  function campo({ id, rotulo, tipo = "text", valor = "", auto = "", modo = "", dica = "", obrig = true, max = "" }) {
    return `<div class="campo">
      <label for="${id}">${esc(rotulo)}${obrig ? "" : " " + esc(T.checkout.opcional)}</label>
      ${dica ? `<p class="dica" id="${id}-dica">${esc(dica)}</p>` : ""}
      <input id="${id}" name="${id}" type="${tipo}" value="${esc(valor)}" ${auto ? `autocomplete="${auto}"` : ""} ${modo ? `inputmode="${modo}"` : ""} ${max ? `maxlength="${max}"` : ""} ${obrig ? 'required aria-required="true"' : ""} ${dica ? `aria-describedby="${id}-dica"` : ""}>
    </div>`;
  }
  function marcarErros(form, erros) {
    $$(".erro", form).forEach(e => e.remove());
    $$("[aria-invalid]", form).forEach(i => i.removeAttribute("aria-invalid"));
    $$("input", form).forEach(i => { const d = $(`#${i.id}-dica`); if (d) i.setAttribute("aria-describedby", d.id); else if (!i.closest(".anexo")) i.removeAttribute("aria-describedby"); });
    const velho = $(".erro-resumo", form);
    if (velho) velho.remove();
    if (!erros.length) return true;
    erros.forEach(([id, msg]) => {
      const inp = $(`#${id}`);
      if (!inp) return;
      inp.setAttribute("aria-invalid", "true");
      const p = document.createElement("p");
      p.className = "erro"; p.id = `${id}-erro`; p.textContent = msg;
      (inp.closest(".campo") || inp.closest(".opcoes") || inp.parentElement).appendChild(p);
      inp.setAttribute("aria-describedby", [inp.getAttribute("aria-describedby"), p.id].filter(Boolean).join(" "));
    });
    const box = document.createElement("div");
    box.className = "erro-resumo"; box.setAttribute("role", "alert"); box.tabIndex = -1;
    box.innerHTML = `<h2>${esc(erros.length === 1 ? T.erros.titulo1 : t(T.erros.tituloN, { n: erros.length }))}</h2>
      <ul>${erros.map(([id, msg]) => `<li><a href="#${id}" data-acao="ir-campo" data-campo="${id}">${esc(msg)}</a></li>`).join("")}</ul>`;
    const titulo = $("h2", form);
    if (titulo) titulo.after(box); else form.prepend(box);
    box.focus();
    return false;
  }
  function mascaraZap(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  const mascaraCep = v => { const d = v.replace(/\D/g, "").slice(0, 8); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d; };

  function etapaDados(box) {
    const K = T.checkout, c = st.cliente;
    box.innerHTML = `
      <form class="form" id="form-dados" novalidate>
        <h2>${esc(K.dadosTitulo)}</h2>
        <p class="nota">${esc(K.dadosTexto)}</p>
        ${campo({ id: "nome", rotulo: K.nome, valor: c.nome || "", auto: "name" })}
        ${campo({ id: "zap", rotulo: K.whatsapp, tipo: "tel", valor: c.zap || "", auto: "tel-national", modo: "numeric", dica: K.whatsappExemplo, max: 15 })}
        <div class="navega">
          <a class="link-btn" href="#/">${esc(K.voltarLoja)}</a>
          <button type="submit" class="btn btn-principal">${esc(K.continuar)}${ICONES.seta}</button>
        </div>
      </form>`;
    const zap = $("#zap");
    zap.addEventListener("input", () => { zap.value = mascaraZap(zap.value); });
    $("#form-dados").addEventListener("submit", e => {
      e.preventDefault();
      const nome = $("#nome").value.trim().replace(/\s+/g, " ");
      const z = zap.value.replace(/\D/g, "");
      const erros = [];
      if (nome.split(" ").length < 2 || nome.length < 5) erros.push(["nome", T.erros.nome]);
      if (z.length !== 11 || z[2] !== "9") erros.push(["zap", T.erros.whatsapp]);
      if (!marcarErros(e.target, erros)) return;
      st.cliente = Object.assign(st.cliente, { nome, zap: mascaraZap(z) });
      guarda.gravar("sc-cliente", st.cliente, ss);
      location.hash = "#/finalizar/entrega";
    });
  }

  function etapaEntrega(box) {
    const K = T.checkout, E = T.entrega, c = st.cliente;
    const opc = (v, tit, d, pr) => `<label class="opcao"><input type="radio" name="entrega" value="${v}" ${st.entrega === v ? "checked" : ""}>
      <span class="opcao-caixa"><span class="opcao-titulo">${esc(tit)}</span><span class="opcao-preco">${esc(pr)}</span><span class="opcao-desc">${esc(d)}</span></span></label>`;
    box.innerHTML = `
      <form class="form" id="form-entrega" novalidate>
        <h2>${esc(K.entregaTitulo)}</h2>
        <fieldset class="opcoes" id="grupo-entrega">
          <legend>${esc(K.entregaPergunta)}</legend>
          ${opc("retirada", E.retiradaTitulo, E.retiradaTexto + (temPreVenda() ? " " + E.retiradaPreVenda : ""), E.retiradaPreco)}
          ${opc("app", E.appTitulo, E.appTexto, E.appPreco)}
        </fieldset>
        <div class="endereco" id="endereco" ${st.entrega === "app" ? "" : "hidden"}>
          <div class="linha-2 estreita">
            ${campo({ id: "cep", rotulo: K.cep, valor: c.cep || "", auto: "postal-code", modo: "numeric", dica: K.cepDica, obrig: false, max: 9 })}
            <div class="campo" style="align-content:end"><a class="link-btn" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener">${esc(K.naoSeiCep)}<span class="so-leitor"> (abre o site dos Correios em nova aba)</span></a></div>
          </div>
          ${campo({ id: "rua", rotulo: K.rua, valor: c.rua || "", auto: "address-line1" })}
          <div class="linha-2">
            ${campo({ id: "numero", rotulo: K.numero, valor: c.numero || "", modo: "numeric" })}
            ${campo({ id: "comp", rotulo: K.complemento, valor: c.comp || "", auto: "address-line2", obrig: false })}
          </div>
          ${campo({ id: "bairro", rotulo: K.bairro, valor: c.bairro || "" })}
          <div class="linha-2 estreita">
            ${campo({ id: "cidade", rotulo: K.cidade, valor: c.cidade || "", auto: "address-level2" })}
            ${campo({ id: "estado", rotulo: K.uf, valor: c.estado || "", auto: "address-level1", max: 2, dica: K.ufDica })}
          </div>
        </div>
        <div class="navega">
          <a class="link-btn" href="#/finalizar/dados">${esc(K.voltar)}</a>
          <button type="submit" class="btn btn-principal">${esc(K.irPagamento)}${ICONES.seta}</button>
        </div>
      </form>`;
    $$('input[name="entrega"]').forEach(r => r.addEventListener("change", () => {
      st.entrega = r.value;
      guarda.gravar("sc-entrega", st.entrega, ss);
      $("#endereco").hidden = st.entrega !== "app";
    }));
    const cep = $("#cep");
    cep.addEventListener("input", () => {
      cep.value = mascaraCep(cep.value);
      if (cep.value.replace(/\D/g, "").length === 8) buscarCep(cep.value.replace(/\D/g, ""));
    });
    $("#estado").addEventListener("input", e => { e.target.value = e.target.value.replace(/[^a-z]/gi, "").toUpperCase(); });
    $("#form-entrega").addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.target;
      if (form.dataset.ocupado) return;
      const R = T.erros, erros = [];
      const escolha = $('input[name="entrega"]:checked');
      if (!escolha) erros.push(["grupo-entrega", R.escolhaEntrega]);
      const val = id => $(`#${id}`).value.trim();
      if (escolha && escolha.value === "app") {
        const cp = val("cep").replace(/\D/g, "");
        if (cp && cp.length !== 8) erros.push(["cep", R.cep]);
        if (!val("rua")) erros.push(["rua", R.rua]);
        if (!val("numero")) erros.push(["numero", R.numero]);
        if (!val("bairro")) erros.push(["bairro", R.bairro]);
        if (!val("cidade")) erros.push(["cidade", R.cidade]);
        if (val("estado").length !== 2) erros.push(["estado", R.uf]);
      }
      if (!marcarErros(e.target, erros)) return;
      st.entrega = escolha.value;
      if (st.entrega === "app") Object.assign(st.cliente, { cep: val("cep"), rua: val("rua"), numero: val("numero"), comp: val("comp"), bairro: val("bairro"), cidade: val("cidade"), estado: val("estado").toUpperCase() });
      guarda.gravar("sc-cliente", st.cliente, ss);
      guarda.gravar("sc-entrega", st.entrega, ss);

      // Confere o estoque ANTES de mostrar o PIX: ninguém paga por uma peça que já acabou
      const btn = $('button[type="submit"]', form);
      const rotulo = btn.innerHTML;
      form.dataset.ocupado = "1"; btn.disabled = true; btn.classList.add("ocupado"); btn.textContent = T.produto.conferindo.replace(/[.…\s]+$/, "");
      const res = await buscarEstoque(true);
      delete form.dataset.ocupado; btn.disabled = false; btn.classList.remove("ocupado"); btn.innerHTML = rotulo;
      if (!st.sacola.length) { navegar(); return; }
      if (!res.ok) { marcarErros(form, [["grupo-entrega", T.erros.lojaFora]]); return; }
      if (res.mudou) { desenharResumo(); marcarErros(form, [["grupo-entrega", T.erros.estoqueAntesPagar]]); return; }

      if (!st.txid) { st.txid = gerarTxid(); guarda.gravar("sc-txid", st.txid, ss); }
      registrarIntencao();
      location.hash = "#/finalizar/pagamento";
    });
  }

  async function buscarCep(cep) {
    avisar(T.avisos.buscandoCep);
    try {
      const r = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
      if (r.erro) throw new Error("não achou");
      $("#rua").value = r.logradouro || $("#rua").value;
      $("#bairro").value = r.bairro || $("#bairro").value;
      $("#cidade").value = r.localidade || $("#cidade").value;
      $("#estado").value = r.uf || $("#estado").value;
      avisar(T.avisos.cepOk);
      $("#numero").focus();
    } catch (e) {
      avisar(T.avisos.cepErro);
    }
  }

  function gerarTxid() {
    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const rnd = new Uint32Array(6);
    crypto.getRandomValues(rnd);
    return "LJ" + Array.from(rnd, n => ch[n % ch.length]).join("");
  }

  function dadosIntencao() {
    const c = st.cliente;
    const ids = [...new Set(st.sacola.map(i => i.produto))];
    const tamanhos = ids.map(id => {
      const p = porId(id);
      return `${p ? p.nome : id} ${st.sacola.filter(i => i.produto === id).map(i => `${i.qtd}x ${i.tamanho}`).join(", ")}`;
    }).join("; ");
    return { txid: st.txid, produto: ids.join(" + "), nome: c.nome, zap: c.zap, tamanhos, endereco: st.entrega === "app" ? enderecoTexto() : "RETIRADA", valor: subtotal() };
  }
  const enderecoTexto = () => { const c = st.cliente; return `${c.rua}, ${c.numero}${c.comp ? " " + c.comp : ""} - ${c.bairro}, ${c.cidade}-${c.estado}${c.cep ? ", " + c.cep : ""}`; };
  function registrarIntencao() {
    chamar(Object.assign({ action: "intencao" }, dadosIntencao()), { tentativas: 1, tempo: 15000 }).catch(e => console.warn("Intenção:", e));
  }
  const ultimoClique = {};
  function registrarClique(metodo) {
    if (!st.txid || Date.now() - (ultimoClique[metodo] || 0) < 5000) return;
    ultimoClique[metodo] = Date.now();
    chamar(Object.assign({ action: "clique", metodo }, dadosIntencao()), { tentativas: 1, tempo: 15000, keepalive: true }).catch(e => console.warn("Clique:", e));
  }

  // ---------- PIX (BR Code do Banco Central) ----------
  const pixTexto = (s, max) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7E]/g, "").trim().substring(0, max);
  const campoPix = (id, v) => id + String(v.length).padStart(2, "0") + v;
  function payloadPix(valor) {
    const chave = String(LOJA.pix.chave).replace(/\s/g, "");
    let p = campoPix("00", "01");
    p += campoPix("26", campoPix("00", "br.gov.bcb.pix") + campoPix("01", chave));
    p += campoPix("52", "0000") + campoPix("53", "986") + campoPix("54", valor.toFixed(2));
    p += campoPix("58", "BR") + campoPix("59", pixTexto(LOJA.pix.nome, 25)) + campoPix("60", pixTexto(LOJA.pix.cidade, 15));
    p += campoPix("62", campoPix("05", (st.txid || "***").substring(0, 25)));
    p += "6304";
    let crc = 0xFFFF;
    for (let i = 0; i < p.length; i++) {
      crc ^= p.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return p + crc.toString(16).toUpperCase().padStart(4, "0");
  }
  function qrSvg(texto) {
    try {
      if (typeof qrcode !== "function") return "";
      const q = qrcode(0, "M");
      q.addData(texto);
      q.make();
      return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) { return ""; }
  }

  function etapaPagamento(box) {
    const K = T.checkout;
    if (!st.txid) { st.txid = gerarTxid(); guarda.gravar("sc-txid", st.txid, ss); }
    const opc = (v, tit, d) => `<label class="opcao"><input type="radio" name="pagamento" value="${v}" ${st.pagamento === v ? "checked" : ""}>
      <span class="opcao-caixa"><span class="opcao-titulo">${esc(tit)}</span><span class="opcao-preco"></span><span class="opcao-desc">${esc(d)}</span></span></label>`;
    box.innerHTML = `
      <form class="form" id="form-pag" novalidate>
        <h2>${esc(K.pagamentoTitulo)}</h2>
        <fieldset class="opcoes">
          <legend>${esc(K.pagamentoPergunta)}</legend>
          ${PIX_OK ? opc("pix", K.pix, K.pixDescricao) : ""}
          ${opc("card", K.cartao, t(K.cartaoDescricao, { taxa: taxaTexto() }))}
        </fieldset>
        ${PIX_OK ? "" : `<p class="nota">${esc(K.pixIndisponivel)}</p>`}
        <div id="pag-detalhe"></div>
        <div class="campo">
          <span class="rotulo" id="rot-comp">${esc(K.comprovante)}</span>
          <p class="dica" id="dica-comp">${esc(K.comprovanteDica)}</p>
          <div class="anexo ${st.comprovante ? "ok" : ""}" id="anexo">
            <input type="file" id="comprovante" accept="image/*,application/pdf" aria-labelledby="rot-comp" aria-describedby="dica-comp">
            <div class="anexo-caixa" aria-hidden="true"><span id="anexo-ico">${st.comprovante ? ICONES.ok : ICONES.anexo}</span><div><strong id="anexo-txt">${st.comprovante ? esc(st.comprovante.nome) : esc(K.anexar)}</strong><p class="nota" id="anexo-sub">${esc(st.comprovante ? K.trocar : K.anexarDica)}</p></div></div>
          </div>
        </div>
        <div class="navega">
          <a class="link-btn" href="#/finalizar/entrega">${esc(K.voltar)}</a>
          <button type="submit" class="btn btn-principal" id="btn-finalizar"><span class="btn-txt">${esc(K.finalizar)}</span></button>
        </div>
      </form>`;
    desenharPagamento();
    $$('input[name="pagamento"]').forEach(r => r.addEventListener("change", () => { st.pagamento = r.value; desenharPagamento(); desenharResumo(); }));
    $("#comprovante").addEventListener("change", e => lerComprovante(e.target));
    $("#form-pag").addEventListener("submit", e => { e.preventDefault(); finalizar(); });
  }

  function desenharPagamento() {
    const el = $("#pag-detalhe");
    if (!el) return;
    const K = T.checkout;
    if (st.pagamento === "pix" && PIX_OK) {
      const codigo = payloadPix(subtotal());
      el.innerHTML = `<div class="pag-caixa">
        <div class="pix-grade">
          <div class="qr" role="img" aria-label="QR Code do PIX de ${dinheiro(subtotal())}">${qrSvg(codigo)}</div>
          <div style="display:grid;gap:6px">
            <p class="nota">${esc(K.valorPix)}</p>
            <p class="valor-grande">${dinheiro(subtotal())}</p>
            <p class="nota">${esc(K.instrucaoPix)}</p>
          </div>
        </div>
        <div class="pix-codigo" id="pix-codigo" aria-label="Código PIX copia e cola">${esc(codigo)}</div>
        <button type="button" class="btn btn-larga" data-acao="copiar-pix"><span class="btn-txt">${esc(K.copiarPix)}</span></button>
      </div>`;
    } else {
      el.innerHTML = `<div class="pag-caixa">
        <p class="nota">${esc(K.valorCartao)}</p>
        <p class="valor-grande">${dinheiro(total())}</p>
        <p class="nota">${esc(t(K.instrucaoCartao, { taxa: taxaTexto() }))}</p>
        <button type="button" class="btn btn-larga" data-acao="abrir-mp">${esc(K.abrirMercadoPago)}${ICONES.seta}</button>
        <p class="nota">${esc(temPreVenda() ? K.avisoCartaoPreVenda : K.avisoCartao)}</p>
      </div>`;
    }
  }

  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = texto; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { /* */ }
      ta.remove();
      return ok;
    }
  }

  function lerComprovante(input) {
    const f = input.files[0];
    if (!f) return;
    const A = T.avisos;
    const pronto = (base64, mime, nome) => {
      st.comprovante = { base64, mime, nome };
      $("#anexo").classList.add("ok");
      $("#anexo-ico").innerHTML = ICONES.ok;
      $("#anexo-txt").textContent = nome;
      $("#anexo-sub").textContent = T.checkout.trocar;
      avisar(A.comprovanteOk);
    };
    if (f.type.startsWith("image/")) {
      const leitor = new FileReader();
      leitor.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const max = 1280;
          let w = img.width, h = img.height;
          if (w > h && w > max) { h *= max / w; w = max; } else if (h >= w && h > max) { w *= max / h; h = max; }
          const cv = document.createElement("canvas");
          cv.width = w; cv.height = h;
          const ctx = cv.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          pronto(cv.toDataURL("image/jpeg", 0.72).split(",")[1], "image/jpeg", f.name || "comprovante.jpg");
        };
        img.onerror = () => avisar(A.imagemRuim);
        img.src = ev.target.result;
      };
      leitor.readAsDataURL(f);
    } else if (f.type === "application/pdf") {
      if (f.size > 5 * 1024 * 1024) { input.value = ""; return avisar(A.pdfGrande); }
      const leitor = new FileReader();
      leitor.onload = ev => pronto(ev.target.result.split(",")[1], "application/pdf", f.name);
      leitor.readAsDataURL(f);
    } else { input.value = ""; avisar(A.arquivoErrado); }
  }

  let finalizando = false;
  async function finalizar() {
    if (finalizando) return;
    const K = T.checkout, R = T.erros;
    const form = $("#form-pag");
    const erros = [];
    if (!st.comprovante) erros.push(["comprovante", R.comprovante]);
    const fechados = st.sacola.map(i => porId(i.produto)).filter(p => !p || situacao(p) !== "ativo");
    if (fechados.length) erros.push(["comprovante", t(R.vendasFechadas, { nome: fechados.map(p => p ? p.nome : "um item").join(", ") })]);
    if (!marcarErros(form, erros)) return;

    finalizando = true;
    const btn = $("#btn-finalizar");
    btn.disabled = true; btn.classList.add("ocupado");
    $(".btn-txt", btn).textContent = K.enviando;
    const c = st.cliente;
    const pedido = {
      action: "pedido", txid: st.txid,
      cliente: st.entrega === "app" ? c : { nome: c.nome, zap: c.zap },
      // tipo e prazo vão junto: a mensagem do WhatsApp segue o que está em produtos.js
      itens: st.sacola.map(i => { const p = porId(i.produto) || {}; return { produto: i.produto, tamanho: i.tamanho, qtd: i.qtd, tipo: p.tipo, prazo: prazo(p) }; }),
      frete: st.entrega, pagamento: st.pagamento, total: total(),
      fileBase64: st.comprovante.base64, fileMime: st.comprovante.mime, fileName: st.comprovante.nome
    };
    const destravar = () => { finalizando = false; btn.disabled = false; btn.classList.remove("ocupado"); $(".btn-txt", btn).textContent = K.finalizar; };
    try {
      const r = await chamar(pedido, { tempo: 45000, tentativas: 2 });
      if (r.status === "sucesso") {
        const resumo = st.sacola.map(i => { const p = porId(i.produto); return `${i.qtd}x ${p ? p.nome : i.produto} (${i.tamanho})`; });
        guarda.gravar("sc-ultimo", { id: r.orderId, itens: resumo, total: r.total ?? total(), pagamento: st.pagamento, entrega: st.entrega, pre: temPreVenda(), prazos: prazosNaSacola() }, ss);
        st.sacola = []; salvarSacola();
        st.txid = null; guarda.apagar("sc-txid", ss);
        st.comprovante = null;
        atualizarContador();
        finalizando = false;
        location.hash = `#/pedido/${encodeURIComponent(r.orderId)}`;
        buscarEstoque(true);
        return;
      }
      if (r.status === "erro_estoque") {
        const p = porId(r.produto);
        destravar();
        await buscarEstoque(true);
        marcarErros(form, [["comprovante", t(R.acabouEstoque, { tam: r.tamanho || "", nome: p ? p.nome : "camisa" })]]);
        desenharResumo(); desenharPagamento();
        return;
      }
      throw Object.assign(new Error(r.detalhe || "erro"), { doServidor: true });
    } catch (e) {
      destravar();
      console.error("Pedido não enviado:", e);
      marcarErros(form, [["comprovante", e.doServidor ? t(R.naoSalvou, { valor: e.message }) : e.semPlanilha ? R.semPlanilha : R.semConexao]]);
    }
  }

  // ================================================================ CONFIRMAÇÃO
  function telaPedido(main, id) {
    const O = T.confirmacao;
    aplicarTema("escuro");
    document.title = `${O.titulo}: ${id} | Shitbot Coral`;
    const u = guarda.ler("sc-ultimo", ss);
    const meu = u && u.id === id ? u : null;
    const texto = t(O.mensagemWhats, { numero: id }) + (meu ? ` (${meu.itens.join(", ")})` : "");
    main.innerHTML = `
      <section class="confirmado" aria-labelledby="titulo-ok">
        <svg class="check" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/><path d="M30 52l13 13 27-29"/></svg>
        <h1 id="titulo-ok">${esc(O.titulo)}</h1>
        <p class="numero-pedido"><span>${esc(O.numero)}</span><strong>${esc(id)}</strong></p>
        ${meu ? `<div class="painel">
          <p><strong>${esc(O.itens)}</strong> ${esc(meu.itens.join(", "))}</p>
          <p><strong>${esc(O.total)}</strong> ${dinheiro(meu.total)} (${meu.pagamento === "pix" ? "PIX" : "cartão"})</p>
          <p><strong>${esc(O.recebimento)}</strong> ${esc(meu.entrega === "app" ? T.entrega.appTitulo : T.entrega.retiradaTitulo)}</p>
          ${meu.pre ? `<p><strong>${esc(O.preVenda)}</strong> ${esc(O.preVendaTexto)}${meu.prazos.length ? `, ${esc(meu.prazos.join(", "))}` : ""}.</p>` : ""}
        </div>` : ""}
        <p class="nota">${esc(O.texto)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          <a class="btn btn-whats" href="https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">${esc(O.whatsapp)}<span class="so-leitor"> (abre em nova aba)</span></a>
          <a class="btn btn-vidro" href="#/">${esc(O.voltar)}</a>
        </div>
      </section>`;
    if (meu && !calmo()) setTimeout(confete, 350);
  }

  // Confete branco com detalhes no vermelho da marca
  function confete() {
    const cv = document.createElement("canvas");
    cv.className = "confete"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cores = ["#FFFFFF", "#FFFFFF", "#D9D9DE", "#FFFFFF", "#E11D3A"];
    const ps = Array.from({ length: 130 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35,
      vx: (Math.random() - .5) * 15, vy: -Math.random() * 14 - 5,
      w: 5 + Math.random() * 7, h: 7 + Math.random() * 9, r: Math.random() * 6, vr: (Math.random() - .5) * .35,
      c: cores[Math.floor(Math.random() * cores.length)]
    }));
    const t0 = performance.now();
    const passo = agora => {
      const dt = (agora - t0) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => {
        p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - dt / 3.2);
        ctx.fillStyle = p.c;
        const hh = p.h * Math.abs(Math.cos(p.r * 2));
        ctx.fillRect(-p.w / 2, -hh / 2, p.w, hh);
        ctx.restore();
      });
      if (dt < 3.2) requestAnimationFrame(passo); else cv.remove();
    };
    requestAnimationFrame(passo);
  }

  function telaNada(main) {
    const N = T.naoEncontrada;
    aplicarTema("escuro");
    document.title = `${N.titulo} | Shitbot Coral`;
    main.innerHTML = `<section class="vazio-tela"><h1>${esc(N.titulo)}</h1><p>${esc(N.texto)}</p><a class="btn btn-principal" href="#/">${esc(N.botao)}${ICONES.seta}</a></section>`;
  }

  // ================================================================ eventos
  function irColecao() {
    const c = $("#colecao");
    if (c) { c.scrollIntoView({ behavior: calmo() ? "auto" : "smooth" }); c.focus({ preventScroll: true }); }
  }
  document.addEventListener("click", async e => {
    const alvo = e.target.closest("[data-acao]");
    if (!alvo) return;
    const acao = alvo.dataset.acao;
    const K = T.checkout, A = T.avisos;
    if (acao === "tam") escolherTamanho(alvo);
    else if (acao === "adicionar") adicionar();
    else if (acao === "rapida") { e.preventDefault(); compraRapida(alvo); }
    else if (acao === "abrir-sacola") abrirSacola();
    else if (acao === "fechar-sacola") fecharSacola(alvo.tagName !== "A");
    else if (acao === "mais") mudarQtd(+alvo.dataset.idx, +1);
    else if (acao === "menos") mudarQtd(+alvo.dataset.idx, -1);
    else if (acao === "remover") remover(+alvo.dataset.idx);
    else if (acao === "ir-colecao") { e.preventDefault(); irColecao(); }
    else if (acao === "foto") { const tr = $("#trilho"); tr.scrollTo({ left: tr.clientWidth * +alvo.dataset.i, behavior: calmo() ? "auto" : "smooth" }); }
    else if (acao === "medidas") { const d = $("#det-medidas"); d.open = true; d.scrollIntoView({ block: "start", behavior: calmo() ? "auto" : "smooth" }); $("summary", d).focus({ preventScroll: true }); }
    else if (acao === "filtro") {
      guarda.gravar("sc-filtro", alvo.dataset.valor, ss);
      const troca = () => { desenhar(rota()); $("#colecao").scrollIntoView(); $(`.filtro[data-valor="${alvo.dataset.valor}"]`).focus({ preventScroll: true }); };
      if (document.startViewTransition && !calmo()) document.startViewTransition(troca); else troca();
    }
    else if (acao === "ir-campo") { e.preventDefault(); const c = $(`#${alvo.dataset.campo}`); if (c) (c.matches("fieldset") ? $("input", c) : c).focus(); }
    else if (acao === "copiar-pix") {
      registrarClique("pix");
      const ok = await copiar($("#pix-codigo").textContent);
      alvo.classList.toggle("feito", ok);
      $(".btn-txt", alvo).textContent = ok ? K.pixCopiado : A.pixNaoCopiou;
      avisar(ok ? A.pixCopiado : A.pixNaoCopiou);
      setTimeout(() => { if (document.contains(alvo)) { alvo.classList.remove("feito"); $(".btn-txt", alvo).textContent = K.copiarPix; } }, 2500);
    }
    else if (acao === "abrir-mp") {
      registrarClique("card");
      await copiar(total().toFixed(2).replace(".", ","));
      avisar(t(A.valorCopiado, { valor: dinheiro(total()) }));
      window.open(LOJA.mercadoPago, "_blank", "noopener");
    }
  });

  // "Coleção" no topo: rola até a grade (ou volta ao início e rola)
  let irDepois = false;
  $$(".topo-link[data-ir]").forEach(a => a.addEventListener("click", e => {
    if (rota().nome === "vitrine") { e.preventDefault(); irColecao(); } else irDepois = true;
  }));
  window.addEventListener("hashchange", () => { if (irDepois && rota().nome === "vitrine") { irDepois = false; setTimeout(irColecao, 650); } });

  $("#sacola-btn").addEventListener("click", abrirSacola);
  $("#sacola-fechar").addEventListener("click", () => fecharSacola());
  $("#veu").addEventListener("click", () => fecharSacola());
  window.addEventListener("hashchange", navegar);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && st.servidor.status !== "carregando") buscarEstoque(true); });
  window.addEventListener("storage", e => { if (e.key === "sc-sacola") { st.sacola = guarda.ler("sc-sacola") || []; atualizarAoVivo(); } });

  const zapLoja = `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(T.rodape.mensagemWhats)}`;
  $$(".js-whats").forEach(a => { a.href = zapLoja; a.target = "_blank"; a.rel = "noopener"; });
  $$(".js-insta").forEach(a => { a.href = LOJA.instagram; a.target = "_blank"; a.rel = "noopener"; });

  // Estoque sempre fresco: confere de novo a cada 45 s com a página aberta e ao abrir um produto
  setInterval(() => { if (document.visibilityState === "visible" && st.servidor.status !== "carregando") buscarEstoque(true); }, 45000);
  window.addEventListener("hashchange", () => { if (rota().nome === "produto" && st.servidor.status !== "carregando") buscarEstoque(true); });

  buscarEstoque();      // começa a buscar o estoque já, em segundo plano
  atualizarContador();
  navegar();
})();