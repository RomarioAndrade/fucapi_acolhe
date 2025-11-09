document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionarioForm');
    const perguntasContainer = document.getElementById('perguntasContainer');
    const btnEnviar = document.getElementById('btnEnviar');
    const spinner = document.getElementById('spinner');

    // Carregar perguntas da API
    async function carregarPerguntas() {
        try {
            const response = await fetch('/api/perguntas',{
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const perguntas = await response.json();
                exibirPerguntas(perguntas);
            }

        } catch (error) {
            console.error('Erro ao carregar perguntas:', error);
            alert('Erro ao carregar o questionário. Tente recarregar a página.');
        }
    }

    // Exibir perguntas no formulário
    function exibirPerguntas(perguntas) {
        console.log(perguntas[0]);
        perguntasContainer.innerHTML = '';

        perguntas.forEach((pergunta, index) => {
            const perguntaHTML = `
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">${index + 1}. ${pergunta.texto}</h5>
                        
                        <div class="mt-3">                            
                            ${pergunta.respostas.map(resposta => `
                            <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" 
                                           name="pergunta_${pergunta.id}" 
                                           id="resposta_${resposta.id}" 
                                           value="${resposta.id}" required>
                                    <label class="form-check-label" for="resposta_${resposta.id}">
                                        ${resposta.texto}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            perguntasContainer.innerHTML += perguntaHTML;
        });
        perguntasContainer.innerHTML += `
            <!-- Observações sobre crises -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">5. Descreva com suas palavras como você se sente em um momento de crise ou o que seria mais útil para você nesses momentos:</h5>
                    <div class="mt-3">
                        <div class="form-group">
                            <textarea class="form-control" id="observacoes_crise" name="observacoes_crise" rows="4"
                            placeholder="Compartilhe suas experiências e necessidades..."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const botaoIniciar = document.getElementById('questionario-iniciar');
    botaoIniciar.addEventListener('click', () => {
        const form1 = document.getElementById('bem-vindo');
        form1.classList.remove('visible-div');
        form1.classList.add('hidden-div');
        document.getElementById('questionarioForm').classList.remove('hide');
        const form2 = document.getElementById('questionario-form');
        form2.classList.remove('hidden-div');
        form2.classList.add('visible-div');
    });

    // Enviar formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar formulário
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Coletar dados do formulário
        const formData = new FormData(form);
        const dados = {
            observacoes_crise: formData.get('observacoes_crise'),
            respostas: {}
        };

        // Coletar respostas das perguntas
        const radios = document.querySelectorAll('input[type="radio"]:checked');
        radios.forEach(radio => {
            const perguntaId = radio.name.replace('pergunta_', '');
            dados.respostas[perguntaId] = radio.value;
        });

        // Verificar se todas as perguntas foram respondidas
        if (Object.keys(dados.respostas).length === 0) {
            alert('Por favor, responda todas as perguntas.');
            return;
        }

        // Enviar dados
        try {
            btnEnviar.disabled = true;
            spinner.classList.remove('d-none');

            const response = await fetch('/api/questionario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();

            if (resultado.success) {
                window.location.href = '/obrigado';
            } else {
                throw new Error('Erro ao salvar questionário');
            }
        } catch (error) {
            console.error('Erro ao enviar questionário:', error);
            alert('Erro ao enviar questionário. Tente novamente.');
        } finally {
            btnEnviar.disabled = false;
            spinner.classList.add('d-none');
        }
    });

    // Inicializar
    carregarPerguntas();
});