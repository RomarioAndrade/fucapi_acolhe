async function navigation(nav) {
    console.log('navigation', nav);
    if (nav === 'conectafucapi') {
        window.location.href = '/dashboard/chat';
    }
    if (nav === 'meudiafucapi') {
        window.location.href = '/dashboard/agenda';
    }
    if (nav === 'dashboard') {
        window.location.href = '/dashboard';
    }
    if (nav === 'perfil') {
        window.location.href = '/dashboard/perfil-usuario';
    }
    if (nav === 'chat') {
        window.location.href = '/dashboard/chat';
    }
    if (nav === 'foco') {
        window.location.href = '/dashboard/foco';
    }

};

const meudiafucapi = document.getElementById('meudiafucapi');
meudiafucapi.addEventListener('click', function () {
    if (meudiafucapi.classList.contains('active')) {
        meudiafucapi.classList.remove('active');
    } else {
        hideMenu();
        meudiafucapi.classList.add('active');
    }
});


const conecta = document.getElementById('conectafucapi');
conecta.addEventListener('click', function () {
    if (conecta.classList.contains('active')) {
        conecta.classList.remove('active');
    } else {
        hideMenu();
        conecta.classList.add('active');
    }
});

const calma = document.getElementById('espacocalma');
calma.addEventListener('click', function () {
    if (calma.classList.contains('active')) {
        calma.classList.remove('active');
    } else {
        hideMenu();
        calma.classList.add('active');
    }
});

function hideMenu(){
    const menus = document.querySelectorAll('.menu');
    menus.forEach((menu) => {
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    });
}