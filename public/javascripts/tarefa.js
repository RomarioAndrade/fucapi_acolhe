let tasks = [];
let currentTask = [];
let today = new Date();
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
                    }else{
                        cell.classList.add('dia-do-mes');
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

    const calendarioContainer = document.getElementById('calendar-body');

    calendarioContainer.addEventListener('click', function(event) {
        // Verifica se o elemento clicado tem a classe 'dia-do-mes'
        if (event.target.classList.contains('dia-do-mes')) {
            // A função a ser executada
            alert('Você clicou no dia: ' + event.target.textContent);

            // Adicione aqui sua lógica para agendar um evento, etc.
        }
    });

    const agendaContainer = document.getElementById('task');
    agendaContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('event-chip')) {
            alert('Você clicou no dia: ' + event.target.textContent);
        }
    })

    async function loadTarefas() {
        try {
            const date = new Date(); // o dia de hoje
            const formattedDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + (date.getDay() < 10? '0' + date.getDate() : date.getDate());
            console.log(formattedDate);
            const response = await fetch(`/task/${formattedDate}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                tasks = await response.json();
                console.log(tasks.length);
                tasks.forEach(task => {
                    const date = new Date(task.data_inicio);
                    let hour =  date.getHours() < 10 ? '0'+date.getHours():date.getHours(); // Returns the hour (0-23)
                    const newTask = document.getElementById(`${hour}:00`);
                    newTask.innerHTML += `
                        <div id="${task.id}" class="task" >
                            <div class="event-chip">
                                <div>${task.titulo}</div>
                                <div>${task.categoria}</div>
                                <div>${new Date(task.data_inicio).toLocaleString()}</div>
                            </div>
                        </div>
                    `;
                });
                scrollTo();

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
        const htmlElement = document.getElementById('task');
        const titleAgenda = document.getElementById('title-agenda');
        const formatterBr = new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        titleAgenda.innerHTML = formatterBr.format(today);

        htmlElement.innerHTML = horas.map(i => `
            <div class="t-agenda-row" >
                <div class="day-hora">
                    ${i}
                </div>
                <div id="${i}" class="task-row">
                    
                </div>
            </div>
        `).join('');


    }


    saveTask.addEventListener('click', async event => {
        const titulo = document.getElementById('tarefa-nome').value.trim();
        const descricao = document.getElementById('tarefa-descricao').value.trim();
        const data = document.getElementById('date-tarefa').value;
        const taskHours = document.getElementById('hora-tarefa');
        const hora = taskHours.options[taskHours.selectedIndex].text;
        const taskType = getRadioValue('btnradio');

        const data_inicio = data +" "+hora;
        console.log("data_inicio: "+data_inicio);

        const response = await fetch(`/task/`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({titulo,descricao,data_inicio,hora,taskType}),
            credentials: 'include'
        });
        const taskDialog = document.querySelector('#exampleModal');
        const modal = bootstrap.Modal.getInstance(taskDialog);
        modal.hide();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar conversa');
        } else {
            currentTask = await response.json();
        }
        addTaskToView();
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

    function addTaskToView() {
        console.log(currentTask.tarefa.descricao);
        const date = new Date(currentTask.tarefa.data_inicio);
        let hour =  date.getHours() < 10 ? '0'+date.getHours():date.getHours(); // Returns the hour (0-23)
        const newTask = document.getElementById(`${hour}:00`);
        newTask.innerHTML += `
            <div id="${currentTask.tarefa.id}" class="task" >
                <div class="event-chip">
                    <div>${currentTask.tarefa.titulo}</div>
                    <div>${currentTask.tarefa.categoria}</div>
                    <div>${new Date(currentTask.tarefa.data_inicio).toLocaleString()}</div>
                </div>
            </div>`;

    }

    function scrollTo(){
        const hora = new Date().getHours();
        const id = (hora < 10 ? '0' + hora : hora)+":00";
        const toScroll = document.getElementById(id);

        if (toScroll) {
            toScroll.scrollIntoView({ behavior: 'smooth'});
        }
    }

});
