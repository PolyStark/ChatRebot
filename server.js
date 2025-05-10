console.log("✅ Server is starting...");
const express = require('express');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务（前端页面）
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Socket.io 实时通信
const io = socketio(server);

// 存储在线用户
const users = {};

// 机器人回复逻辑
function getBotResponse(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('你好') || lowerMsg.includes('hi')) {
        return '你好！我是聊天机器人~';
    } else if (lowerMsg.includes('时间')) {
        return `现在是北京时间：${new Date().toLocaleTimeString()}`;
    } else {
        return '抱歉，我不太明白你的意思。';
    }
}

// Socket.io 连接处理
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // 新用户加入
    socket.on('join', (username) => {
        users[socket.id] = username;
        // 广播通知其他用户
        socket.broadcast.emit('message', {
            user: '系统',
            text: `${username} 加入了聊天室`,
            isSystem: true
        });
    });

    // 接收用户消息
    socket.on('sendMessage', (message) => {
        const username = users[socket.id];
        // 广播用户消息
        io.emit('message', {
            user: username,
            text: message,
            isUser: true
        });

        // 机器人回复（1秒延迟模拟思考）
        setTimeout(() => {
            io.emit('message', {
                user: '机器人',
                text: getBotResponse(message),
                isBot: true
            });
        }, 1000);
    });

    // 用户断开连接
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            io.emit('message', {
                user: '系统',
                text: `${username} 离开了聊天室`,
                isSystem: true
            });
        }
    });
});