'use strict'

// Importando a função do arquivo que você acabou de renomear
import { uploadParaCloudinary } from './cloudinary.js';

// Função para mostrar a foto no círculo/quadrado (Preview)
const mostrarPreview = (event) => {
    const imagemTag = document.getElementById('preview-image');
    const arquivo = event.target.files[0];
    if (arquivo) {
        imagemTag.src = URL.createObjectURL(arquivo);
    }
}

// Função para enviar para a nuvem
const salvar = async () => {
    const arquivo = document.getElementById('preview-input').files[0];

    if (arquivo) {
        console.log("Iniciando upload...");
        const urlFinal = await uploadParaCloudinary(arquivo);
        
        if (urlFinal) {
            alert("Sucesso! Imagem salva no Cloudinary.");
            console.log("Link da imagem:", urlFinal);
        } else {
            alert("Erro: O Cloudinary recusou. Verifique se o Preset está Unsigned.");
        }
    } else {
        alert("Escolha uma imagem primeiro!");
    }
}

// Eventos
const previewInput = document.getElementById('preview-input');
const previewImage = document.getElementById('preview-image');
const uploadButton = document.querySelectorAll('.button')[0];

if (previewInput && previewImage) {
    previewInput.addEventListener('change', mostrarPreview);
}

if (uploadButton) {
    uploadButton.addEventListener('click', salvar);
}