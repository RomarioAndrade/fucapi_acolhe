document.getElementById('error-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const textInput = document.getElementById('text-input');
  const messageContainer = document.getElementById('message-container');
  const text = textInput.value;

  messageContainer.innerHTML = ''; // Limpa mensagens anteriores

  try {
    const response = await fetch('/errors/simulate-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Erro retornado pelo servidor (status 4xx ou 5xx)
      throw new Error(data.message || 'Ocorreu um erro.');
    }

    // Sucesso
    messageContainer.style.color = 'green';
    messageContainer.innerHTML = `<p>${data.message}</p>`;

  } catch (error) {
    // Erro de rede ou erro do servidor
    messageContainer.style.color = 'red';
    messageContainer.innerHTML = `<p>${error.message}</p>`;
  }
});
