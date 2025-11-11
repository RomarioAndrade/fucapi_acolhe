async  function navigation(nav) {
    console.log('navigation', nav);
    if (nav === 'conectafucapi'){
        window.location.href = '/dashboard/chat';
    }
    if(nav === 'meudiafucapi'){
        window.location.href = '/dashboard/agenda';
    }
    if(nav === 'dashboard'){
        window.location.href = '/dashboard';
    }
};

const meudiafucapi = document.getElementById('meudiafucapi');
meudiafucapi.addEventListener('click', function(){
    // Toggle submenus
    const menuItems = document.querySelectorAll('.menu');

    console.log(menuItems);

    menuItems.forEach(item => {
        const menuLink = item.querySelector('.menu-item');
        const submenu = item.querySelector('.submenu');

        console.log(menuLink);
        console.log(submenu);

        menuLink.classList.toggle('active');
        submenu.classList.toggle('active');
    });

});