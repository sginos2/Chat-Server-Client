const net = require('net');
const fs = require('fs');
const file = fs.createWriteStream('./chat.log');
let users = [];
const server = net.createServer((socket) => {
    let welcome = `Welcome ${socket.remotePort} to the chat server!`;
    users.push(socket);
    file.write(`${welcome}\n`);
    socket.write(welcome);
    socket.setEncoding('utf-8');
    for(var i = 0; i < users.length; i++) {
        if (users[i] !== socket){
            users[i].write(welcome);
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
        for(var i = 0; i < users.length; i++) {
            if (users[i] !== socket){
                file.write(`${socket.remotePort} has disconnected.`);
                users[i].write(`${socket.remotePort} has disconnected.`);
            }
        }
    })
});

server.listen(3000);

console.log('Listening on port 3000');
