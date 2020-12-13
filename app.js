const dotenv = require('dotenv').config({
    path: './config/.env'
})
const app = require('express')();
const cors = require('cors')
const uuid = require('uuid').v4
app.use(cors)

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

let users = [];

io.on('connection', (socket) => {
    let user = {
        username: socket.handshake.query.username
    }

    socket.broadcast.emit('chat', {
        message: `${user.username} connected.`,
        date: Date.now(),
        username: 'Server',
        id: uuid()
    })

    users.push(socket.handshake.query.username);
    io.emit('users', users)

    socket.on('chat', (m) => {
        io.emit('chat', {
            message: m.message,
            date: Date.now(),
            username: m.username,
            id: uuid()
        })
        socket.broadcast.emit('stopped_typing', user)
    })

    socket.on('typing', () =>
    {
        console.log(`${user.username} typing`)
        socket.broadcast.emit('typing', user)
    })

    socket.on('stopped_typing', () =>
    {
        console.log(`${user.username} stopped typing.`)
        socket.broadcast.emit('stopped_typing', user)
    })

    socket.on('disconnect', () =>
    {
        console.log(user.username + ' disconnected.')
        io.emit('chat', {
            message: `${user.username} disconnected.`,
            date: Date.now(),
            username: 'Server',
            id: uuid()
        })

        users = users.filter(u => u !== user.username);
        io.emit('users', users)
    })
})

http.listen(80, () => {
    console.log(`App listening on port 80`);
})