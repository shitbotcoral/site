/* ==========================================================================
   SHITBOT CORAL v2.0 — Art Direction Dual PNG, Preloader Real & PES 1200x400
   ========================================================================== */
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxDD4sEQooBZzYA0-0mHm3AkFxOtPtLLWpMfHS-Rl0zB1Xt5q6N_tZFMvQ62mqrbLkuAg/exec";
const CHAVE_STORAGE = "shitbot_patrocinadores_v6";
const TETO_MAXIMO = 2000;

/* Remove caches antigos */
["shitbot_patrocinadores_v1", "shitbot_patrocinadores_v2", "shitbot_patrocinadores_v3", "shitbot_patrocinadores_v4", "shitbot_patrocinadores_v5"].forEach(k => {
  try { localStorage.removeItem(k); } catch {}
});

/* Coordenadas calibradas para apresentacao.png (16:9 Desktop) */
const POSICOES_DESKTOP = [
  { id: "pos-1", x: 53.2, y: 62.5, w: 18.5, h: 8.5, rot: -1 },
  { id: "pos-2", x: 53.2, y: 73.5, w: 18.0, h: 8.0, rot: -1 },
  { id: "pos-3", x: 53.2, y: 84.5, w: 17.5, h: 7.5, rot: -1 },
  { id: "pos-4", x: 45.8, y: 39.2, w: 6.2,  h: 3.2, rot: -12 },
  { id: "pos-5", x: 60.5, y: 39.2, w: 6.2,  h: 3.2, rot: 12 },
  { id: "pos-6", x: 40.3, y: 48.0, w: 6.5,  h: 3.2, rot: -74 },
  { id: "pos-7", x: 66.2, y: 48.0, w: 6.5,  h: 3.2, rot: 74 }
];

/* Coordenadas calibradas para apresentacao-mobile.png (9:16 Mobile) */
const POSICOES_MOBILE = [
  { id: "pos-1", x: 41.8, y: 59.0, w: 38.0, h: 6.5, rot: -1 },
  { id: "pos-2", x: 41.8, y: 67.2, w: 37.0, h: 6.2, rot: -1 },
  { id: "pos-3", x: 41.8, y: 75.2, w: 36.0, h: 6.0, rot: -1 },
  { id: "pos-4", x: 25.0, y: 41.2, w: 13.0, h: 2.6, rot: -10 },
  { id: "pos-5", x: 58.5, y: 41.2, w: 13.0, h: 2.6, rot: 10 },
  { id: "pos-6", x: 13.0, y: 47.8, w: 13.5, h: 2.6, rot: -72 },
  { id: "pos-7", x: 71.2, y: 47.8, w: 13.5, h: 2.6, rot: 72 }
];

/* Preloader Elements */
const preloaderEl = document.getElementById("preloader");
const preloaderBarra = document.getElementById("preloader-barra");
const preloaderPct = document.getElementById("preloader-pct");
const preloaderStatus = document.getElementById("preloader-status");

/* Palco & Ranking Elements */
const palcoFoto = document.getElementById("palco-foto");
const palcoCamera = document.getElementById("palco-camera");
const camadaCamisa = document.getElementById("camada-camisa");
const fotoJogador = document.getElementById("foto-jogador");
const areaRanking = document.getElementById("area-ranking");
const contadorEl = document.getElementById("contador-patrocinadores");
const toastEl = document.getElementById("toast");

/* Modais */
const modalImpulsoVeu = document.getElementById("modal-impulso-veu");
const modalCadastroVeu = document.getElementById("modal-cadastro-veu");
const modalCotasVeu = document.getElementById("modal-cotas-veu");

/* Modal 1: Impulso */
const modalMarcaInfo = document.getElementById("modal-marca-info");
const formImpulsionar = document.getElementById("form-impulsionar");
const inputDoadorImpulso = document.getElementById("nome-doador-impulso");
const atalhosValor = document.getElementById("atalhos-valor");
const inputAporte = document.getElementById("valor-aporte");
const modalPrevisao = document.getElementById("modal-previsao");
const etapaPixImpulso = document.getElementById("etapa-pix-impulso");
const pixQrImpulso = document.getElementById("pix-qr-impulso");
const pixValorImpulso = document.getElementById("pix-valor-impulso");
const pixCodeImpulso = document.getElementById("pix-code-impulso");
const btnCopiarImpulso = document.getElementById("btn-copiar-impulso");
const btnPagoImpulso = document.getElementById("btn-pago-impulso");

/* Modal 2: Cadastro Novo */
const cadastroDicaTopo = document.getElementById("cadastro-dica-topo");
const formPatrocinio = document.getElementById("form-patrocinio");
const inputEmpresa = document.getElementById("nome-empresa");
const inputSocial = document.getElementById("social-empresa");
const inputDoadorNovo = document.getElementById("nome-doador-novo");
const inputLogo = document.getElementById("input-logo");
const previewLogo = document.getElementById("preview-logo");
const nomeArquivo = document.getElementById("nome-arquivo");
const inputValor = document.getElementById("valor-lance");
const etapaPixNovo = document.getElementById("etapa-pix-novo");
const pixQrNovo = document.getElementById("pix-qr-novo");
const pixValorNovo = document.getElementById("pix-valor-novo");
const pixCodeNovo = document.getElementById("pix-code-novo");
const btnCopiarNovo = document.getElementById("btn-copiar-novo");
const btnPagoNovo = document.getElementById("btn-pago-novo");

let patrocinadores = [];
let logoHorizontalBase64 = null;
let patrocinadorSelecionadoModal = null;
let transacaoPendenteAtual = null;
let timerBotaoPaguei = null;
let enviandoDados = false;
let preloaderFinalizado = false;
let modoMobileAtual = window.innerWidth < 1024;

function obterPosicoesAtivas() {
  return window.innerWidth < 1024 ? POSICOES_MOBILE : POSICOES_DESKTOP;
}

function obterSrcFotoIdeal() {
  return window.innerWidth < 1024 ? "apresentacao-mobile.png" : "apresentacao.png";
}

/* ==========================================================================
   UTILITÁRIOS DE SANITIZAÇÃO & CONVERSÃO DE @INSTAGRAM / SITE
   ========================================================================== */
function sanitizarTexto(txt, max = 50) {
  return String(txt || "")
    .replace(/[<>{}[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizarChaveMarca(nome) {
  return String(nome || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function formatarLinkSocial(valor) {
  const limpo = sanitizarTexto(valor, 80);
  if (!limpo) return null;

  if (limpo.startsWith("@")) {
    const user = limpo.replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "");
    return user ? { label: `@${user}`, url: `https://instagram.com/${user}` } : null;
  }

  if (/^https?:\/\//i.test(limpo)) {
    return { label: limpo.replace(/^https?:\/\/(www\.)?/i, ""), url: limpo };
  }

  if (limpo.includes(".")) {
    return { label: limpo.replace(/^www\./i, ""), url: `https://${limpo}` };
  }

  const user = limpo.replace(/[^a-zA-Z0-9._]/g, "");
  return user ? { label: `@${user}`, url: `https://instagram.com/${user}` } : null;
}

function mostrarToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove("on"), 3500);
}

/* ==========================================================================
   PRELOADER v2.0 COM BARRA DE PROGRESSO REAL (0% -> 100%)
   ========================================================================== */
function atualizarProgresso(pct, texto) {
  const val = Math.min(100, Math.max(0, Math.round(pct)));
  preloaderBarra.style.width = val + "%";
  preloaderPct.textContent = val + "%";
  if (texto) preloaderStatus.textContent = texto;
}

function finalizarPreloader() {
  if (preloaderFinalizado) return;
  preloaderFinalizado = true;
  atualizarProgresso(100, "Manto pronto!");
  sincronizarEnquadramentoCamisa();
  setTimeout(() => {
    preloaderEl.classList.add("oculto");
  }, 240);
}

function aguardarFotoJogador() {
  return new Promise((resolve) => {
    const srcIdeal = obterSrcFotoIdeal();
    const fallbacks = window.innerWidth < 1024
      ? ["apresentacao-mobile.png", "apresentacao.png"]
      : ["apresentacao.png", "apresentacao-mobile.png"];
    let idx = 0;

    const onLoad = () => {
      fotoJogador.removeEventListener("load", onLoad);
      fotoJogador.removeEventListener("error", onError);
      resolve();
    };

    const onError = () => {
      idx++;
      if (idx < fallbacks.length) {
        fotoJogador.src = fallbacks[idx];
      } else {
        fotoJogador.removeEventListener("load", onLoad);
        fotoJogador.removeEventListener("error", onError);
        resolve();
      }
    };

    fotoJogador.addEventListener("load", onLoad);
    fotoJogador.addEventListener("error", onError);

    if (fotoJogador.getAttribute("src") !== srcIdeal) {
      fotoJogador.src = srcIdeal;
    } else if (fotoJogador.complete && fotoJogador.naturalWidth > 0) {
      onLoad();
    }
  });
}

async function precarregarLogosTop10(lista) {
  const top10 = lista.slice(0, 10).filter(p => p.logo);
  if (top10.length === 0) return;

  await Promise.all(top10.map(pat => new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      if (img.decode) {
        try { await img.decode(); } catch {}
      }
      resolve();
    };
    img.onerror = resolve;
    img.src = pat.logo;
  })));
}

async function iniciarAplicacao() {
  montarCamadasCamisa();
  atualizarProgresso(15, "Carregando uniforme oficial...");

  const travaSeguranca = setTimeout(() => {
    renderizarTudo();
    finalizarPreloader();
  }, 4500);

  await aguardarFotoJogador();
  atualizarProgresso(45, "Sincronizando ranking ao vivo...");

  await carregarPatrocinadores(true);
  atualizarProgresso(78, "Estampando marcas no manto...");

  await precarregarLogosTop10(patrocinadores);
  renderizarTudo();

  clearTimeout(travaSeguranca);
  finalizarPreloader();

  setInterval(() => carregarPatrocinadores(false), 12000);
}

/* ==========================================================================
   MOVIMENTO DE CÂMERA AGRUPADO & ENQUADRAMENTO DA CAMISA
   ========================================================================== */
palcoCamera.classList.add("modo-idle");

function aplicarMovimentoCamera(clientX, clientY) {
  const rect = palcoFoto.getBoundingClientRect();
  const normX = ((clientX - rect.left) / rect.width) - 0.5;
  const normY = ((clientY - rect.top) / rect.height) - 0.5;

  palcoCamera.classList.remove("modo-idle");
  palcoCamera.style.setProperty("--cam-x", (-normX * 22).toFixed(2) + "px");
  palcoCamera.style.setProperty("--cam-y", (-normY * 14).toFixed(2) + "px");
  palcoCamera.style.setProperty("--cam-rx", (-normY * 2.0).toFixed(2) + "deg");
  palcoCamera.style.setProperty("--cam-ry", (normX * 2.4).toFixed(2) + "deg");
}

function resetarMovimentoCamera() {
  palcoCamera.style.setProperty("--cam-x", "0px");
  palcoCamera.style.setProperty("--cam-y", "0px");
  palcoCamera.style.setProperty("--cam-rx", "0deg");
  palcoCamera.style.setProperty("--cam-ry", "0deg");
  palcoCamera.classList.add("modo-idle");
}

palcoFoto.addEventListener("mousemove", (e) => aplicarMovimentoCamera(e.clientX, e.clientY));
palcoFoto.addEventListener("mouseleave", resetarMovimentoCamera);

palcoFoto.addEventListener("touchmove", (e) => {
  if (e.touches && e.touches[0]) {
    aplicarMovimentoCamera(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });
palcoFoto.addEventListener("touchend", resetarMovimentoCamera);

function aplicarCoordenadasCamisa() {
  const posicoes = obterPosicoesAtivas();
  posicoes.forEach((pos) => {
    const div = document.getElementById(pos.id);
    if (!div) return;
    div.style.left = pos.x + "%";
    div.style.top = pos.y + "%";
    div.style.width = pos.w + "%";
    div.style.height = pos.h + "%";
    div.style.setProperty("--rot", pos.rot + "deg");
  });
}

function sincronizarEnquadramentoCamisa() {
  aplicarCoordenadasCamisa();
  if (!fotoJogador.naturalWidth || !fotoJogador.naturalHeight) return;

  const boxW = palcoCamera.clientWidth;
  const boxH = palcoCamera.clientHeight;
  const imgRatio = fotoJogador.naturalWidth / fotoJogador.naturalHeight;
  const boxRatio = boxW / boxH;

  let renderW, renderH, offsetX, offsetY;
  if (boxRatio > imgRatio) {
    renderW = boxW;
    renderH = boxW / imgRatio;
    offsetX = 0;
    offsetY = (boxH - renderH) * 0.5;
  } else {
    renderH = boxH;
    renderW = boxH * imgRatio;
    const alignX = window.innerWidth >= 1024 ? 0.45 : 0.5;
    offsetX = (boxW - renderW) * alignX;
    offsetY = 0;
  }

  camadaCamisa.style.width = renderW + "px";
  camadaCamisa.style.height = renderH + "px";
  camadaCamisa.style.left = offsetX + "px";
  camadaCamisa.style.top = offsetY + "px";
}

window.addEventListener("resize", () => {
  const novoModoMobile = window.innerWidth < 1024;
  if (novoModoMobile !== modoMobileAtual) {
    modoMobileAtual = novoModoMobile;
    fotoJogador.src = obterSrcFotoIdeal();
  }
  sincronizarEnquadramentoCamisa();
});

fotoJogador.addEventListener("load", sincronizarEnquadramentoCamisa);

/* ==========================================================================
   CONVERSÃO ALTA RESOLUÇÃO 1200x400 PNG (FIEL À LOGO ORIGINAL)
   ========================================================================== */
function converterParaHorizontalAltaRes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(img, 0, 0);

        const imgData = tempCtx.getImageData(0, 0, img.width, img.height).data;
        let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
        let encontrouPixel = false;

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const idx = (y * img.width + x) * 4;
            const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2], a = imgData[idx + 3];
            if (a > 20 && !(r > 248 && g > 248 && b > 248)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              encontrouPixel = true;
            }
          }
        }

        const cropX = encontrouPixel ? minX : 0;
        const cropY = encontrouPixel ? minY : 0;
        const cropW = encontrouPixel ? (maxX - minX + 1) : img.width;
        const cropH = encontrouPixel ? (maxY - minY + 1) : img.height;

        const larguraAlvo = 1200;
        const alturaAlvo = 400;
        const canvas = document.createElement("canvas");
        canvas.width = larguraAlvo;
        canvas.height = alturaAlvo;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, larguraAlvo, alturaAlvo);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const margem = 8;
        const escala = Math.min((larguraAlvo - margem * 2) / cropW, (alturaAlvo - margem * 2) / cropH);
        const drawW = cropW * escala;
        const drawH = cropH * escala;
        const offsetX = (larguraAlvo - drawW) / 2;
        const offsetY = (alturaAlvo - drawH) / 2;

        ctx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, offsetX, offsetY, drawW, drawH);
        resolve(canvas.toDataURL("image/png", 1.0));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

inputLogo.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  nomeArquivo.textContent = file.name;
  try {
    logoHorizontalBase64 = await converterParaHorizontalAltaRes(file);
    previewLogo.innerHTML = `<img src="${logoHorizontalBase64}" alt="Prévia">`;
  } catch {
    mostrarToast("Não foi possível ler essa imagem. Tente PNG ou JPG.");
  }
});

/* ==========================================================================
   RENDERIZAÇÃO DA CAMISA & MINI-TABELA GLASS (VALORES OCULTOS NA HOME)
   ========================================================================== */
function montarCamadasCamisa() {
  camadaCamisa.innerHTML = "";
  POSICOES_DESKTOP.forEach((pos) => {
    const div = document.createElement("div");
    div.className = "estampa-auto";
    div.id = pos.id;
    camadaCamisa.appendChild(div);
  });
  aplicarCoordenadasCamisa();
}

function obterClasseTier(pos) {
  if (pos === 1) return "tier-t1";
  if (pos === 2 || pos === 3) return "tier-t2";
  if (pos === 4 || pos === 5) return "tier-t3";
  if (pos === 6 || pos === 7) return "tier-t4";
  if (pos >= 8 && pos <= 10) return "tier-t5";
  return "tier-out fora-top10";
}

function destacarEstampaCamisa(posIdx, ativo) {
  const posicoes = obterPosicoesAtivas();
  if (posIdx < 0 || posIdx >= posicoes.length) return;
  const el = document.getElementById(posicoes[posIdx].id);
  if (el) el.classList.toggle("destaque-camisa", ativo);
}

function renderizarTudo() {
  patrocinadores.sort((a, b) => Number(b.valor) - Number(a.valor));
  const ativosTop10 = Math.min(patrocinadores.length, 10);
  contadorEl.textContent = `${ativosTop10}/10 no kit`;

  const posicoes = obterPosicoesAtivas();
  posicoes.forEach((pos, idx) => {
    const el = document.getElementById(pos.id);
    const pat = patrocinadores[idx];
    if (el) el.innerHTML = pat ? `<img src="${pat.logo}" alt="${pat.nome}">` : "";
  });

  if (patrocinadores.length === 0) {
    areaRanking.innerHTML = `<div class="lista-vazia">Nenhuma marca estampada ainda.<br>Toque em <b>Estampe sua Marca</b> abaixo!</div>`;
    return;
  }

  areaRanking.innerHTML = "";

  patrocinadores.forEach((pat, idx) => {
    const pos = idx + 1;

    if (pos === 11) {
      const div = document.createElement("div");
      div.className = "divisor-top10";
      div.textContent = "▲ Entram no Uniforme · ▼ Fora do Kit";
      areaRanking.appendChild(div);
    }

    const item = document.createElement("div");
    item.className = `mini-item ${obterClasseTier(pos)}`;
    item.innerHTML = `
      <div class="mini-pos">${pos}º</div>
      <div class="mini-logo"><img src="${pat.logo}" alt="${pat.nome}"></div>
      <div class="mini-nome">${pat.nome}</div>
      <button type="button" class="btn-mais" aria-label="Impulsionar ${pat.nome}">+</button>
    `;

    item.addEventListener("mouseenter", () => destacarEstampaCamisa(idx, true));
    item.addEventListener("mouseleave", () => destacarEstampaCamisa(idx, false));
    item.addEventListener("touchstart", () => destacarEstampaCamisa(idx, true), { passive: true });
    item.addEventListener("touchend", () => destacarEstampaCamisa(idx, false));

    item.querySelector(".btn-mais").addEventListener("click", () => abrirModalImpulso(pat));
    areaRanking.appendChild(item);
  });

  sincronizarEnquadramentoCamisa();
}

/* ==========================================================================
   GESTÃO DOS MODAIS & CHECKOUT PIX
   ========================================================================== */
function fecharTodosModais() {
  clearTimeout(timerBotaoPaguei);
  modalImpulsoVeu.hidden = true;
  modalCadastroVeu.hidden = true;
  modalCotasVeu.hidden = true;
  transacaoPendenteAtual = null;
}

document.querySelectorAll("[data-fechar-modal]").forEach(btn => {
  btn.addEventListener("click", fecharTodosModais);
});

[modalImpulsoVeu, modalCadastroVeu, modalCotasVeu].forEach(veu => {
  veu.addEventListener("click", (e) => {
    if (e.target === veu) fecharTodosModais();
  });
});

document.getElementById("btn-abrir-cotas").addEventListener("click", () => {
  fecharTodosModais();
  modalCotasVeu.hidden = false;
});

document.getElementById("btn-abrir-cadastro").addEventListener("click", () => {
  fecharTodosModais();
  formPatrocinio.hidden = false;
  etapaPixNovo.hidden = true;
  btnPagoNovo.hidden = true;

  if (patrocinadores.length >= 10) {
    const decimoValor = Number(patrocinadores[9].valor);
    const pisoTop10 = Math.max(20, Number((decimoValor + 1).toFixed(2)));
    cadastroDicaTopo.innerHTML = `Já existem 10 marcas no manto. Para entrar direto no uniforme agora, o valor mínimo sugerido é <b>R$ ${pisoTop10.toFixed(2).replace(".", ",")}</b> (lance inicial geral a partir de R$ 20,00).`;
  } else {
    cadastroDicaTopo.innerHTML = `Lance inicial a partir de <b>R$ 20,00</b>. Após criada, qualquer pessoa pode impulsionar sua marca a partir de R$ 1,00.`;
  }

  modalCadastroVeu.hidden = false;
});

function abrirModalImpulso(pat) {
  fecharTodosModais();
  patrocinadorSelecionadoModal = pat;

  formImpulsionar.hidden = false;
  etapaPixImpulso.hidden = true;
  btnPagoImpulso.hidden = true;

  const idxAtual = patrocinadores.findIndex(p => p.id === pat.id);
  const valorAtual = Number(pat.valor);
  const maiorValor = Number(patrocinadores[0].valor);

  const diffLider = Math.max(0, maiorValor - valorAtual);
  const paraVirar1 = Math.min(TETO_MAXIMO, Number((diffLider + 1).toFixed(2)));

  let paraSubir1 = 0;
  if (idxAtual > 0) {
    const acima = Number(patrocinadores[idxAtual - 1].valor);
    paraSubir1 = Math.min(TETO_MAXIMO, Number((Math.max(0, acima - valorAtual) + 1).toFixed(2)));
  }

  let paraEntrarTop10 = 0;
  if (idxAtual >= 10 && patrocinadores[9]) {
    const decimo = Number(patrocinadores[9].valor);
    paraEntrarTop10 = Math.min(TETO_MAXIMO, Number((Math.max(0, decimo - valorAtual) + 1).toFixed(2)));
  }

  const linkSocial = formatarLinkSocial(pat.social);

  modalMarcaInfo.innerHTML = `
    <img src="${pat.logo}" alt="${pat.nome}">
    <div style="min-width:0;">
      <strong style="display:block; font-size:.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${pat.nome}</strong>
      <span style="display:block; font-size:.78rem; color:var(--texto-2);">Acumulado atual: <b style="color:#fff;">R$ ${valorAtual.toFixed(2).replace(".", ",")}</b> (${idxAtual + 1}º lugar)</span>
      ${linkSocial ? `<a href="${linkSocial.url}" target="_blank" rel="noopener noreferrer" class="link-social-marca">Visitar ${linkSocial.label} ↗</a>` : ""}
    </div>
  `;

  atalhosValor.innerHTML = `
    <button type="button" class="chip-atalho" data-soma="1">+ R$ 1</button>
    <button type="button" class="chip-atalho" data-soma="5">+ R$ 5</button>
    <button type="button" class="chip-atalho" data-soma="10">+ R$ 10</button>
    ${paraEntrarTop10 > 0 && paraEntrarTop10 < TETO_MAXIMO ? `<button type="button" class="chip-atalho destaque" data-soma="${paraEntrarTop10}">Entrar no Top 10 (+R$ ${paraEntrarTop10.toFixed(0)})</button>` : ""}
    ${paraSubir1 > 0 && paraSubir1 !== paraVirar1 && paraSubir1 < TETO_MAXIMO ? `<button type="button" class="chip-atalho" data-soma="${paraSubir1}">Subir 1 pos. (+R$ ${paraSubir1.toFixed(0)})</button>` : ""}
    ${diffLider > 0 && diffLider < TETO_MAXIMO ? `<button type="button" class="chip-atalho destaque" data-soma="${paraVirar1}">Assumir 1º Master (+R$ ${paraVirar1.toFixed(0)})</button>` : ""}
  `;

  atalhosValor.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      inputAporte.value = Number(btn.dataset.soma);
      atualizarPrevisaoImpulso();
    });
  });

  inputAporte.value = 1;
  atualizarPrevisaoImpulso();
  modalImpulsoVeu.hidden = false;
}

function atualizarPrevisaoImpulso() {
  if (!patrocinadorSelecionadoModal) return;
  const soma = Math.max(0, Number(inputAporte.value) || 0);
  const novoTotal = Number((Number(patrocinadorSelecionadoModal.valor) + soma).toFixed(2));
  const simulacao = patrocinadores
    .map(p => p.id === patrocinadorSelecionadoModal.id ? novoTotal : Number(p.valor))
    .sort((a, b) => b - a);
  const novaPos = simulacao.indexOf(novoTotal) + 1;
  modalPrevisao.innerHTML = `Novo acumulado: <b>R$ ${novoTotal.toFixed(2).replace(".", ",")}</b> · Assume o <b>${novaPos}º lugar</b>`;
}

inputAporte.addEventListener("input", atualizarPrevisaoImpulso);

async function iniciarCheckoutPix(transacao, refs) {
  transacaoPendenteAtual = transacao;
  clearTimeout(timerBotaoPaguei);

  refs.formEl.hidden = true;
  refs.etapaPixEl.hidden = false;
  refs.btnPagoEl.hidden = true;

  refs.valorLabelEl.textContent = `R$ ${transacao.valor.toFixed(2).replace(".", ",")}`;
  refs.codeInputEl.value = "Gerando código PIX...";
  refs.qrImgEl.src = "";

  try {
    const resp = await fetch(`${URL_SHEETS}?acao=gerar_pix&valor=${transacao.valor}`);
    const dados = await resp.json();
    if (dados.ok && dados.payload) {
      refs.codeInputEl.value = dados.payload;
      refs.qrImgEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dados.payload)}`;
    } else {
      refs.codeInputEl.value = "Erro ao gerar código PIX.";
    }
  } catch {
    refs.codeInputEl.value = "Erro de conexão ao gerar PIX.";
  }
}

function configurarBotoesPix(btnCopiar, codeInput, btnPago) {
  btnCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codeInput.value);
    } catch {
      codeInput.select();
      document.execCommand("copy");
    }
    mostrarToast("Código PIX copiado! Pague no app do seu banco.");
    clearTimeout(timerBotaoPaguei);
    timerBotaoPaguei = setTimeout(() => {
      btnPago.hidden = false;
    }, 3000);
  });

  btnPago.addEventListener("click", async () => {
    if (!transacaoPendenteAtual || enviandoDados) return;
    enviandoDados = true;
    btnPago.disabled = true;
    btnPago.textContent = "Confirmando...";

    try {
      const temImagemBase64 = Boolean(transacaoPendenteAtual.logo && transacaoPendenteAtual.logo.startsWith("data:image"));

      if (temImagemBase64) {
        await fetch(URL_SHEETS, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(transacaoPendenteAtual)
        });

        aplicarAtualizacaoOtimista(transacaoPendenteAtual);
        mostrarToast(`${transacaoPendenteAtual.empresa} registrado no ranking!`);
        setTimeout(() => {
          enviandoDados = false;
          carregarPatrocinadores(false);
        }, 3500);
      } else {
        const params = new URLSearchParams({
          acao: "registrar",
          empresa: transacaoPendenteAtual.empresa,
          social: transacaoPendenteAtual.social || "",
          doador: transacaoPendenteAtual.doador,
          tipo: transacaoPendenteAtual.tipo,
          valor: String(transacaoPendenteAtual.valor),
          logo: ""
        });

        const resp = await fetch(`${URL_SHEETS}?${params.toString()}`);
        const res = await resp.json();

        if (res.ok && Array.isArray(res.ranking)) {
          patrocinadores = res.ranking;
          try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores)); } catch {}
          renderizarTudo();
          mostrarToast(`${transacaoPendenteAtual.empresa} atualizado!`);
        } else {
          mostrarToast(res.erro || "Não foi possível confirmar agora.");
        }
        enviandoDados = false;
      }
    } catch {
      enviandoDados = false;
      mostrarToast("Erro de rede ao confirmar.");
    }

    btnPago.disabled = false;
    btnPago.textContent = "Já paguei";
    fecharTodosModais();
  });
}

function aplicarAtualizacaoOtimista(tx) {
  const chave = normalizarChaveMarca(tx.empresa);
  const existente = patrocinadores.find(p => normalizarChaveMarca(p.nome) === chave);
  if (existente) {
    existente.valor = Number((Number(existente.valor) + tx.valor).toFixed(2));
    existente.aportes = (existente.aportes || 1) + 1;
    if (tx.logo) existente.logo = tx.logo;
    if (tx.social) existente.social = tx.social;
  } else {
    patrocinadores.push({
      id: chave || String(Date.now()),
      nome: tx.empresa,
      social: tx.social || "",
      valor: tx.valor,
      aportes: 1,
      logo: tx.logo
    });
  }
  try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores)); } catch {}
  renderizarTudo();
}

configurarBotoesPix(btnCopiarImpulso, pixCodeImpulso, btnPagoImpulso);
configurarBotoesPix(btnCopiarNovo, pixCodeNovo, btnPagoNovo);

formImpulsionar.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!patrocinadorSelecionadoModal) return;

  const doador = sanitizarTexto(inputDoadorImpulso.value, 50);
  const aporte = Number(inputAporte.value);

  if (!doador) {
    mostrarToast("Digite seu nome.");
    inputDoadorImpulso.focus();
    return;
  }
  if (isNaN(aporte) || aporte < 1 || aporte > TETO_MAXIMO) {
    mostrarToast(`O valor deve ser entre R$ 1,00 e R$ ${TETO_MAXIMO},00.`);
    inputAporte.focus();
    return;
  }

  await iniciarCheckoutPix(
    {
      empresa: patrocinadorSelecionadoModal.nome,
      social: patrocinadorSelecionadoModal.social || "",
      doador,
      tipo: "IMPULSÃO",
      valor: aporte,
      logo: ""
    },
    {
      formEl: formImpulsionar,
      etapaPixEl: etapaPixImpulso,
      valorLabelEl: pixValorImpulso,
      codeInputEl: pixCodeImpulso,
      qrImgEl: pixQrImpulso,
      btnPagoEl: btnPagoImpulso
    }
  );
});

formPatrocinio.addEventListener("submit", async (e) => {
  e.preventDefault();

  const empresa = sanitizarTexto(inputEmpresa.value, 45);
  const social = sanitizarTexto(inputSocial.value, 80);
  const doador = sanitizarTexto(inputDoadorNovo.value, 50);
  const valor = Number(inputValor.value);

  if (!empresa || !doador) {
    mostrarToast("Preencha o nome da marca e o seu nome.");
    return;
  }
  if (!logoHorizontalBase64) {
    mostrarToast("Anexe a imagem do logo.");
    return;
  }
  if (isNaN(valor) || valor < 20 || valor > TETO_MAXIMO) {
    mostrarToast(`O lance inicial deve ser entre R$ 20,00 e R$ ${TETO_MAXIMO},00.`);
    inputValor.focus();
    return;
  }

  const logoEnviar = logoHorizontalBase64;

  inputEmpresa.value = "";
  inputSocial.value = "";
  inputDoadorNovo.value = "";
  inputLogo.value = "";
  logoHorizontalBase64 = null;
  nomeArquivo.textContent = "Anexar";
  previewLogo.innerHTML = `<span class="placeholder-logo">LOGO</span>`;
  inputValor.value = 20;

  await iniciarCheckoutPix(
    {
      empresa,
      social,
      doador,
      tipo: "NOVO PATROCÍNIO",
      valor,
      logo: logoEnviar
    },
    {
      formEl: formPatrocinio,
      etapaPixEl: etapaPixNovo,
      valorLabelEl: pixValorNovo,
      codeInputEl: pixCodeNovo,
      qrImgEl: pixQrNovo,
      btnPagoEl: btnPagoNovo
    }
  );
});

async function carregarPatrocinadores(modoInicial = false) {
  if (enviandoDados && !modoInicial) return;
  try {
    const resp = await fetch(`${URL_SHEETS}?t=${Date.now()}`);
    const dados = await resp.json();
    if (Array.isArray(dados)) {
      patrocinadores = dados;
      try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores)); } catch {}
      if (!modoInicial) renderizarTudo();
      return;
    }
  } catch {}

  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo) patrocinadores = JSON.parse(salvo);
  } catch {}
  if (!modoInicial) renderizarTudo();
}

iniciarAplicacao();