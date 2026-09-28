// =====================================================
//  PIX DA LOJA — vale para o PIPICO e para o NAVIO PIRATA
//  Para trocar de conta, edite só estas 3 linhas.
//
//  O código PIX (copia e cola) já sai com o VALOR TOTAL da compra
//  embutido, então o cliente só cola e confirma.
//
//  IMPORTANTE: quem recebe o dinheiro é o banco onde a chave está
//  cadastrada. Uma chave só pode estar em UM banco por vez.
//  Para receber no Mercado Pago, a chave precisa aparecer em
//  Mercado Pago > Pix > Minhas chaves.
// =====================================================
const PIX = {
    // Cole a chave EXATAMENTE como aparece no app do banco:
    //   aleatória → xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    //   e-mail    → nome@email.com
    //   telefone  → +5581999999999   (com o + e o 55)
    //   CPF/CNPJ  → só números
    chave: "d071f949-a0bb-432e-8ad6-d3659cdb3da8",

    // Nome do titular da conta, como está cadastrado (até 25 letras; acentos são tirados sozinho)
    nome: "Gabriel da Silva Marques",

    // Cidade do titular (até 15 letras; acentos são tirados sozinho)
    cidade: "Recife"
};
