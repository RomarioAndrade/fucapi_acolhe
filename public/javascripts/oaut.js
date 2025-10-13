let currentUser;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    currentUser = JSON.parse(localStorage.getItem('user'));

   if (!token || !currentUser) {
        window.location.href = '/';
        return;
    }
});