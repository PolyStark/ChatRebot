// 连接 Socket.io 服务器
const socket = io();

// DOM 元素
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const usernameModal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const usernameSubmit = document.getElementById('username-submit');
const onlineCount = document.getElementById('online-count');

let username = '';

// 显示消息函数
function displayMessage(data) {
    const messageDiv = document.createElement('div');
    
    if (data.isSystem) {
        messageDiv.className = 'message system-message';
    } else if (data.isBot) {
        messageDiv.className = 'message bot-message';
    } else {
        messageDiv.className = 'message user-message';
    }

    messageDiv.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 提交用户名
usernameSubmit.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        usernameModal.style.display = 'none';
        socket.emit('join', username);
    }
});

// 发送消息
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('sendMessage', message);
        messageInput.value = '';
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 监听服务器消息
socket.on('message', (data) => {
    displayMessage(data);
});

socket.on('userCount', (count) => {
    onlineCount.textContent = `在线用户: ${count}`;
});