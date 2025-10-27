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