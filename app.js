import { getContatos, criarContato, atualizarContato, deletarContato } from './contatos.js';

import { uploadParaCloudinary } from './cloudinary.js';

// Seleção de elementos do DOM que já existem no HTML
const form = document.querySelector('#contato-form');
const container = document.querySelector('#contatos-container');
const inputId = document.querySelector('#contato-id');
const inputNome = document.querySelector('#nome');
const inputEmail = document.querySelector('#email');
const inputCelular = document.querySelector('#celular');
const inputFoto = document.querySelector('#foto');
const inputEndereco = document.querySelector('#endereco');
const inputCidade = document.querySelector('#cidade');

/**
 * Cria os elementos do card um por um, sem usar strings HTML.
 * Isso mantém o JS focado apenas na estrutura de dados.
 */
function criarCardContato(contato) {
    const card = document.createElement('div');
    card.classList.add('contato-card'); // A estilização vem toda do CSS

    const img = document.createElement('img');
    img.src = contato.foto || 'https://via.placeholder.com/150';
    img.alt = `Foto de ${contato.nome}`;

    const nome = document.createElement('h3');
    nome.textContent = contato.nome;

    const email = document.createElement('p');
    email.textContent = contato.email;

    const celular = document.createElement('p');
    celular.textContent = contato.celular;

    // Botão de Editar
   const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.classList.add('btn-edit');
    btnEditar.addEventListener('click', () => preencherFormulario(contato));

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.classList.add('btn-delete');
    btnExcluir.addEventListener('click', () => removerContato(contato.id));

    // Vincula o card ao ID do contato para manter a foto ao editar
    card.dataset.id = contato.id;

    // Montagem da árvore de elementos (DOM)
    card.appendChild(img);
    card.appendChild(nome);
    card.appendChild(email);
    card.appendChild(celular);
    card.appendChild(btnEditar);
    card.appendChild(btnExcluir);

    return card;
}

/**
 * Função para listar os contatos na tela
 */
async function carregarInterface() {
    try {
        const lista = await getContatos();
        container.replaceChildren(); // Limpa a lista de forma eficiente

        lista.forEach(contato => {
            const card = criarCardContato(contato);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error.message);
    }
}

/**
 * Preenche o formulário para edição
 */
function preencherFormulario(contato) {
    inputId.value = contato.id;
    inputNome.value = contato.nome;
    inputEmail.value = contato.email;
    inputCelular.value = contato.celular;
    inputEndereco.value = contato.endereco;
    inputCidade.value = contato.cidade;
    inputFoto.value = ''; // não é possível preencher um input file por segurança
    
    // O foco volta para o topo para o usuário ver o form preenchido
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Remove um contato e atualiza a tela
 */
async function removerContato(id) {
    if (confirm("Tem certeza que deseja excluir este contato?")) {
        try {
            await deletarContato(id);
            await carregarInterface();
        } catch (error) {
            alert(error.message);
        }
    }
}
// Função para converter arquivo em String Base64
const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};


/**
 * Evento de envio do formulário (Salvar/Atualizar)
 */
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. Captura o arquivo do input file
    const fotoArquivo = document.querySelector('#foto').files[0];
    let fotoBase64 = "";

    try {
        if (fotoArquivo) {
            // Se o usuário selecionou um arquivo novo, envia para o Cloudinary
            const urlCloudinary = await uploadParaCloudinary(fotoArquivo);
            if (!urlCloudinary) {
                throw new Error('Falha ao enviar a imagem para o Cloudinary');
            }
            fotoBase64 = urlCloudinary;
        } else if (inputId.value) {
            // Se for uma edição e não mudou a foto, mantemos a que já existe no card
            // (isso evita que a foto suma ao editar outros dados)
            const cardExistente = document.querySelector(`[data-id="${inputId.value}"] img`);
            fotoBase64 = cardExistente ? cardExistente.src : 'https://www.kindpng.com/picc/m/722-7221920_placeholder-profile-image-placeholder-png-transparent-png.png';
        } else {
            // Se for cadastro novo sem foto
            fotoBase64 = 'https://www.kindpng.com/picc/m/722-7221920_placeholder-profile-image-placeholder-png-transparent-png.png';
        }

        const dadosContato = {
            nome: inputNome.value,
            email: inputEmail.value,
            celular: inputCelular.value,
            foto: fotoBase64,
            endereco: inputEndereco.value,
            cidade: inputCidade.value
        };

        // 4. Envio para a API
        if (inputId.value) {
            await atualizarContato(inputId.value, dadosContato);
        } else {
            await criarContato(dadosContato);
        }

        // 5. Limpeza e atualização
        form.reset();
        inputId.value = ''; 
        await carregarInterface();
        
        alert("Contato salvo com sucesso!");

    } catch (error) {
        console.error(error);
        alert("Erro ao salvar: " + error.message);
    }
});

// Inicialização da página
carregarInterface();