const net = require('net');
const fs = require('fs');
const file = fs.createWriteStream('./chat.log');
let users = [];
const server = net.createServer((socket) => {
    let userNum = Math.ceil(Math.random() * 100);
    let username = `User${userNum}`;
    let welcome = `Welcome ${username} to the chat server!`;
    socket.username = username;
    users.push(socket);
    file.write(`${welcome}\n`);
    socket.write(welcome);
    socket.setEncoding('utf-8');
    for(var i = 0; i < users.length; i++) {
        if (users[i].username !== username){
            users[i].write(welcome);
        }
    }
    socket.on('data', (data) => {
        file.write(`${username}: ${data}`);
        console.log(`${username}: ${data}`);
        for(var i = 0; i < users.length; i++) {
            if (users[i].username !== username){
                users[i].write(`${username}: ${data}`);
            }
        }
    });
    socket.on('end', () => {

        users = users.filter(user => {
            return user.username !== username;
        });

        for(var i = 0; i < users.length; i++) {
            if (users[i] !== username){
                file.write(`${username} has disconnected.`);
                users[i].write(`${username} has disconnected.`);
                console.log(users);
            }
        }
    })
});

server.listen(3000);

console.log('Listening on port 3000');
