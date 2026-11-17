/* ==========================================================================
   CONFIGURAÇÃO DO BACKEND COMPARTILHADO (GOOGLE SHEETS / APPS SCRIPT)
   ========================================================================== */
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxDD4sEQooBZzYA0-0mHm3AkFxOtPtLLWpMfHS-Rl0zB1Xt5q6N_tZFMvQ62mqrbLkuAg/exec";
const CHAVE_STORAGE = "shitbot_patrocinadores_v2";

/* Posições calibradas para o enquadramento do jogador deslocado à esquerda */
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
const inputValor = document.getElementById("valor-lance");
const areaRanking = document.getElementById("area-ranking");
const contadorEl = document.getElementById("contador-patrocinadores");
const btnSubmit = document.getElementById("btn-submit");
const toastEl = document.getElementById("toast");

/* Elementos do Modal de Impulsionamento */
const modalVeu = document.getElementById("modal-veu");
const modalFechar = document.getElementById("modal-fechar");
const modalMarcaInfo = document.getElementById("modal-marca-info");
const atalhosValor = document.getElementById("atalhos-valor");
const inputAporte = document.getElementById("valor-aporte");
const modalPrevisao = document.getElementById("modal-previsao");

let patrocinadores = [];
let logoHorizontalBase64 = null;
let patrocinadorSelecionadoModal = null;
let enviandoDados = false;

/* Busca automática para "apresentacao" */
const formatosFoto = [
  "apresentacao.jpg",
  "apresentacao.png",
  "apresentacao.jpeg",
  "apresentacao.webp",
  "apresentacao"
];
let idxFoto = 0;

fotoJogador.addEventListener("error", () => {
  idxFoto++;
  if (idxFoto < formatosFoto.length) {
    fotoJogador.src = formatosFoto[idxFoto];
  }
});

/* Sincroniza a camada das estampas exatamente com o enquadramento real da imagem */
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
  toastEl._timer = setTimeout(() => toastEl.classList.remove("on"), 3500);
}

function obterInfoPosicao(pos) {
  if (pos === 1) {
    return {
      classeTier: "tier-t1",
      descricao: "Barriga Master + Costas Sup. + Chamadas VIP na transmissão"
    };
  }
  if (pos === 2 || pos === 3) {
    return {
      classeTier: "tier-t2",
      descricao: "Barriga Abaixo + Costas Inf. + Chamadas na transmissão"
    };
  }
  if (pos === 4 || pos === 5) {
    return {
      classeTier: "tier-t3",
      descricao: "Ombros + Calção + Inserções leves na transmissão"
    };
  }
  if (pos === 6 || pos === 7) {
    return {
      classeTier: "tier-t4",
      descricao: "Mangas + Calção + Inserção conjunta na transmissão"
    };
  }
  if (pos >= 8 && pos <= 10) {
    return {
      classeTier: "tier-t5",
      descricao: "Calção + Inserção conjunta na transmissão"
    };
  }
  return {
    classeTier: "tier-out fora-top10",
    descricao: "Fora do uniforme (Impulsione para voltar ao Top 10)"
  };
}

/* ==========================================================================
   RECORTA BORDAS VAZIAS E COMPRIME EM WEBP HORIZONTAL 3:1 (360x120 · ~8KB)
   ========================================================================== */
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
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];
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

        const larguraAlvo = 360;
        const alturaAlvo = 120;
        const canvas = document.createElement("canvas");
        canvas.width = larguraAlvo;
        canvas.height = alturaAlvo;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, larguraAlvo, alturaAlvo);

        const margem = 4;
        const maxW = larguraAlvo - margem * 2;
        const maxH = alturaAlvo - margem * 2;
        const escala = Math.min(maxW / cropW, maxH / cropH);
        const drawW = cropW * escala;
        const drawH = cropH * escala;
        const offsetX = (larguraAlvo - drawW) / 2;
        const offsetY = (alturaAlvo - drawH) / 2;

        ctx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, offsetX, offsetY, drawW, drawH);
        resolve(canvas.toDataURL("image/webp", 0.85));
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
    areaRanking.innerHTML = `
      <div class="lista-vazia">
        Nenhum patrocinador cadastrado ainda.<br>
        Crie o primeiro abaixo a partir de R$ 20,00!
      </div>
    `;
    return;
  }

  areaRanking.innerHTML = "";
  const maiorValor = Number(patrocinadores[0].valor);

  patrocinadores.forEach((pat, idx) => {
    const pos = idx + 1;
    const info = obterInfoPosicao(pos);
    const qtdAportes = pat.aportes || 1;
    const diferencaParaLider = Number((maiorValor - Number(pat.valor)).toFixed(2));
    const valorParaPassar = Number((diferencaParaLider + 1).toFixed(2));

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
          <span class="rank-lances-qtd">${qtdAportes} ${qtdAportes === 1 ? "lance" : "lances acumulados"}</span>
          <div class="rank-botoes">
            <button type="button" class="btn-acao-rank" data-acao="impulsionar">+ Impulsionar</button>
            ${pos > 1 ? `<button type="button" class="btn-acao-rank cobrir">Passar 1º (+R$ ${valorParaPassar.toFixed(0)})</button>` : ""}
          </div>
        </div>
      </div>
    `;

    item.querySelector('[data-acao="impulsionar"]').addEventListener("click", () => {
      abrirModalImpulso(pat, 1);
    });

    const btnCobrir = item.querySelector(".cobrir");
    if (btnCobrir) {
      btnCobrir.addEventListener("click", () => {
        abrirModalImpulso(pat, valorParaPassar);
      });
    }

    areaRanking.appendChild(item);
  });

  sincronizarEnquadramentoCamisa();
}

function abrirModalImpulso(pat, valorSugerido = 1) {
  patrocinadorSelecionadoModal = pat;
  const maiorValor = Number(patrocinadores[0].valor);
  const diffLider = Math.max(0, maiorValor - Number(pat.valor));
  const valorParaPassar = Number((diffLider + 1).toFixed(2));

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
    ${diffLider > 0 ? `<button type="button" class="chip-atalho destaque" data-soma="${valorParaPassar}">Virar 1º (+R$ ${valorParaPassar.toFixed(2).replace(".", ",")})</button>` : ""}
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
  inputAporte.focus();
  inputAporte.select();
}

function atualizarPrevisaoModal() {
  if (!patrocinadorSelecionadoModal) return;
  const soma = Math.max(0, Number(inputAporte.value) || 0);
  const novoTotal = Number((Number(patrocinadorSelecionadoModal.valor) + soma).toFixed(2));

  const simulacao = patrocinadores
    .map(p => p.id === patrocinadorSelecionadoModal.id ? novoTotal : Number(p.valor))
    .sort((a, b) => b - a);
  const novaPos = simulacao.indexOf(novoTotal) + 1;

  modalPrevisao.innerHTML = `
    Novo acumulado: <b>R$ ${novoTotal.toFixed(2).replace(".", ",")}</b> · Assume o <b>${novaPos}º lugar</b>
  `;
}

inputAporte.addEventListener("input", atualizarPrevisaoModal);

modalFechar.addEventListener("click", () => {
  modalVeu.hidden = true;
});

modalVeu.addEventListener("click", (e) => {
  if (e.target === modalVeu) modalVeu.hidden = true;
});

document.getElementById("form-impulsionar").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!patrocinadorSelecionadoModal) return;

  const aporte = Number(inputAporte.value);
  if (isNaN(aporte) || aporte < 1) {
    mostrarToast("O valor mínimo de impulsão é R$ 1,00.");
    inputAporte.focus();
    return;
  }

  const btnConfirmar = document.getElementById("btn-confirmar-aporte");
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = "Registrando impulsão...";

  patrocinadorSelecionadoModal.valor = Number((Number(patrocinadorSelecionadoModal.valor) + aporte).toFixed(2));
  patrocinadorSelecionadoModal.aportes = (patrocinadorSelecionadoModal.aportes || 1) + 1;

  await persistirDados(patrocinadorSelecionadoModal);
  renderizarTudo();

  btnConfirmar.disabled = false;
  btnConfirmar.textContent = "Impulsionar Agora";
  modalVeu.hidden = true;

  mostrarToast(`+R$ ${aporte.toFixed(2).replace(".", ",")} somados para ${patrocinadorSelecionadoModal.nome}!`);
});

/* ==========================================================================
   PERSISTÊNCIA COMPARTILHADA (GOOGLE SHEETS INTEGRADO)
   ========================================================================== */
async function carregarPatrocinadores() {
  if (enviandoDados) return;

  if (URL_SHEETS) {
    try {
      const resp = await fetch(`${URL_SHEETS}?t=${Date.now()}`, { redirect: "follow" });
      const dados = await resp.json();
      if (Array.isArray(dados) && dados.length > 0) {
        patrocinadores = dados;
        try {
          localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores));
        } catch {}
        renderizarTudo();
        return;
      }
    } catch (err) {
      console.warn("Erro ao ler Google Sheets, exibindo cache local:", err);
    }
  }

  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo) patrocinadores = JSON.parse(salvo);
  } catch {}
  renderizarTudo();
}

async function persistirDados(registroAtualizado) {
  enviandoDados = true;
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(patrocinadores));
  } catch {}

  if (URL_SHEETS) {
    try {
      // Envia sem custom headers para evitar preflight CORS e seguir o redirect 302 do Google
      await fetch(URL_SHEETS, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(registroAtualizado)
      });
    } catch (err) {
      console.warn("Aviso no POST para Google Sheets:", err);
    }
  }
  enviandoDados = false;
}

document.getElementById("form-patrocinio").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputEmpresa.value.trim();
  const valor = Number(inputValor.value);

  if (!nome) {
    mostrarToast("Digite o nome da empresa ou meme.");
    inputEmpresa.focus();
    return;
  }
  if (!logoHorizontalBase64) {
    mostrarToast("Anexe a imagem do logo.");
    return;
  }
  if (valor < 20) {
    mostrarToast("O lance inicial mínimo é R$ 20,00.");
    inputValor.focus();
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Salvando na planilha...";

  const existente = patrocinadores.find(p => p.nome.toLowerCase() === nome.toLowerCase());
  let registroFinal;

  if (existente) {
    existente.valor = Number((Number(existente.valor) + valor).toFixed(2));
    existente.aportes = (existente.aportes || 1) + 1;
    existente.logo = logoHorizontalBase64;
    registroFinal = existente;
  } else {
    registroFinal = {
      id: Date.now(),
      nome,
      valor,
      aportes: 1,
      logo: logoHorizontalBase64
    };
    patrocinadores.push(registroFinal);
  }

  await persistirDados(registroFinal);
  renderizarTudo();

  inputEmpresa.value = "";
  inputLogo.value = "";
  logoHorizontalBase64 = null;
  nomeArquivo.textContent = "Anexar imagem";
  previewLogo.innerHTML = `<span class="placeholder-logo">LOGO 3:1</span>`;
  inputValor.value = 20;

  btnSubmit.disabled = false;
  btnSubmit.textContent = "Criar Patrocínio";
  mostrarToast(`${nome} registrado na planilha com R$ ${registroFinal.valor.toFixed(2).replace(".", ",")}!`);
});

montarCamadasCamisa();
carregarPatrocinadores();

window.addEventListener("storage", (e) => {
  if (e.key === CHAVE_STORAGE) carregarPatrocinadores();
});

if (URL_SHEETS) {
  setInterval(carregarPatrocinadores, 15000);
}