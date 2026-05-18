'use strict'

import { getContatos, criarContato, atualizarContato, deletarContato } from './contatos.js';
import { uploadParaCloudinary } from './cloudinary.js';



function criarTelaLoginDOM() {
    // Se o usuário já logou nesta sessão, carrega a agenda direto
    if (sessionStorage.getItem('usuario_logado') === 'true') {
        carregarInterface();
        return;
    }

    // Seleciona a aplicação original para ocultar temporariamente
    const mainApp = document.querySelector('main');
    const headerApp = document.querySelector('header');
    if (mainApp) mainApp.classList.add('d-none');
    if (headerApp) headerApp.classList.add('d-none');

    // Cria os elementos do Login usando as classes do CSS separado
    const loginOverlay = document.createElement('div');
    loginOverlay.classList.add('login-overlay');

    const loginCard = document.createElement('div');
    loginCard.classList.add('login-card');

    const titulo = document.createElement('h2');
    titulo.textContent = 'Acesso à Agenda';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'E-mail (admin@admin.com)';
    emailInput.classList.add('login-input');
    emailInput.required = true;

    const senhaInput = document.createElement('input');
    senhaInput.type = 'password';
    senhaInput.placeholder = 'Senha (123456)';
    senhaInput.classList.add('login-input');
    senhaInput.style.marginBottom = '24px'; // Ajuste fino de margem para o botão
    senhaInput.required = true;

    const btnEntrar = document.createElement('button');
    btnEntrar.type = 'button';
    btnEntrar.textContent = 'Entrar';
    btnEntrar.classList.add('btn-login');

    // Validação do acesso
    btnEntrar.addEventListener('click', () => {
        if (emailInput.value === 'Vanessa' && senhaInput.value === '123456') {
            sessionStorage.setItem('usuario_logado', 'true');
            
            
            loginOverlay.remove();
            
        
            if (mainApp) mainApp.classList.remove('d-none');
            if (headerApp) headerApp.classList.remove('d-none');
            
            carregarInterface();
        } else {
            alert('Credenciais incorretas!');
        }
    });

    // Montagem da estrutura na tela
    loginCard.appendChild(titulo);
    loginCard.appendChild(emailInput);
    loginCard.appendChild(senhaInput);
    loginCard.appendChild(btnEntrar);
    loginOverlay.appendChild(loginCard);
    
    // Injeta a tela de login antes de tudo no body
    document.body.prepend(loginOverlay);
}


const form = document.querySelector('#contato-form');
const container = document.querySelector('#contatos-container');
const inputId = document.querySelector('#contato-id');
const inputNome = document.querySelector('#nome');
const inputEmail = document.querySelector('#email');
const inputCelular = document.querySelector('#celular');
const inputFoto = document.querySelector('#foto');
const inputEndereco = document.querySelector('#endereco');
const inputCidade = document.querySelector('#cidade');

function criarCardContato(contato) {
    const card = document.createElement('div');
    card.classList.add('contato-card'); 

    const img = document.createElement('img');
    img.src = contato.foto || 'https://via.placeholder.com/150';
    img.alt = `Foto de ${contato.nome}`;

    const nome = document.createElement('h3');
    nome.textContent = contato.nome;

    const email = document.createElement('p');
    email.textContent = contato.email;

    const celular = document.createElement('p');
    celular.textContent = contato.celular;

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.classList.add('btn-edit');
    btnEditar.addEventListener('click', () => preencherFormulario(contato));

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.classList.add('btn-delete');
    btnExcluir.addEventListener('click', () => removerContato(contato.id));
    
    
    card.dataset.id = contato.id;

    card.appendChild(img);
    card.appendChild(nome);
    card.appendChild(email);
    card.appendChild(celular);
    card.appendChild(btnEditar);
    card.appendChild(btnExcluir);

    return card;
}

async function carregarInterface() {
    try {
        const lista = await getContatos();
        container.replaceChildren(); 

        lista.forEach(contato => {
            const card = criarCardContato(contato);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error.message);
    }
}

function preencherFormulario(contato) {
    inputId.value = contato.id;
    inputNome.value = contato.nome;
    inputEmail.value = contato.email;
    inputCelular.value = contato.celular;
    inputEndereco.value = contato.endereco;
    inputCidade.value = contato.cidade;
    inputFoto.value = ''; 
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fotoArquivo = document.querySelector('#foto').files[0];
    let fotoBase64 = "";

    try {
        if (fotoArquivo) {
            const urlCloudinary = await uploadParaCloudinary(fotoArquivo);
            if (!urlCloudinary) {
                throw new Error('Falha ao enviar a imagem para o Cloudinary');
            }
            fotoBase64 = urlCloudinary;
        } else if (inputId.value) {
            const cardExistente = document.querySelector(`[data-id="${inputId.value}"] img`);
            fotoBase64 = cardExistente ? cardExistente.src : 'https://via.placeholder.com/150';
        } else {
            fotoBase64 = 'https://via.placeholder.com/150';
        }

        const dadosContato = {
            nome: inputNome.value,
            email: inputEmail.value,
            celular: inputCelular.value,
            foto: fotoBase64,
            endereco: inputEndereco.value,
            cidade: inputCidade.value
        };

        if (inputId.value) {
            await atualizarContato(inputId.value, dadosContato);
        } else {
            await criarContato(dadosContato);
        }

        form.reset();
        inputId.value = ''; 
        await carregarInterface();
        
        alert("Contato salvo com sucesso!");

    } catch (error) {
        console.error(error);
        alert("Erro ao salvar: " + error.message);
    }
});

// Executa a barreira de login controlada por classes do CSS externo
criarTelaLoginDOM();