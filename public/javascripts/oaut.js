
async function login() {
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });

    const data = await response.json();

    if (response.ok) {
        window.location.href = '/home';
    } else {
        alert(data.error);
    }
}

async function logout() {
    const res = await fetch("/logout", {
        method: "POST",
        credentials: "include"
    });
    const data = await res.json();
    /*document.getElementById("msg").innerText = data.message || data.error;*/
    window.location.href = '/';
}