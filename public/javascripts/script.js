let socket;
var currentUser;
let currentConversation = null;
let conversations = [];


// Initialize the chat
document.addEventListener('DOMContentLoaded', async () => {

    currentUser = await getCurrentUser();

    // Connect to Socket.io
    socket = io("http://localhost:3000");

    const current_page = window.location.pathname;

    //console.log('Current page: ', current_page);
    //console.log('Current User: ', currentUser);

    if(current_page === '/dashboard/chat'){
        // Load conversations
        if(currentUser.papel === 'aluno'){
            await loadFixedContacts();
        }else {
            await loadConversations();
        }
    }

    // Set up socket listeners
    socket.on('receive_message', (message) => {
        displayMessage(message);
        scrollToBottom();
    });

    socket.on('message_notification', (notification) => {
        if (currentConversation !== notification.conversationId) {
            alert(`New message from ${notification.sender}: ${notification.message}`);
        }
    });

    socket.on('connect', () => {

        const connectionStatus = document.getElementById('connectionStatus');
        console.log('Conectado ao servidor');

        connectionStatus.innerHTML = 'Conectado';
        //connectionStatus.classList.remove('disconnected');
        //connectionStatus.classList.add('connected');
    });

    socket.on('heartRate', (simulatedData) => {
        const currentBpm = document.getElementById('currentBpm');
        currentBpm.innerHTML = `<strong>${simulatedData.bpm.toString().padStart(3,0)}</strong><span class="material-symbols-outlined" style="margin:0px 10px;color: red">cardiology</span>
        `;
        const ultimaAtualizacao = document.getElementById('ultimaAtualizacao');
        ultimaAtualizacao.innerText = new Date(simulatedData.timestamp).toLocaleString();
    })
});


async function loadConversations() {
    try {
        const response = await fetch('/conversations', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            conversations = await response.json();
            displayConversations();
        } else if (response.status === 401) {
            // Token inválido, faz logout
            logout();
        } else {
            throw new Error('Failed to load conversations');
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
        alert('Erro ao carregar conversas: ' + error.message);
    }
}

function displayConversations() {
    const container = document.getElementById('conversations-list');

    if (conversations.length === 0) {
        container.innerHTML = '<div style="padding: 15px; text-align: center; color: #ccc;">Nenhuma conversa iniciada</div>';
        return;
    }

    console.log(conversations[conversations.length - 1]);

    container.innerHTML = conversations.map(conv => `
        <div class="conversation ${currentConversation === conv.id ? 'active' : ''}"
             onclick="selectConversation(${conv.id}, ${conv.other_user_id})">
             <div class="conversation-user"
                 <div class="c-user-row">
                    <div class="conversation-avatar">
                        ${conv.other_user.charAt(0).toUpperCase()}
                    </div>
                    <div class="conv-user-name">
                        <div><strong>${conv.other_user}</strong></div>
                        <div>
                            <p id="${conv.other_user_id}"><i><strong>${conv.last_message || 'No messages yet'}</strong></i></p>
                            <small>${conv.last_message_time ? new Date(conv.last_message_time).toLocaleString() : 'Nenhuma mensagem'}</small>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
  `).join('');
}

async function selectConversation(conversationId, otherUserId) {
    try {
        currentConversation = conversationId;

        // Join the conversation room
        socket.emit('join_conversation', conversationId);

        // Tenta obter o nome do usuário para o header
        let otherUserName = conversations.find(c => c.id === conversationId)?.other_user;

        if (!otherUserName && otherUserId) {
            // Se não encontrou na lista, busca via API
            const response = await fetch(`/users/${otherUserId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const user = await response.json();
                otherUserName = user.username;
            }
        }

        // Update UI
        //document.getElementById('chat-user-title').appendChild(document.createTextNode(`Chat with ${otherUserName || 'Unknown User'}`));
        document.getElementById('chat-user-title').innerHTML = `Chat com ${otherUserName || 'Usuário Desconhecido'}`;
        document.getElementById('message-text').disabled = false;
        document.getElementById('messages-container').innerHTML = '';

        // Load messages
        const response = await fetch(`/conversations/${conversationId}/messages`, {
            method: 'GET',
            credentials: 'include'
        });

        console.log(conversationId);

        if (response.ok) {
            const messages = await response.json();
            console.log("response ok");
            if (messages.length > 0) {
                messages.forEach(displayMessage);
                scrollToBottom();

                // Mark messages as read
                socket.emit('mark_as_read', {
                    conversationId,
                    userId: currentUser.id
                });
                //displayConversations();
            }

        } else {
            throw new Error('Failed to load messages');
        }

        // Update conversations list highlighting


    } catch (error) {
        console.error('Error selecting conversation:', error);
        alert('Erro ao carregar conversa: ' + error.message);
    }
}

function displayMessage(message) {
    const container = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    if (message.sender_id == currentUser.id) {
        messageDiv.innerHTML = `
<div class="chat-message recipient">
            <div class="message-text">${message.message}</div>
            <div style="flex-direction: row;display: flex;">
                <div class="message-date">${new Date(message.created_at).toLocaleString()}</div>
                <div class="message-username">${message.sender_name}</div>
                <div class="message-avatar">${message.sender_name.charAt(0).toUpperCase()}</div>
            </div>
        </div>`;
    } else {
        messageDiv.innerHTML = `
        <div class="chat-message">
            <div class="chat-message-info">
                <div class="message-avatar">${message.sender_name.charAt(0).toUpperCase()}</div>
                <div class="message-username">
                    <div>${message.sender_name}</div>
                </div>
                <div class="message-date">${new Date(message.created_at).toLocaleString()}</div>
            </div>
            <div class="message-text">${message.message}</div>
        </div>`;
    }
    container.appendChild(messageDiv);
}

function sendMessage() {
    const messageInput = document.getElementById('message-text');
    const message = messageInput.value.trim();

    if (message && currentConversation) {
        socket.emit('send_message', {
            conversationId: currentConversation,
            senderId: currentUser.id,
            message: message,
            receiverId: conversations.find(c => c.id === currentConversation)?.other_user_id
        });

        messageInput.value = '';
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function scrollToBottom() {
    const container = document.getElementById('scroll-messages');
    container.scrollTop = container.scrollHeight;
}

async function searchUsers(query) {
    const resultsContainer = document.getElementById('search-results');

    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });

        if (response.ok) {
            const users = await response.json();

            if (users.length > 0) {
                resultsContainer.innerHTML = users.map(user => `
          <div style="padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;"
               onclick="startConversation(${user.id}, '${user.username.replace(/'/g, "\\'")}')">
            <strong>${user.username}</strong> (${user.email})
          </div>
        `).join('');
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.innerHTML = '<div style="padding: 8px; color: #666;">Nenhum usuário encontrado</div>';
                resultsContainer.style.display = 'block';
            }
        } else {
            resultsContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.style.display = 'none';
    }
}

async function loadFixedContacts() {
    const resultsContainer = document.getElementById('contatos_lista');

    try {
        const response = await fetch(`/users/searchfixed`, {
            method: 'GET',
            credentials: "include"
        });

        if (response.ok) {
            const users = await response.json();
            if (users.length > 0) {
                resultsContainer.innerHTML = users.map(user => `
                <div class="contato" onclick="startConversation(${user.id}, '${user.username.replace(/'/g, "\\'")}')">
                    <div class="c-user" id=${user.id}>
                        <div class="c-user-row">
                            <div class="c-user-icon">
                                ${user.username.charAt(0).toUpperCase()}
                            </div>
                            <div class="c-user-name">
                                 <div>${user.username}</div>
                                 <div>${user.papel}</div>
                            </div>
                        </div>
                    </div>
                </div>
                `).join('');
            }
        }

    } catch (error) {
        console.error('Search error:', error);
    }

}

async function startConversation(userId, username) {
    try {
        encontrarDivAtiva();

        const contactDiv = document.getElementById(userId);
        contactDiv.classList.add('active');

        // Verifica se a conversa já existe localmente
        let conversation = conversations.find(c => c.other_user_id === userId);

        if (!conversation) {
            // Cria nova conversa via API
            const response = await fetch('/conversations', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({otherUserId: userId})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar conversa');
            }

            const newConversation = await response.json();

            // Adiciona à lista de conversas
            conversations.push(newConversation);
            conversation = newConversation;
        }

        // Seleciona a conversa
        await selectConversation(conversation.id, userId);

    } catch (error) {
        console.error('Error starting conversation:', error);
        alert('Erro ao iniciar conversa: ' + error.message);
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch(`/current`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            return user;
        }
    } catch (error) {
        alert('Erro ao carregar usuario: ' + error.message);
    }
}

function encontrarDivAtiva() {
    const container = document.getElementById('contatos_lista');
    const divAtivaNoContainer = container.getElementsByClassName('active');
    if (divAtivaNoContainer.length !== 0) {
        divAtivaNoContainer[0].classList.remove('active');
    }

}

