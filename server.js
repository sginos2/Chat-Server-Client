const net = require('net');
const fs = require('fs');
const file = fs.createWriteStream('./chat.log');
let users = [];
const server = net.createServer((socket) => {
    users.push(socket);
    socket.write('Welcome to the chat server!');
    socket.setEncoding('utf-8');
    for(var i = 0; i < users.length; i++) {
        if (users[i] !== socket){
            users[i].write(`Welcome ${socket.remotePort} to the chat!`);
        }
    }
    socket.on('data', (data) => {
        file.write(`${socket.remotePort}: ${data}`);
        console.log(`${socket.remotePort}: ${data}`);
        for(var i = 0; i < users.length; i++) {
            if (users[i] !== socket){
                users[i].write(`${socket.remotePort}: ${data}`);
            }
        }
    });
    socket.on('end', () => {
        socket.write(`${socket.remotePort} has disconnected.`);
    })
});

server.listen(5000);

console.log('Listening on port 5000');
