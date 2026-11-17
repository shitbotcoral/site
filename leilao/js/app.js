/* ==========================================================================
   CONFIGURAÇÃO DO BACKEND COMPARTILHADO (GOOGLE SHEETS / APPS SCRIPT)
   ========================================================================== */
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxDD4sEQooBZzYA0-0mHm3AkFxOtPtLLWpMfHS-Rl0zB1Xt5q6N_tZFMvQ62mqrbLkuAg/exec";
const CHAVE_STORAGE = "shitbot_patrocinadores_v3";
const TETO_MAXIMO = 2000;

const POSICOES_CAMISA = [
  { id: "pos-1", x: 50.0, y: 66.5, w: 24.5, h: 11.0, rot: 0 },
  { id: "pos-2", x: 50.0, y: 79.0, w: 23.5, h: 10.5, rot: 0 },
  { id: "pos-3", x: 50.0, y: 91.0, w: 22.0, h: 9.5,  rot: 0 },
  { id: "pos-4", x: 41.3, y: 44.0, w: 8.5,  h: 4.0,  rot: -15 },
  { id: "pos-5", x: 58.6, y: 44.0, w: 8.5,  h: 4.0,  rot: 15 },
  { id: "pos-6", x: 35.4, y: 54.6, w: 8.5,  h: 4.0,  rot: -66 },
  { id: "pos-7", x: 64.5, y: 54.6, w: 8.5,  h: 4.0,  rot: 66 }
];

const camadaCamisa = document.getElementById("camada-camisa");
const palcoFoto = document.getElementById("palco-foto");
const fotoJogador = document.getElementById("foto-jogador");
const inputLogo = document.getElementById("input-logo");
const previewLogo = document.getElementById("preview-logo");
const nomeArquivo = document.getElementById("nome-arquivo");
const inputEmpresa = document.getElementById("nome-empresa");
const inputDoadorNovo = document.getElementById("nome-doador-novo");
const inputValor = document.getElementById("valor-lance");
const areaRanking = document.getElementById("area-ranking");
const contadorEl = document.getElementById("contador-patrocinadores");
const toastEl = document.getElementById("toast");

/* Elementos do Modal */
const modalVeu = document.getElementById("modal-veu");
const modalTitulo = document.getElementById("modal-titulo");
const modalFechar = document.getElementById("modal-fechar");
const modalMarcaInfo = document.getElementById("modal-marca-info");
const formImpulsionar = document.getElementById("form-impulsionar");
const inputDoadorImpulso = document.getElementById("nome-doador-impulso");
const atalhosValor = document.getElementById("atalhos-valor");
const inputAporte = document.getElementById("valor-aporte");
const modalPrevisao = document.getElementById("modal-previsao");

/* Etapa PIX no Modal */
const etapaPix = document.getElementById("etapa-pix");
const pixQrImg = document.getElementById("pix-qr-img");
const pixValorLabel = document.getElementById("pix-valor-label");
const pixCopiaCola = document.getElementById("pix-copia-cola");
const btnCopiarPix = document.getElementById("btn-copiar-pix");
const btnJaPaguei = document.getElementById("btn-ja-paguei");

let patrocinadores = [];
let logoHorizontalBase64 = null;
let patrocinadorSelecionadoModal = null;
let transacaoPendenteAtual = null;
let timerBotaoPaguei = null;
let enviandoDados = false;

const formatosFoto = ["apresentacao.jpg", "apresentacao.png", "apresentacao.jpeg", "apresentacao.webp", "apresentacao"];
let idxFoto = 0;
fotoJogador.addEventListener("error", () => {
  idxFoto++;
  if (idxFoto < formatosFoto.length) fotoJogador.src = formatosFoto[idxFoto];
});

function sincronizarEnquadramentoCamisa() {
  if (!fotoJogador.naturalWidth || !fotoJogador.naturalHeight) return;
  const boxW = palcoFoto.clientWidth;
  const boxH = palcoFoto.clientHeight;
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
    const alignX = window.innerWidth >= 1024 ? 0.36 : 0.5;
    offsetX = (boxW - renderW) * alignX;
    offsetY = 0;
  }

  camadaCamisa.style.width = renderW + "px";
  camadaCamisa.style.height = renderH + "px";
  camadaCamisa.style.left = offsetX + "px";
  camadaCamisa.style.top = offsetY + "px";
}

fotoJogador.addEventListener("load", sincronizarEnquadramentoCamisa);
window.addEventListener("resize", sincronizarEnquadramentoCamisa);

function mostrarToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove("on"), 3600);
}

function obterInfoPosicao(pos) {
  if (pos === 1) return { classeTier: "tier-t1", descricao: "Barriga Master + Costas Sup. + Chamadas VIP na transmissão" };
  if (pos === 2 || pos === 3) return { classeTier: "tier-t2", descricao: "Barriga Abaixo + Costas Inf. + Chamadas na transmissão" };
  if (pos === 4 || pos === 5) return { classeTier: "tier-t3", descricao: "Ombros + Calção + Inserções leves na transmissão" };
  if (pos === 6 || pos === 7) return { classeTier: "tier-t4", descricao: "Mangas + Calção + Inserção conjunta na transmissão" };
  if (pos >= 8 && pos <= 10) return { classeTier: "tier-t5", descricao: "Calção + Inserção conjunta na transmissão" };
  return { classeTier: "tier-out fora-top10", descricao: "Fora do uniforme (Impulsione para voltar ao Top 10)" };
}

function converterParaHorizontal(file) {
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

        const larguraAlvo = 240, alturaAlvo = 80;
        const canvas = document.createElement("canvas");
        canvas.width = larguraAlvo;
        canvas.height = alturaAlvo;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, larguraAlvo, alturaAlvo);

        const margem = 3;
        const escala = Math.min((larguraAlvo - margem * 2) / cropW, (alturaAlvo - margem * 2) / cropH);
        const drawW = cropW * escala, drawH = cropH * escala;
        ctx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, (larguraAlvo - drawW) / 2, (alturaAlvo - drawH) / 2, drawW, drawH);
        resolve(canvas.toDataURL("image/webp", 0.78));
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
    logoHorizontalBase64 = await converterParaHorizontal(file);
    previewLogo.innerHTML = `<img src="${logoHorizontalBase64}" alt="Prévia horizontal">`;
  } catch {
    mostrarToast("Não foi possível ler essa imagem. Tente PNG ou JPG.");
  }
});

function montarCamadasCamisa() {
  POSICOES_CAMISA.forEach((pos) => {
    const div = document.createElement("div");
    div.className = "estampa-auto";
    div.id = pos.id;
    div.style.left = pos.x + "%";
    div.style.top = pos.y + "%";
    div.style.width = pos.w + "%";
    div.style.height = pos.h + "%";
    div.style.setProperty("--rot", pos.rot + "deg");
    camadaCamisa.appendChild(div);
  });
}

function renderizarTudo() {
  patrocinadores.sort((a, b) => Number(b.valor) - Number(a.valor));
  const ativosTop10 = Math.min(patrocinadores.length, 10);
  contadorEl.textContent = `${ativosTop10}/10 no manto`;

  POSICOES_CAMISA.forEach((pos, idx) => {
    const el = document.getElementById(pos.id);
    const pat = patrocinadores[idx];
    el.innerHTML = pat ? `<img src="${pat.logo}" alt="${pat.nome}">` : "";
  });

  if (patrocinadores.length === 0) {
    areaRanking.innerHTML = `<div class="lista-vazia">Nenhum patrocinador cadastrado ainda.<br>Crie o primeiro abaixo a partir de R$ 20,00!</div>`;
    return;
  }

  areaRanking.innerHTML = "";
  const maiorValor = Number(patrocinadores[0].valor);

  patrocinadores.forEach((pat, idx) => {
    const pos = idx + 1;
    const info = obterInfoPosicao(pos);
    const qtdAportes = pat.aportes || 1;
    const diferencaParaLider = Number((maiorValor - Number(pat.valor)).toFixed(2));
    const valorParaPassar = Math.min(TETO_MAXIMO, Number((diferencaParaLider + 1).toFixed(2)));

    const item = document.createElement("div");
    item.className = `rank-item ${info.classeTier}`;
    item.innerHTML = `
      <div class="rank-pos">${pos}º</div>
      <div class="rank-logo"><img src="${pat.logo}" alt="${pat.nome}"></div>
      <div class="rank-corpo">
        <div class="rank-linha-topo">
          <strong>${pat.nome}</strong>
          <span class="rank-valor-total">R$ ${Number(pat.valor).toFixed(2).replace(".", ",")}</span>
        </div>
        <span class="rank-cota-desc">${info.descricao}</span>
        <div class="rank-rodape-acoes">
          <span class="rank-lances-qtd">${qtdAportes} ${qtdAportes === 1 ? "aporte" : "aportes"}</span>
          <div class="rank-botoes">
            <button type="button" class="btn-acao-rank" data-acao="impulsionar">+ Impulsionar</button>
            ${pos > 1 && diferencaParaLider < TETO_MAXIMO ? `<button type="button" class="btn-acao-rank cobrir">Passar 1º (+R$ ${valorParaPassar.toFixed(0)})</button>` : ""}
          </div>
        </div>
      </div>
    `;

    item.querySelector('[data-acao="impulsionar"]').addEventListener("click", () => abrirModalImpulso(pat, 1));
    const btnCobrir = item.querySelector(".cobrir");
    if (btnCobrir) btnCobrir.addEventListener("click", () => abrirModalImpulso(pat, valorParaPassar));

    areaRanking.appendChild(item);
  });

  sincronizarEnquadramentoCamisa();
}

/* ==========================================================================
   FLUXO DE IMPULSÃO & PIX COPIA E COLA
   ========================================================================== */
function abrirModalImpulso(pat, valorSugerido = 1) {
  patrocinadorSelecionadoModal = pat;
  transacaoPendenteAtual = null;
  clearTimeout(timerBotaoPaguei);

  modalTitulo.textContent = "Impulsionar Marca";
  formImpulsionar.hidden = false;
  etapaPix.hidden = true;
  btnJaPaguei.hidden = true;

  const maiorValor = Number(patrocinadores[0].valor);
  const diffLider = Math.max(0, maiorValor - Number(pat.valor));
  const valorParaPassar = Math.min(TETO_MAXIMO, Number((diffLider + 1).toFixed(2)));

  modalMarcaInfo.innerHTML = `
    <img src="${pat.logo}" alt="${pat.nome}">
    <div>
      <strong style="display:block; font-size:.98rem;">${pat.nome}</strong>
      <span style="font-size:.8rem; color:var(--texto-2);">Acumulado atual: <b style="color:#fff;">R$ ${Number(pat.valor).toFixed(2).replace(".", ",")}</b></span>
    </div>
  `;

  atalhosValor.innerHTML = `
    <button type="button" class="chip-atalho" data-soma="1">+ R$ 1</button>
    <button type="button" class="chip-atalho" data-soma="5">+ R$ 5</button>
    <button type="button" class="chip-atalho" data-soma="10">+ R$ 10</button>
    <button type="button" class="chip-atalho" data-soma="20">+ R$ 20</button>
    ${diffLider > 0 && diffLider < TETO_MAXIMO ? `<button type="button" class="chip-atalho destaque" data-soma="${valorParaPassar}">Virar 1º (+R$ ${valorParaPassar.toFixed(2).replace(".", ",")})</button>` : ""}
  `;

  atalhosValor.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      inputAporte.value = Number(btn.dataset.soma);
      atualizarPrevisaoModal();
    });
  });

  inputAporte.value = valorSugerido;
  atualizarPrevisaoModal();
  modalVeu.hidden = false;
  inputDoadorImpulso.focus();
}

function atualizarPrevisaoModal() {
  if (!patrocinadorSelecionadoModal) return;
  const soma = Math.max(0, Number(inputAporte.value) || 0);
  const novoTotal = Number((Number(patrocinadorSelecionadoModal.valor) + soma).toFixed(2));
  const simulacao = patrocinadores
    .map(p => p.id === patrocinadorSelecionadoModal.id ? novoTotal : Number(p.valor))
    .sort((a, b) => b - a);
  const novaPos = simulacao.indexOf(novoTotal) + 1;
  modalPrevisao.innerHTML = `Novo acumulado: <b>R$ ${novoTotal.toFixed(2).replace(".", ",")}</b> · Assume o <b>${novaPos}º lugar</b>`;
}

inputAporte.addEventListener("input", atualizarPrevisaoModal);
modalFechar.addEventListener("click", () => {
  clearTimeout(timerBotaoPaguei);
  modalVeu.hidden = true;
});
modalVeu.addEventListener("click", (e) => {
  if (e.target === modalVeu) {
    clearTimeout(timerBotaoPaguei);
    modalVeu.hidden = true;
  }
});

/* Gera o PIX Copia e Cola e QR Code no Modal (Botão "Já paguei" oculto inicialmente) */
async function abrirTelaPagamentoPix({ empresa, doador, tipo, valor, logo }) {
  transacaoPendenteAtual = { empresa, doador, tipo, valor, logo };
  clearTimeout(timerBotaoPaguei);

  modalTitulo.textContent = "Pagamento PIX";
  formImpulsionar.hidden = true;
  etapaPix.hidden = false;
  btnJaPaguei.hidden = true;
  modalVeu.hidden = false;

  modalMarcaInfo.innerHTML = `
    ${logo ? `<img src="${logo}" alt="${empresa}">` : ""}
    <div>
      <strong style="display:block; font-size:.98rem;">${empresa}</strong>
      <span style="font-size:.8rem; color:var(--texto-2);">${doador} · R$ ${valor.toFixed(2).replace(".", ",")}</span>
    </div>
  `;

  pixValorLabel.textContent = `R$ ${valor.toFixed(2).replace(".", ",")}`;
  pixCopiaCola.value = "Gerando código PIX...";
  pixQrImg.src = "";

  try {
    const resp = await fetch(`${URL_SHEETS}?acao=gerar_pix&valor=${valor}`);
    const dados = await resp.json();
    if (dados.ok && dados.payload) {
      pixCopiaCola.value = dados.payload;
      pixQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dados.payload)}`;
    } else {
      pixCopiaCola.value = "Erro ao gerar código PIX.";
    }
  } catch {
    pixCopiaCola.value = "Erro de conexão ao gerar PIX.";
  }
}

/* Ao clicar em Copiar Código, libera o botão "Já paguei" após 3 segundos */
btnCopiarPix.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(pixCopiaCola.value);
  } catch {
    pixCopiaCola.select();
    document.execCommand("copy");
  }

  mostrarToast("Código PIX copiado! Abra o app do seu banco para pagar.");

  clearTimeout(timerBotaoPaguei);
  timerBotaoPaguei = setTimeout(() => {
    btnJaPaguei.hidden = false;
  }, 3000);
});

/* Quando clica em "Já paguei", envia para a planilha e atualiza o ranking */
btnJaPaguei.addEventListener("click", async () => {
  if (!transacaoPendenteAtual) return;

  btnJaPaguei.disabled = true;
  btnJaPaguei.textContent = "Confirmando...";
  enviandoDados = true;

  try {
    const params = new URLSearchParams({
      acao: "registrar",
      empresa: transacaoPendenteAtual.empresa,
      doador: transacaoPendenteAtual.doador,
      tipo: transacaoPendenteAtual.tipo,
      valor: String(transacaoPendenteAtual.valor),
      logo: transacaoPendenteAtual.logo || ""
    });

    const resp = await fetch(`${URL_SHEETS}?${params.toString()}`);
    const res = await resp.json();

    if (res.ok && Array.isArray(res.ranking)) {
      patrocinadores = res.ranking;
      try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores)); } catch {}
      renderizarTudo();
      mostrarToast(`${transacaoPendenteAtual.empresa} atualizado no ranking!`);
    } else {
      mostrarToast(res.erro || "Não foi possível confirmar agora.");
    }
  } catch {
    mostrarToast("Erro de rede ao confirmar.");
  }

  enviandoDados = false;
  btnJaPaguei.disabled = false;
  btnJaPaguei.textContent = "Já paguei";
  modalVeu.hidden = true;
  transacaoPendenteAtual = null;
});

/* Submit do Modal de Impulsão */
formImpulsionar.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!patrocinadorSelecionadoModal) return;

  const doador = inputDoadorImpulso.value.trim();
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

  await abrirTelaPagamentoPix({
    empresa: patrocinadorSelecionadoModal.nome,
    doador,
    tipo: "IMPULSÃO",
    valor: aporte,
    logo: patrocinadorSelecionadoModal.logo
  });
});

/* Submit do Formulário de Novo Patrocínio */
document.getElementById("form-patrocinio").addEventListener("submit", async (e) => {
  e.preventDefault();

  const empresa = inputEmpresa.value.trim();
  const doador = inputDoadorNovo.value.trim();
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
  inputDoadorNovo.value = "";
  inputLogo.value = "";
  logoHorizontalBase64 = null;
  nomeArquivo.textContent = "Anexar";
  previewLogo.innerHTML = `<span class="placeholder-logo">LOGO 3:1</span>`;
  inputValor.value = 20;

  await abrirTelaPagamentoPix({
    empresa,
    doador,
    tipo: "NOVO PATROCÍNIO",
    valor,
    logo: logoEnviar
  });
});

/* Carrega Ranking sincronizado com a aba Ranking da planilha */
async function carregarPatrocinadores() {
  if (enviandoDados) return;
  try {
    const resp = await fetch(`${URL_SHEETS}?t=${Date.now()}`);
    const dados = await resp.json();
    if (Array.isArray(dados)) {
      patrocinadores = dados;
      try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores)); } catch {}
      renderizarTudo();
      return;
    }
  } catch {}

  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo) patrocinadores = JSON.parse(salvo);
  } catch {}
  renderizarTudo();
}

montarCamadasCamisa();
carregarPatrocinadores();
setInterval(carregarPatrocinadores, 12000);