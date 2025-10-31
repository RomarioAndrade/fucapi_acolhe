let tasks = [];
const saveTask = document.getElementById('save-task');

document.addEventListener('DOMContentLoaded', () => {
    // Referências para os elementos do HTML
    const monthYearEl = document.getElementById('month-year');
    const calendarBodyEl = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    //Lista com as tarefas do aluno


    // Variáveis para a data atual
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Função para renderizar o calendário
    function renderCalendar() {
        // Limpa o corpo da tabela
        calendarBodyEl.innerHTML = '';

        // Atualiza o mês e ano no cabeçalho
        monthYearEl.textContent = `${months[currentMonth]} ${currentYear}`;

        // Obtém o primeiro dia do mês (0 = domingo, 6 = sábado)
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        // Obtém o número de dias no mês atual
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        // Obtém o número de dias no mês anterior
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Variável para a data do dia
        let date = 1;
        let prevMonthDate = daysInPrevMonth - firstDayOfMonth + 1;
        let nextMonthDate = 1;

        // Cria as linhas e células da tabela
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');

                if (i === 0 && j < firstDayOfMonth) {
                    // Preenche as células com os dias do mês anterior
                    cell.textContent = prevMonthDate;
                    cell.classList.add('outside-month');
                    prevMonthDate++;
                } else if (date > daysInMonth) {
                    // Preenche as células com os dias do próximo mês
                    cell.textContent = nextMonthDate;
                    cell.classList.add('outside-month');
                    nextMonthDate++;
                } else {
                    // Preenche as células com os dias do mês atual
                    cell.textContent = date;

                    // Destaca o dia de hoje
                    if (date === new Date().getDate() &&
                        currentMonth === new Date().getMonth() &&
                        currentYear === new Date().getFullYear()) {
                        cell.classList.add('today');
                    }

                    date++;
                }
                row.appendChild(cell);
            }

            calendarBodyEl.appendChild(row);
        }
    }



    // Event listeners para os botões de navegação
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    async function loadTarefas() {
        try {
            const date = new Date(); // o dia de hoje
            const formattedDate = date.toISOString().split('T')[0];
            const response = await fetch(`/task/${formattedDate}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                tasks = await response.json();
            } else if (response.status === 404) {

            } else {
                throw new Error('Failed to load tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Erro ao carregar tarefas: ' + error.message);
        }
    }

    function displayTask(){
        const horas = Array.from({ length: 24 }, (_, i) => {
            return i.toString().padStart(2, '0') + ':00';
        });
        const tasks = document.getElementById('task');

        tasks.innerHTML = horas.map(i => `
            <div class="t-agenda-row" >
                <div class="day-hora">
                    ${i}
                </div>
                <div class="task-row"></div>
            </div>
        `).join('');
    }


    saveTask.addEventListener('click', event => {
        const titulo = document.getElementById('tarefa-nome').value.trim();
        const descricao = document.getElementById('tarefa-descricao').value.trim();
        const data_inicio = document.getElementById('date-tarefa').value;
        const taskHours = document.getElementById('hora-tarefa');
        const hora = taskHours.options[taskHours.selectedIndex].text;
        const taskType = getRadioValue('btnradio');

        alert(titulo+" "+descricao+" "+taskType+""+data_inicio+" "+hora);

    });

    // Renderiza o calendário na carga inicial
    renderCalendar();
    loadTarefas();
    displayTask();

    function getRadioValue(name) {
        try {
            const selected = document.querySelector(`input[name="${name}"]:checked`);
            return selected ? selected.value : null;
        } catch (error) {
            console.error('Error getting radio value:', error);
            return null;
        }
    }

});
