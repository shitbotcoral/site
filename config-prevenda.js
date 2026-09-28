// =====================================================
//  CONFIGURAÇÃO DA PRÉ-VENDA — NAVIO PIRATA DO ARRUDA
//  Edite só este arquivo quando tiver as informações.
//  A vitrine (index.html) e a página (navio-pirata.html) leem daqui.
//  (A conta do PIX fica em config-pix.js — é a mesma do Pipico.)
// =====================================================
const PREVENDA = {
    preco: 149.90,

    // Prazo mostrado pro cliente (texto livre). Ex: "16 de outubro"
    entregaPrevista: "16 de outubro",

    // Data limite da pré-venda. Vazio = sem data limite.
    // Formato: "2026-10-31T23:59:00-03:00"  (passou desse horário, a página fecha sozinha)
    encerraEm: "",

    // Limite de camisas vendidas na pré-venda. 0 (ou vazio) = sem limite.
    // Ao atingir, a página fecha sozinha e mostra "Pré-venda esgotada".
    // IMPORTANTE: quem trava de verdade é o Apps Script (LIMITE_PREVENDA, no topo
    // do Codigo_AppScript.gs) — mude o mesmo número nos dois lugares.
    limiteCamisas: 90
};