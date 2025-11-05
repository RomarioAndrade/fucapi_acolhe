let tasks = [];
let currentTask;
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

    function updateCalendar(date){

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

    //quando o modal aparece
    const taskModal = document.getElementById('nova-tarefa');
    taskModal.addEventListener('show.bs.modal', () => {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        const dateField = document.getElementById('date-tarefa');
        dateField.value = `${year}-${month}-${day}`;
    })

    const calendarioContainer = document.getElementById('calendar-body');
    calendarioContainer.addEventListener('click', function(event) {
        // Verifica se o elemento clicado tem a classe 'dia-do-mes'
        if (event.target.classList.contains('dia-do-mes')) {
            const active = calendarioContainer.querySelector('.active');
            if (active) {
                active.classList.remove('active');
            }
            event.target.classList.add('active');
            // A função a ser executada
            //alert('Você clicou no dia: ' + event.target.textContent);

            // Adicione aqui sua lógica para agendar um evento, etc.
            today.setMonth(currentMonth);
            today.setDate(event.target.textContent);
            activeDay();
            loadTarefas();
        }
    });

    const agendaContainer = document.getElementById('task');
    agendaContainer.addEventListener('click', async function (event) {
        if (event.target.classList.contains('event-chip')) {
            const myModal = new bootstrap.Modal('#task-view', {
                backdrop: true,
                keyboard: false
            })
            myModal.show();

            currentTask = await getTarefa(event.target.id);
            const id = document.getElementById('task-id');
            const titulo = document.getElementById('modal-task-title');
            const descricao = document.getElementById('descricao-tarefa');
            const data = document.getElementById('data-tarefa');
            const tipoTarefa = document.getElementById('tipo-tarefa');

            id.innerHTML = currentTask.id;
            titulo.innerHTML = currentTask.titulo;
            descricao.innerHTML = currentTask.descricao;
            const formatterBr = new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
            data.innerHTML = formatterBr.format(new Date(currentTask.data_inicio));
            tipoTarefa.innerHTML = currentTask.categoria;
        }
    });

    const btnPrev= document.getElementById('prev-btn');
    btnPrev.addEventListener('click', () => {
        today.setDate( today.getDate() -1);
        console.log(today);
        activeDay();
        loadTarefas();
    });


    const btnNext= document.getElementById('next-btn');
    btnNext.addEventListener('click', () => {
        today.setDate( today.getDate() +1);
        console.log(today);
        activeDay();
        loadTarefas();
    })

    const btnNow = document.getElementById('now-btn');
    btnNow.addEventListener('click', () => {
        today = new Date();
        activeDay();
        loadTarefas();
    });

    //Botão salva a tarefa
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
        const taskDialog = document.querySelector('#nova-tarefa');
        const modal = bootstrap.Modal.getInstance(taskDialog);
        modal.hide();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar a tarefa');
        } else {
            currentTask = await response.json();
        }
        const dataTarefa = new Date(data_inicio)
        if(!(today.getMonth() == dataTarefa.getMonth() && today.getDate() == dataTarefa.getDate())) {
            today = dataTarefa;
            loadTarefas();
            activeDay();
        }else{
            addTaskToView();

        }

    });

    const btnDelete = document.getElementById('btn-deletar-tarefa');
    btnDelete.addEventListener('click', async event => {
        const id = document.getElementById('task-id').textContent;
        const response = await fetch(`/task/remove/${id}`,{
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            const taskDialog = document.querySelector('#task-view');
            const modal = bootstrap.Modal.getInstance(taskDialog);
            modal.hide();

            const agendaContent = document.getElementById(`id-${id}`);
            agendaContent.remove();

        }
    });

    const btnEditarTarefa = document.getElementById('btn-editar-tarefa');
    btnEditarTarefa.addEventListener('click', async event => {
        const taskDialog = document.querySelector('#task-view');
        let modal = bootstrap.Modal.getInstance(taskDialog);
        modal.hide();

        const titulo = document.getElementById('titulo');
        const descricao = document.getElementById('descricao');
        const data = document.getElementById('dia');
        const hora = document.getElementById('hora');

        const data_inicio = new Date(currentTask.data_inicio);

        let formatterBr = new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
        titulo.value = currentTask.titulo;
        descricao.value = currentTask.descricao;

        const year = today.getFullYear();
        const month = String(data_inicio.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(data_inicio.getDate()).padStart(2, '0');
        data.value = `${year}-${month}-${day}`;

        hora.value = formatterBr.format(data_inicio);

        const radios = document.querySelectorAll('input[name="editradio"]');
        radios.forEach((radio) => {
            if (currentTask.categoria == radio.value ) {
                radio.checked = true;
            }
        });

        const myModal = new bootstrap.Modal('#modal-editar-tarefa')
        myModal.show();
    });

    const atualizarTarefa = document.getElementById('atualizar-tarefa');
    atualizarTarefa.addEventListener('click', async event => {
        currentTask.titulo = document.getElementById('titulo').value.trim();
        currentTask.descricao = document.getElementById('descricao').value.trim();
        const data = document.getElementById('dia').value;
        const hora = document.getElementById('hora').value;
        currentTask.data_inicio = data +" "+hora;
        currentTask.categoria = getRadioValue('editradio');

        try{
            await updateTarefa(currentTask);
            const modalElement = document.getElementById('modal-editar-tarefa');
            const myModal = bootstrap.Modal.getInstance(modalElement);
            myModal.hide();
        }catch (err){
            console.log(err);
        }

        const dataTarefa = new Date(currentTask.data_inicio)
        /*if(!(today.getMonth() == dataTarefa.getMonth() && today.getDate() == dataTarefa.getDate())) {
            today = dataTarefa;
            loadTarefas();
        }else {
            addTaskToView();
        }*/
        today = dataTarefa;
        loadTarefas();
        activeDay();

    });

    async function loadTarefas() {
        try {
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(today.getDate()).padStart(2, '0');
            const response = await fetch(`/task/data/${year}-${month}-${day}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                tasks = await response.json();
                console.log(tasks.length);

                const titleAgenda = document.getElementById('title-agenda');
                let formatterBr = new Intl.DateTimeFormat('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
                titleAgenda.innerHTML = formatterBr.format(today);
                cleanAgenda();
                if (!tasks.length == 0) {
                    tasks.forEach(task => {
                        const date = new Date(task.data_inicio);
                        formatterBr = new Intl.DateTimeFormat('pt-BR', {
                            hour: '2-digit',
                        });
                        const newTask = document.getElementById(`${formatterBr.format(date)}:00`);
                        formatterBr = new Intl.DateTimeFormat('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                        newTask.innerHTML += `
                        <div id="id-${task.id}" class="task" >
                                <div id="${task.id}" class="event-chip">
                                   ${task.titulo}, ${formatterBr.format(new Date(task.data_inicio))}
                                </div>
                        </div>
                    `;
                    });
                } else {
                    cleanAgenda();
                }
                scrollTo();

            } else if (response.status === 404) {

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

    // Renderiza o calendário na carga inicial
    renderCalendar();
    loadTarefas();
    displayTask();

    function cleanAgenda(){
        for(let i = 0; i < 24; i++){
            const horaFormatada = i.toString().padStart(2, '0');
            const newTask = document.getElementById(`${horaFormatada}:00`);
            newTask.innerHTML = ``;
        }
    }

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
        //console.log(currentTask);
        const date = new Date(currentTask.tarefa.data_inicio);
        let hour =  date.getHours() < 10 ? '0'+date.getHours():date.getHours(); // Returns the hour (0-23)
        const newTask = document.getElementById(`${hour}:00`);
        let formatterBr = new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
        newTask.innerHTML += `
            <div id="id-${currentTask.tarefa.id}" class="task" >
                <div id="${currentTask.tarefa.id}" class="event-chip">
                    ${currentTask.tarefa.titulo}, ${formatterBr.format(date)}
                </div>
            </div>`;

    }

    async function getTarefa(id) {
        const response = await fetch(`/tarefa/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            return await response.json();
        }
    }

    async function updateTarefa(tarefa) {
        try {
            const response = await fetch(`/task/update`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(tarefa)
            })

            if (!response.ok) {

            }
            return await response.json();
        }catch (error) {
            alert("Erro ao atualizar tarefa",error);
        }
    }

    function scrollTo(){
        const hora = new Date().getHours();
        const id = (hora < 10 ? '0' + hora : hora)+":00";
        const toScroll = document.getElementById(id);

        if (toScroll) {
            toScroll.scrollIntoView({ behavior: 'smooth'});
        }
    }

    function activeDay(){
        const months = today.getMonth();

        if (months != currentMonth){
            currentMonth = months;
            renderCalendar();
        }

        const calendar_body = document.getElementById('calendar-body');
        const day = calendar_body.querySelector('.active');
        if (day){
            day.classList.remove('active');
        }
        const daysInMonth = calendar_body.querySelectorAll('.dia-do-mes');
        daysInMonth.forEach(day => {
            if (day.textContent == today.getDate()) {
                day.classList.add('active');
            }
        });
    }

});
