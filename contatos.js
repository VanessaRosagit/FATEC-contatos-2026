const BASE_URL = "https://bakcend-fecaf-render.onrender.com/contatos"


export async function getContatos() {
  const response = await fetch(BASE_URL)
  if (!response.ok) {
    throw new Error("Erro ao buscar contatos")
  }
  return response.json()
}

export async function criarContato(contato) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(contato)
  }

  const response = await fetch(BASE_URL, options)

  if (!response.ok) {
    throw new Error("Erro ao criar contato")
  }

  return response.json()
}

export async function atualizarContato(id, contato) {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(contato)
  }

  const response = await fetch(`${BASE_URL}/${id}`, options)

  if (!response.ok) {
    throw new Error("Erro ao atualizar contato")
  }

  return response.json()
}

export async function deletarContato(id) {
  const options = {
    method: "DELETE"
  }

  const response = await fetch(`${BASE_URL}/${id}`, options)

  if (!response.ok) {
    throw new Error("Erro ao deletar contato")
  }

  return true
}
