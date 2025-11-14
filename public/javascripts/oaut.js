
async function login() {
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });

    const data = await response.json();
    console.log("Teste"+data);

    if (response.ok) {
        if (data.question && data.user.papel == 'aluno') {
            window.location.href = '/questionario';
        }else {
            window.location.href = '/dashboard';
        }
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


document.addEventListener('DOMContentLoaded', function() {
    const myElement = document.getElementById('login-password');
    if (myElement) { // Check if the element exists before adding the listener
        myElement.addEventListener('keydown', function() {
            if (event.key === 'Enter') {
                login();
            }
        });
    }
});