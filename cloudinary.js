'use strict'

const CLOUD_NAME = 'drcdrisch'; 
const UPLOAD_PRESET = 'fotos_contato'; 

export async function uploadParaCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(url, {
        method: 'POST',
        body: data
    });

    if (response.ok) {
        const result = await response.json();
        return result.secure_url;
    } else {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', response.status, errorText);
        return null;
    }
}