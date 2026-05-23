// Esse esquema aqui vai ser substituído pelos dados da tua planilha depois
const camisas = [
    { id: 1, nome: 'Camisa Padrão', preco: '90,00', tamanhos: ['P', 'M', 'G', 'GG'], imagem: 'img/camisa-exemplo.jpg' },
    { id: 2, nome: 'Camisa Retrô', preco: '120,00', tamanhos: ['M', 'G'], imagem: 'img/camisa-exemplo2.jpg' }
];

const vitrine = document.querySelector('.grid-camisas');

function carregarVitrine() {
    vitrine.innerHTML = ''; // Limpa aquele HTML estático que a gente fez antes

    camisas.forEach(camisa => {
        const card = document.createElement('div');
        card.classList.add('card-camisa');
        
        card.innerHTML = `
            <img src="${camisa.imagem}" alt="${camisa.nome}">
            <h3>${camisa.nome}</h3>
            <p class="preco">R$ ${camisa.preco}</p>
            <p class="tamanhos-disponiveis">Disponível: ${camisa.tamanhos.join(', ')}</p>
            <button class="btn-comprar" onclick="comprar(${camisa.id})">Adicionar ao Carrinho</button>
        `;
        vitrine.appendChild(card);
    });
}

function comprar(id) {
    alert('Camisa ' + id + ' adicionada! Depois a gente ajeita a bronca do carrinho.');
}

// Roda a função quando a página abre
carregarVitrine();