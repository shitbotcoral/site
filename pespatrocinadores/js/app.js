const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxDD4sEQooBZzYA0-0mHm3AkFxOtPtLLWpMfHS-Rl0zB1Xt5q6N_tZFMvQ62mqrbLkuAg/exec";
const CHAVE_STORAGE = "shitbot_patrocinadores_v3";

const CENAS_CONFIG = [
  {
    id: "cena-frente",
    nome: "Frente",
    baseArquivo: "img/1",
    slots: [
      { rankIdx: 0, x: 50.3, y: 51.6, w: 18.5, h: 8.2, rot: 0 },    // 1º Barriga Master
      { rankIdx: 1, x: 50.3, y: 59.8, w: 16.5, h: 7.4, rot: 0 },    // 2º Barriga Meio
      { rankIdx: 2, x: 50.3, y: 67.6, w: 14.5, h: 6.8, rot: 0 },    // 3º Barriga Inferior
      { rankIdx: 4, x: 40.8, y: 36.6, w: 9.2,  h: 5.2, rot: -19 },  // 5º Ombro Dir
      { rankIdx: 3, x: 59.9, y: 36.6, w: 9.4,  h: 5.2, rot: 16 },   // 4º Ombro Esq
      { rankIdx: 6, x: 33.8, y: 46.2, w: 10.5, h: 6.2, rot: -78 },  // 7º Manga Dir (ampliado)
      { rankIdx: 5, x: 66.5, y: 44.8, w: 10.5, h: 6.2, rot: 78 },   // 6º Manga Esq (ampliado)
      { rankIdx: 9, x: 50.6, y: 79.5, w: 9.8,  h: 5.2, rot: 0 },    // 10º Calção Centro
      { rankIdx: 7, x: 43.3, y: 85.0, w: 9.8,  h: 5.2, rot: 5 },    // 8º Calção Dir Sup
      { rankIdx: 4, x: 42.2, y: 90.8, w: 9.8,  h: 5.2, rot: 5 },    // 5º Calção Dir Inf
      { rankIdx: 8, x: 59.2, y: 85.5, w: 10.6, h: 5.4, rot: -11 },  // 9º Calção Esq Sup
      { rankIdx: 3, x: 60.5, y: 91.2, w: 10.6, h: 5.4, rot: -11 }   // 4º Calção Esq Inf
    ]
  },
  {
    id: "cena-costas",
    nome: "Costas",
    baseArquivo: "img/2",
    slots: [
      { rankIdx: 0, x: 57.6, y: 31.8, w: 16.5, h: 8.2, rot: 2 },    // 1º Costas Superior
      { rankIdx: 5, x: 43.5, y: 38.0, w: 10.8, h: 6.6, rot: 12 },   // 6º Manga Costas (ampliado)
      { rankIdx: 1, x: 55.7, y: 59.5, w: 17.5, h: 7.6, rot: 1 },    // 2º Costas Meio
      { rankIdx: 2, x: 56.5, y: 67.8, w: 18.8, h: 7.6, rot: -1 },   // 3º Costas Inferior
      { rankIdx: 7, x: 46.5, y: 84.5, w: 11.0, h: 5.5, rot: 2 },    // 8º Calção Costas Esq Sup
      { rankIdx: 6, x: 44.8, y: 90.6, w: 11.0, h: 5.5, rot: 2 },    // 7º Calção Costas Esq Inf
      { rankIdx: 8, x: 61.2, y: 84.2, w: 11.2, h: 5.5, rot: -4 },   // 9º Calção Costas Dir Sup
      { rankIdx: 5, x: 61.5, y: 90.3, w: 11.2, h: 5.5, rot: -4 }    // 6º Calção Costas Dir Inf
    ]
  },
  {
    id: "cena-coletiva",
    nome: "Coletiva",
    baseArquivo: "img/3",
    slots: [
      { rankIdx: 4, x: 38.8, y: 44.0, w: 10.5, h: 5.5, rot: -18 },  // 5º Ombro Esq
      { rankIdx: 3, x: 61.8, y: 44.0, w: 10.5, h: 5.5, rot: 16 },   // 4º Ombro Dir
      { rankIdx: 6, x: 30.7, y: 53.2, w: 11.2, h: 6.8, rot: -64 },  // 7º Manga Esq (ampliado)
      { rankIdx: 5, x: 70.0, y: 53.2, w: 11.2, h: 6.8, rot: 66 },   // 6º Manga Dir (ampliado)
      { rankIdx: 0, x: 50.3, y: 62.0, w: 22.0, h: 8.5, rot: 0 },    // 1º Barriga Master
      { rankIdx: 1, x: 50.3, y: 71.5, w: 19.5, h: 8.0, rot: 0 },    // 2º Barriga Meio
      { rankIdx: 2, x: 50.3, y: 80.8, w: 17.5, h: 7.5, rot: 0 }     // 3º Barriga Inferior
    ]
  }
];

const preloaderEl = document.getElementById("preloader");
const preloaderBarra = document.getElementById("preloader-barra");
const preloaderTexto = document.getElementById("preloader-texto");
const preloaderPct = document.getElementById("preloader-pct");

const palcoVisual = document.getElementById("palco-visual");
const palcoCamera = document.getElementById("palco-camera");
const cenasContainer = document.getElementById("cenas-container");

const contadorVagas = document.getElementById("contador-vagas");
const gridTier1 = document.getElementById("grid-tier-1");
const gridTier2 = document.getElementById("grid-tier-2");
const gridTier3 = document.getElementById("grid-tier-3");
const btnAbrirFila = document.getElementById("btn-abrir-fila");
const qtdFilaEl = document.getElementById("qtd-fila");
const toastEl = document.getElementById("toast");

const modalPatrocinar = document.getElementById("modal-patrocinar");
const modalFicha = document.getElementById("modal-ficha");
const modalFila = document.getElementById("modal-fila");
const modalTabs = document.getElementById("modal-tabs");
const etapaPix = document.getElementById("etapa-pix");

let patrocinadores = [];
let cenaAtual = 0;
let timerCarrossel = null;
let logoHorizontalBase64 = null;
let transacaoPendente = null;
let timerLiberarPago = null;

function atualizarProgresso(pct, msg) {
  if (preloaderBarra) preloaderBarra.style.width = `${pct}%`;
  if (preloaderPct) preloaderPct.textContent = `${pct}%`;
  if (msg && preloaderTexto) preloaderTexto.textContent = msg;
}

function carregarImagemComFallback(basePath) {
  const exts = [".jpg", ".jpeg", ".png", ".webp", ""];
  return new Promise((resolve) => {
    let i = 0;
    const img = new Image();
    const tentar = () => {
      if (i >= exts.length) {
        resolve({ src: `${basePath}.jpg`, img: null });
        return;
      }
      const candidato = `${basePath}${exts[i++]}`;
      img.onload = () => resolve({ src: candidato, img });
      img.onerror = tentar;
      img.src = candidato;
    };
    tentar();
  });
}

function construirCenasDOM(resultadosImagens) {
  cenasContainer.innerHTML = "";
  CENAS_CONFIG.forEach((cena, idx) => {
    const slide = document.createElement("div");
    slide.className = `cena-slide${idx === 0 ? " ativa" : ""}`;
    slide.id = cena.id;

    const imgEl = document.createElement("img");
    imgEl.className = "foto-cena";
    imgEl.src = resultadosImagens[idx].src;
    imgEl.alt = `Uniforme Santa Cruz — ${cena.nome}`;

    const camada = document.createElement("div");
    camada.className = "camada-estampas";
    camada.dataset.cenaIdx = idx;

    cena.slots.forEach((slot) => {
      const divSlot = document.createElement("div");
      divSlot.className = "estampa-slot vaga-aberta";
      divSlot.dataset.rankIdx = slot.rankIdx;
      divSlot.style.left = `${slot.x}%`;
      divSlot.style.top = `${slot.y}%`;
      divSlot.style.width = `${slot.w}%`;
      divSlot.style.height = `${slot.h}%`;
      divSlot.style.setProperty("--rot", `${slot.rot}deg`);
      divSlot.innerHTML = `<span>SUA MARCA AQUI</span>`;
      camada.appendChild(divSlot);
    });

    slide.appendChild(imgEl);
    slide.appendChild(camada);
    cenasContainer.appendChild(slide);
  });
}

function irParaCena(idx) {
  cenaAtual = (idx + CENAS_CONFIG.length) % CENAS_CONFIG.length;
  document.querySelectorAll(".cena-slide").forEach((el, i) => el.classList.toggle("ativa", i === cenaAtual));
}

function iniciarCarrosselAutomatico() {
  clearInterval(timerCarrossel);
  timerCarrossel = setInterval(() => {
    if (modalPatrocinar.hidden && modalFicha.hidden && modalFila.hidden) {
      irParaCena(cenaAtual + 1);
    }
  }, 6500);
}

document.getElementById("btn-cena-ant").addEventListener("click", () => {
  irParaCena(cenaAtual - 1);
  iniciarCarrosselAutomatico();
});

document.getElementById("btn-cena-prox").addEventListener("click", () => {
  irParaCena(cenaAtual + 1);
  iniciarCarrosselAutomatico();
});

let timerIdleCam;
palcoVisual.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const rect = palcoVisual.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width) - 0.5;
  const ny = ((e.clientY - rect.top) / rect.height) - 0.5;

  palcoCamera.classList.remove("modo-idle");
  palcoCamera.style.setProperty("--cam-x", `${(-nx * 8).toFixed(1)}px`);
  palcoCamera.style.setProperty("--cam-y", `${(-ny * 6).toFixed(1)}px`);

  clearTimeout(timerIdleCam);
  timerIdleCam = setTimeout(() => {
    palcoCamera.style.setProperty("--cam-x", "0px");
    palcoCamera.style.setProperty("--cam-y", "0px");
    palcoCamera.classList.add("modo-idle");
  }, 1600);
});

function obterDescricaoCota(pos) {
  if (pos === 1) return "1º Lugar · Barriga Master + Costas Sup. + Coletiva";
  if (pos <= 3) return `${pos}º Lugar · Barriga + Costas + Coletiva`;
  if (pos <= 5) return `${pos}º Lugar · Ombros da Camisa + Calção Frente`;
  if (pos <= 7) return `${pos}º Lugar · Mangas da Camisa + Calção Costas`;
  if (pos <= 10) return `${pos}º Lugar · Calção Oficial de Jogo`;
  return `${pos}º Lugar · Zona de Disputa (Fora do Top 10)`;
}

function renderizarVitrine() {
  patrocinadores.sort((a, b) => Number(b.valor) - Number(a.valor));
  const noManto = Math.min(patrocinadores.length, 10);
  contadorVagas.textContent = `${noManto}/10 no manto`;

  document.querySelectorAll(".estampa-slot").forEach((slotEl) => {
    const rIdx = Number(slotEl.dataset.rankIdx);
    const pat = patrocinadores[rIdx];
    if (pat && pat.logo) {
      slotEl.classList.remove("vaga-aberta");
      slotEl.innerHTML = `<img src="${pat.logo}" alt="${pat.nome}">`;
    } else {
      slotEl.classList.add("vaga-aberta");
      slotEl.innerHTML = `<span>SUA MARCA AQUI</span>`;
    }
  });

  renderizarLinhaRodape(gridTier1, 0, 3);
  renderizarLinhaRodape(gridTier2, 3, 3);
  renderizarLinhaRodape(gridTier3, 6, 4);

  const excedentes = patrocinadores.slice(10);
  if (excedentes.length > 0) {
    btnAbrirFila.hidden = false;
    qtdFilaEl.textContent = excedentes.length;
  } else {
    btnAbrirFila.hidden = true;
  }

  atualizarSelectImpulsao();
}

function renderizarLinhaRodape(container, inicioIdx, quantidade) {
  container.innerHTML = "";
  for (let i = 0; i < quantidade; i++) {
    const rankIdx = inicioIdx + i;
    const pos = rankIdx + 1;
    const pat = patrocinadores[rankIdx];

    if (pat) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `slot-rodape pos-${pos}`;
      btn.title = `${pos}º ${pat.nome} — Clique para ver ou impulsionar`;
      btn.innerHTML = `<span class="badge-pos-mini">${pos}º</span><img src="${pat.logo}" alt="${pat.nome}">`;
      btn.addEventListener("click", () => abrirFichaPatrocinador(pat, pos));
      container.appendChild(btn);
    } else {
      const vazio = document.createElement("button");
      vazio.type = "button";
      vazio.className = "slot-rodape vazio";
      vazio.title = `${pos}ª vaga disponível — Clique para patrocinar`;
      vazio.textContent = "Sua marca aqui";
      vazio.addEventListener("click", () => abrirModalPatrocinar("nova"));
      container.appendChild(vazio);
    }
  }
}

function formatarLinkSocial(raw) {
  const txt = String(raw || "").trim();
  if (!txt) return null;
  if (txt.startsWith("http://") || txt.startsWith("https://")) return { url: txt, label: txt.replace(/^https?:\/\/(www\.)?/, "") };
  if (txt.startsWith("@")) return { url: `https://instagram.com/${txt.slice(1)}`, label: txt };
  if (txt.includes(".") && !txt.includes(" ")) return { url: `https://${txt}`, label: txt };
  return { url: `https://instagram.com/${txt.replace(/^@/, "")}`, label: `@${txt.replace(/^@/, "")}` };
}

function abrirFichaPatrocinador(pat, pos) {
  const linkInfo = formatarLinkSocial(pat.social);
  const cotaDesc = obterDescricaoCota(pos);
  const valorFmt = Number(pat.valor).toFixed(2).replace(".", ",");
  const lances = pat.aportes || 1;

  const conteudo = document.getElementById("conteudo-ficha");
  conteudo.innerHTML = `
    <div class="ficha-box-detalhe">
      <div class="modal-marca-info">
        <img src="${pat.logo}" alt="${pat.nome}">
        <div>
          <strong style="display:block; font-size:1rem;">${pat.nome}</strong>
          <span style="font-size:.76rem; color:var(--texto-2);">${cotaDesc}</span>
          ${linkInfo ? `<a href="${linkInfo.url}" target="_blank" rel="noopener" class="ficha-link-social">Visitar ${linkInfo.label} ↗</a>` : ""}
        </div>
      </div>
      <div class="modal-previsao">
        Acumulado na campanha: <b>R$ ${valorFmt}</b> (${lances} ${lances === 1 ? "apoio" : "apoios"})
      </div>
      <button type="button" class="btn-enviar" id="btn-ficha-impulsionar">
        + Impulsionar ${pat.nome} (a partir de R$ 1)
      </button>
    </div>
  `;

  document.getElementById("btn-ficha-impulsionar").addEventListener("click", () => {
    modalFicha.hidden = true;
    abrirModalPatrocinar("impulsionar", pat.id);
  });
  modalFicha.hidden = false;
}

btnAbrirFila.addEventListener("click", () => {
  const listaFila = document.getElementById("lista-fila");
  listaFila.innerHTML = "";
  patrocinadores.slice(10).forEach((pat, i) => {
    const pos = 11 + i;
    const item = document.createElement("div");
    item.className = "fila-item";
    item.innerHTML = `
      <strong style="font-size:.76rem; color:var(--texto-2);">${pos}º</strong>
      <img src="${pat.logo}" alt="${pat.nome}">
      <div style="min-width:0;">
        <strong style="display:block; font-size:.8rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${pat.nome}</strong>
        <span style="font-size:.7rem; color:var(--texto-2);">R$ ${Number(pat.valor).toFixed(2).replace(".", ",")}</span>
      </div>
      <button type="button" class="btn-impulso-fila">+ Subir</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      modalFila.hidden = true;
      abrirModalPatrocinar("impulsionar", pat.id);
    });
    listaFila.appendChild(item);
  });
  modalFila.hidden = false;
});

function abrirModalPatrocinar(abaInicial = "nova", marcaIdPreselecionada = null) {
  etapaPix.hidden = true;
  modalTabs.hidden = false;
  alternarAbaModal(abaInicial);
  if (marcaIdPreselecionada) {
    const sel = document.getElementById("select-marca-impulso");
    sel.value = marcaIdPreselecionada;
    atualizarDetalhesImpulso();
  }
  atualizarPrevisaoNovaMarca();
  modalPatrocinar.hidden = false;
}

function alternarAbaModal(nomeAba) {
  etapaPix.hidden = true;
  modalTabs.hidden = false;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("ativo", b.dataset.tab === nomeAba));
  document.getElementById("tab-nova").hidden = nomeAba !== "nova";
  document.getElementById("tab-impulsionar").hidden = nomeAba !== "impulsionar";
  document.getElementById("tab-termos").hidden = nomeAba !== "termos";
}

document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => alternarAbaModal(btn.dataset.tab)));
document.getElementById("btn-abrir-patrocinar").addEventListener("click", () => abrirModalPatrocinar("nova"));
document.getElementById("btn-abrir-regras").addEventListener("click", () => abrirModalPatrocinar("termos"));
document.querySelectorAll("[data-fechar]").forEach((btn) => btn.addEventListener("click", () => { document.getElementById(btn.dataset.fechar).hidden = true; }));
[modalPatrocinar, modalFicha, modalFila].forEach((veu) => veu.addEventListener("click", (e) => { if (e.target === veu) veu.hidden = true; }));

const inputNovoValor = document.getElementById("novo-valor");
function atualizarPrevisaoNovaMarca() {
  const val = Math.max(0, Number(inputNovoValor.value) || 0);
  const simulacao = [...patrocinadores.map((p) => Number(p.valor)), val].sort((a, b) => b - a);
  const posPrevista = simulacao.indexOf(val) + 1;
  document.getElementById("previsao-nova-marca").innerHTML = `
    Com <b>R$ ${val.toFixed(2).replace(".", ",")}</b> você assume o <b>${posPrevista}º lugar</b> (${obterDescricaoCota(posPrevista).split("·")[1].trim()}).
  `;
}
inputNovoValor.addEventListener("input", atualizarPrevisaoNovaMarca);

function atualizarSelectImpulsao() {
  const sel = document.getElementById("select-marca-impulso");
  const valorAtual = sel.value;
  sel.innerHTML = "";
  if (patrocinadores.length === 0) {
    sel.innerHTML = `<option value="">Nenhuma marca cadastrada ainda</option>`;
    document.getElementById("card-marca-selecionada").hidden = true;
    return;
  }
  patrocinadores.forEach((p, idx) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${idx + 1}º · ${p.nome} (R$ ${Number(p.valor).toFixed(2).replace(".", ",")})`;
    sel.appendChild(opt);
  });
  if (valorAtual && patrocinadores.some((p) => String(p.id) === String(valorAtual))) sel.value = valorAtual;
  atualizarDetalhesImpulso();
}

function atualizarDetalhesImpulso() {
  const sel = document.getElementById("select-marca-impulso");
  const pat = patrocinadores.find((p) => String(p.id) === String(sel.value));
  const card = document.getElementById("card-marca-selecionada");
  const atalhos = document.getElementById("atalhos-valor");
  const inputImp = document.getElementById("impulso-valor");

  if (!pat) { card.hidden = true; return; }

  const maiorValor = Number(patrocinadores[0].valor);
  const diffLider = Math.max(0, maiorValor - Number(pat.valor));
  const paraPassar = Number((diffLider + 1).toFixed(2));

  card.hidden = false;
  card.innerHTML = `
    <img src="${pat.logo}" alt="${pat.nome}">
    <div>
      <strong style="display:block; font-size:.9rem;">${pat.nome}</strong>
      <span style="font-size:.75rem; color:var(--texto-2);">Acumulado atual: <b style="color:#fff;">R$ ${Number(pat.valor).toFixed(2).replace(".", ",")}</b></span>
    </div>
  `;

  atalhos.innerHTML = `
    <button type="button" class="chip-atalho" data-v="1">+ R$ 1</button>
    <button type="button" class="chip-atalho" data-v="5">+ R$ 5</button>
    <button type="button" class="chip-atalho" data-v="10">+ R$ 10</button>
    <button type="button" class="chip-atalho" data-v="20">+ R$ 20</button>
    ${diffLider > 0 ? `<button type="button" class="chip-atalho destaque" data-v="${paraPassar}">Virar 1º (+R$ ${paraPassar.toFixed(0)})</button>` : ""}
  `;
  atalhos.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => { inputImp.value = Number(b.dataset.v); atualizarPrevisaoImpulso(); });
  });
  atualizarPrevisaoImpulso();
}

function atualizarPrevisaoImpulso() {
  const sel = document.getElementById("select-marca-impulso");
  const pat = patrocinadores.find((p) => String(p.id) === String(sel.value));
  if (!pat) return;
  const soma = Math.max(0, Number(document.getElementById("impulso-valor").value) || 0);
  const novoTotal = Number((Number(pat.valor) + soma).toFixed(2));
  const sim = patrocinadores.map((p) => (p.id === pat.id ? novoTotal : Number(p.valor))).sort((a, b) => b - a);
  const novaPos = sim.indexOf(novoTotal) + 1;
  document.getElementById("previsao-impulso").innerHTML = `Novo acumulado: <b>R$ ${novoTotal.toFixed(2).replace(".", ",")}</b> · Assume o <b>${novaPos}º lugar</b>`;
}

document.getElementById("select-marca-impulso").addEventListener("change", atualizarDetalhesImpulso);
document.getElementById("impulso-valor").addEventListener("input", atualizarPrevisaoImpulso);

function processarLogoParaPES(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const temp = document.createElement("canvas");
        temp.width = img.width;
        temp.height = img.height;
        const tCtx = temp.getContext("2d");
        tCtx.drawImage(img, 0, 0);

        const frame = tCtx.getImageData(0, 0, img.width, img.height);
        const data = frame.data;
        let minX = img.width, minY = img.height, maxX = 0, maxY = 0, achou = false;

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const idx = (y * img.width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
            if (a > 20 && r > 242 && g > 242 && b > 242) {
              data[idx + 3] = 0;
            } else if (data[idx + 3] > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              achou = true;
            }
          }
        }
        tCtx.putImageData(frame, 0, 0);

        const cX = achou ? minX : 0, cY = achou ? minY : 0;
        const cW = achou ? (maxX - minX + 1) : img.width, cH = achou ? (maxY - minY + 1) : img.height;
        const outW = 1200, outH = 400;
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const pad = 16;
        const escala = Math.min((outW - pad * 2) / cW, (outH - pad * 2) / cH);
        const dW = cW * escala, dH = cH * escala;
        ctx.drawImage(temp, cX, cY, cW, cH, (outW - dW) / 2, (outH - dH) / 2, dW, dH);
        resolve(canvas.toDataURL("image/png", 1.0));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("input-logo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("nome-arquivo").textContent = file.name;
  try {
    logoHorizontalBase64 = await processarLogoParaPES(file);
    document.getElementById("preview-logo").innerHTML = `<img src="${logoHorizontalBase64}" alt="Prévia">`;
  } catch {
    mostrarToast("Não foi possível ler essa imagem. Tente PNG ou JPG.");
  }
});

async function iniciarCheckoutPix(dadosTransacao, botaoOrigem) {
  const txtOriginal = botaoOrigem.textContent;
  botaoOrigem.disabled = true;
  botaoOrigem.textContent = "Gerando PIX...";
  try {
    const resp = await fetch(`${URL_SHEETS}?acao=gerar_pix&valor=${encodeURIComponent(dadosTransacao.valor)}`);
    const res = await resp.json();
    if (!res.ok || !res.payload) { mostrarToast(res.erro || "Erro ao gerar código PIX."); return; }

    transacaoPendente = dadosTransacao;
    document.getElementById("tab-nova").hidden = true;
    document.getElementById("tab-impulsionar").hidden = true;
    document.getElementById("tab-termos").hidden = true;
    modalTabs.hidden = true;
    etapaPix.hidden = false;

    const valorFmt = Number(dadosTransacao.valor).toFixed(2).replace(".", ",");
    document.getElementById("pix-instrucao-texto").innerHTML = `PIX de <b>R$ ${valorFmt}</b> para <b>SHITBOT LTDA</b><br>Patrocínio: <b>${dadosTransacao.empresa}</b>`;
    document.getElementById("pix-copia-cola").value = res.payload;
    document.getElementById("pix-qr-img").src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(res.payload)}`;

    const btnPago = document.getElementById("btn-confirmar-pago");
    btnPago.hidden = true;
    clearTimeout(timerLiberarPago);
    timerLiberarPago = setTimeout(() => {
      btnPago.hidden = false;
    }, 3000);
  } catch {
    mostrarToast("Falha de conexão ao gerar o PIX. Tente novamente.");
  } finally {
    botaoOrigem.disabled = false;
    botaoOrigem.textContent = txtOriginal;
  }
}

document.getElementById("form-novo-patrocinio").addEventListener("submit", (e) => {
  e.preventDefault();
  const empresa = document.getElementById("novo-empresa").value.trim();
  const social = document.getElementById("novo-social").value.trim();
  const doador = document.getElementById("novo-doador").value.trim();
  const valor = Number(document.getElementById("novo-valor").value);
  if (!empresa || !doador || !logoHorizontalBase64 || valor < 20) {
    mostrarToast("Preencha todos os campos obrigatórios e anexe a logo.");
    return;
  }
  iniciarCheckoutPix({ empresa, social, doador, tipo: "NOVO PATROCÍNIO", valor, logo: logoHorizontalBase64 }, document.getElementById("btn-gerar-pix-novo"));
});

document.getElementById("form-impulsionar").addEventListener("submit", (e) => {
  e.preventDefault();
  const sel = document.getElementById("select-marca-impulso");
  const pat = patrocinadores.find((p) => String(p.id) === String(sel.value));
  const doador = document.getElementById("impulso-doador").value.trim();
  const valor = Number(document.getElementById("impulso-valor").value);
  if (!pat || !doador || valor < 1) {
    mostrarToast("Selecione uma marca, informe seu nome e valor mínimo de R$ 1.");
    return;
  }
  iniciarCheckoutPix({ empresa: pat.nome, social: pat.social || "", doador, tipo: "IMPULSÃO", valor, logo: pat.logo || "" }, document.getElementById("btn-gerar-pix-impulso"));
});

document.getElementById("btn-copiar-pix").addEventListener("click", async () => {
  const campo = document.getElementById("pix-copia-cola");
  try { await navigator.clipboard.writeText(campo.value); } catch { campo.select(); document.execCommand("copy"); }
  mostrarToast("Código PIX copiado!");
  const btnPago = document.getElementById("btn-confirmar-pago");
  if (btnPago.hidden) {
    clearTimeout(timerLiberarPago);
    timerLiberarPago = setTimeout(() => { btnPago.hidden = false; }, 3000);
  }
});

document.getElementById("btn-voltar-pix").addEventListener("click", () => alternarAbaModal("nova"));

document.getElementById("btn-confirmar-pago").addEventListener("click", async () => {
  if (!transacaoPendente) return;
  const dadosEnvio = { ...transacaoPendente };
  transacaoPendente = null;

  // Fecha o popup imediatamente e restaura as abas para a próxima abertura
  modalPatrocinar.hidden = true;
  etapaPix.hidden = true;
  modalTabs.hidden = false;

  const chaveNorm = dadosEnvio.empresa.toLowerCase().trim();
  const existente = patrocinadores.find((p) => p.nome.toLowerCase().trim() === chaveNorm);
  if (existente) {
    existente.valor = Number((Number(existente.valor) + dadosEnvio.valor).toFixed(2));
    existente.aportes = (existente.aportes || 1) + 1;
    if (dadosEnvio.logo) existente.logo = dadosEnvio.logo;
  } else {
    patrocinadores.push({
      id: chaveNorm,
      nome: dadosEnvio.empresa,
      social: dadosEnvio.social,
      valor: dadosEnvio.valor,
      aportes: 1,
      logo: dadosEnvio.logo
    });
  }

  renderizarVitrine();
  mostrarToast(`${dadosEnvio.empresa} estampado com sucesso!`);

  try {
    if (dadosEnvio.logo && dadosEnvio.logo.startsWith("data:image")) {
      await fetch(URL_SHEETS, { method: "POST", mode: "no-cors", body: JSON.stringify(dadosEnvio) });
    } else {
      const qs = new URLSearchParams({
        acao: "registrar",
        empresa: dadosEnvio.empresa,
        social: dadosEnvio.social || "",
        doador: dadosEnvio.doador,
        tipo: dadosEnvio.tipo,
        valor: String(dadosEnvio.valor)
      });
      await fetch(`${URL_SHEETS}?${qs.toString()}`);
    }
    setTimeout(buscarDadosPlanilha, 2500);
  } catch {
    mostrarToast("Sincronizando com a planilha...");
  }
});

async function buscarDadosPlanilha() {
  try {
    const resp = await fetch(`${URL_SHEETS}?t=${Date.now()}`);
    const lista = await resp.json();
    if (Array.isArray(lista)) {
      patrocinadores = lista;
      try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores)); } catch {}
      renderizarVitrine();
    }
  } catch {
    try { const cache = localStorage.getItem(CHAVE_STORAGE); if (cache) patrocinadores = JSON.parse(cache); } catch {}
    renderizarVitrine();
  }
}

function mostrarToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove("on"), 3400);
}

async function iniciarAplicacao() {
  atualizarProgresso(15, "Carregando ângulos do uniforme...");
  const timeoutSeguranca = setTimeout(() => preloaderEl.classList.add("oculto"), 4000);
  const imagensCarregadas = await Promise.all(CENAS_CONFIG.map((c) => carregarImagemComFallback(c.baseArquivo)));
  construirCenasDOM(imagensCarregadas);
  atualizarProgresso(55, "Sincronizando patrocinadores...");
  await buscarDadosPlanilha();
  atualizarProgresso(85, "Estampando marcas no manto...");
  const logosTop10 = patrocinadores.slice(0, 10).map((p) => p.logo).filter(Boolean);
  await Promise.all(logosTop10.map((src) => new Promise((res) => { const im = new Image(); im.onload = res; im.onerror = res; im.src = src; })));
  atualizarProgresso(100, "Pronto!");
  clearTimeout(timeoutSeguranca);
  setTimeout(() => { preloaderEl.classList.add("oculto"); iniciarCarrosselAutomatico(); }, 260);
}

iniciarAplicacao();
setInterval(buscarDadosPlanilha, 20000);