document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const breathingCircle = document.getElementById('breathingCircle');
    const timer = document.getElementById('timer');
    const instruction = document.getElementById('instruction');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');

    // Elementos de configuração
    /*
    const inhaleTime = document.getElementById('inhaleTime');
    const holdTime = document.getElementById('holdTime');
    const exhaleTime = document.getElementById('exhaleTime');
    const inhaleValue = document.getElementById('inhaleValue');
    const holdValue = document.getElementById('holdValue');
    const exhaleValue = document.getElementById('exhaleValue');*/

    // Variáveis de estado
    let isRunning = false;
    let isPaused = false;
    let currentPhase = 0; // 0: inativo, 1: inspirar, 2: segurar, 3: expirar
    let countdown;
    let timeLeft;

    /*
    // Atualizar valores dos sliders
    inhaleTime.addEventListener('input', function() {
        inhaleValue.textContent = `${this.value} segundos`;
    });

    holdTime.addEventListener('input', function() {
        holdValue.textContent = `${this.value} segundos`;
    });

    exhaleTime.addEventListener('input', function() {
        exhaleValue.textContent = `${this.value} segundos`;
    });
    */

    // Iniciar a técnica
    startBtn.addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;
            isPaused = false;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            startBreathingCycle();
        }
    });

    // Pausar/continuar
    pauseBtn.addEventListener('click', function() {
        if (isRunning && !isPaused) {
            isPaused = true;
            clearInterval(countdown);
            pauseBtn.innerHTML = '<i class="fas fa-play me-2"></i>Continuar';
            instruction.textContent = 'Pausado';
        } else if (isRunning && isPaused) {
            isPaused = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pausar';
            startCountdown();
        }
    });

    // Reiniciar
    resetBtn.addEventListener('click', function() {
        isRunning = false;
        isPaused = false;
        clearInterval(countdown);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pausar';
        breathingCircle.className = 'breathing-circle';
        timer.textContent = '00';
        instruction.textContent = 'Clique em Iniciar para começar';
        resetPhases();
    });

    // Iniciar ciclo de respiração
    function startBreathingCycle() {
        currentPhase = 1;
        startCountdown();
    }

    // Iniciar contagem regressiva
    function startCountdown() {
        let duration;

        // Definir duração e instrução com base na fase atual
        switch(currentPhase) {
            case 1: // Inspirar
                //duration = parseInt(inhaleTime.value);
                duration = 4;
                breathingCircle.className = 'breathing-circle expand';
                instruction.textContent = 'Inspire lentamente pelo nariz';
                setActivePhase(1);
                break;
            case 2: // Segurar
                //duration = parseInt(holdTime.value);
                duration = 7;
                breathingCircle.className = 'breathing-circle hold';
                instruction.textContent = 'Segure a respiração';
                setActivePhase(2);
                break;
            case 3: // Expirar
                //duration = parseInt(exhaleTime.value);
                duration = 8;
                breathingCircle.className = 'breathing-circle shrink';
                instruction.textContent = 'Expire lentamente pela boca';
                setActivePhase(3);
                break;
        }

        timeLeft = duration;
        timer.textContent = timeLeft.toString().padStart(2, '0');

        countdown = setInterval(function() {
            timeLeft--;
            timer.textContent = timeLeft.toString().padStart(2, '0');

            if (timeLeft <= 0) {
                clearInterval(countdown);

                // Avançar para a próxima fase
                if (currentPhase < 3) {
                    currentPhase++;
                } else {
                    currentPhase = 1; // Reiniciar ciclo
                }

                if (isRunning && !isPaused) {
                    startCountdown();
                }
            }
        }, 1000);
    }

    // Definir fase ativa
    function setActivePhase(phase) {
        // Remover classe active de todas as fases
        phase1.classList.remove('active');
        phase2.classList.remove('active');
        phase3.classList.remove('active');

        // Adicionar classe active à fase atual
        switch(phase) {
            case 1:
                phase1.classList.add('active');
                break;
            case 2:
                phase2.classList.add('active');
                break;
            case 3:
                phase3.classList.add('active');
                break;
        }
    }

    // Redefinir fases
    function resetPhases() {
        phase1.classList.remove('active');
        phase2.classList.remove('active');
        phase3.classList.remove('active');
    }
});