const net = require('net');
const fs = require('fs');
const file = fs.createWriteStream('./chat.log');
let users = [];
let adminPass = 'kicker3000';
const server = net.createServer((socket) => {
    let userNum = Math.ceil(Math.random() * 100);
    let username = `User${userNum}`;
    let welcome = `Welcome ${username} to the chat server!\n`;
    socket.username = username;
    users.push(socket);
    file.write(`${welcome}\n`);
    socket.setEncoding('utf-8');
    for(var i = 0; i < users.length; i++) {
        if (users[i].username !== username){
            users[i].write(welcome);
        }
    }
    socket.on('data', (data) => {
        if (!data.startsWith('/')) {
            file.write(`${username}: ${data}`);
            console.log(`${username}: ${data}`);
            for(var i = 0; i < users.length; i++) {
                if (users[i].username !== username){
                    users[i].write(`${username}: ${data}`);
                }
            }
        } else {
            if (data.split(' ')[0].trim() === '/w') {
                handleWhisper(data);
            } else if (data.split(' ')[0].trim() === '/username') {
                handleUsername(data);
            } else if (data.split(' ')[0].trim() === '/kick') {
                handleKick(data);
            } else if (data.split(' ')[0].trim() === '/clientlist') {
                handleList();
            } 
        }
    });

    function handleWhisper(data){
        let whisperer = username;
        let whisperee;
        if (data.split(' ')[1] !== undefined) {
            whisperee = data.split(' ')[1].trim();
        }    
        let msg = data.split(' ').slice(2).join(' ');
        if (data.split(' ').length < 3) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === whisperer) {
                    users[i].write('Incorrect number of inputs.\n');
                    file.write(`${username} wrote an incorrect number of inputs.\n`);
                }
            }
        } else if (whisperer === whisperee) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === whisperer) {
                    users[i].write('You cannot whisper to yourself.\n');
                    file.write(`${username} tried to whisper to themselves.\n`);
                }
            }
        } else if (!users.find(user => user.username === whisperee)) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === whisperer) {
                    users[i].write('Invalid username.\n');
                    file.write(`${username} wrote an invalid username.\n`);
                }
            }
        } else {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === whisperee) {
                    users[i].write(`${username} whispered: ${msg}\n`);
                    file.write(`${username} whispered to ${whisperee}: ${msg}\n`);
                } 
            }
        }
    };

    function handleUsername(data){
        let newName;
        if (data.split(' ')[1] !== undefined) {
            newName = data.split(' ')[1].trim();
        }
        if (data.split(' ').length < 2) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === username) {
                    users[i].write('Incorrect number of inputs.\n');
                    file.write(`${username} wrote an incorrect number of inputs.\n`);
                }
            }
        } else if (users.find(user => user.username === newName)) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === username) {
                    users[i].write('This username is taken\n');
                    file.write(`${username} tried to steal someone else's username.\n`);
                }
            }
        } else {
            let oldUsername = username;
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === username) {
                    file.write(`${username}'s username has been updated to ${newName}.\n`);
                    socket.username = newName;
                    username = newName;
                    users[i].write(`Your username has been updated to ${newName}.\n`);
                } else {
                    users[i].write(`${oldUsername}'s username has been updated to ${newName}.\n`);
                }
            }
        }
    };

    function handleKick(data){
        let kicker = username;
        let kickee;
        if (data.split(' ')[1] !== undefined) {
            kickee = data.split(' ')[1].trim();
        };
        if (data.split(' ').length < 3) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === kicker) {
                    users[i].write('Incorrect number of inputs.\n');
                    file.write(`${username} wrote an incorrect number of inputs.\n`);
                }
            }
        } else if (!users.find(user => user.username === kickee)) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === kicker) {
                    users[i].write('Invalid username.\n');
                    file.write(`${username} wrote an invalid username.\n`);
                }
            }
        } else if (kicker === kickee) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === kicker) {
                    users[i].write('You cannot kick yourself.\n');
                    file.write(`${username} tried to kick themselves.\n`);
                }
            }
        } else if (data.split(' ')[2].trim() !== adminPass) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === kicker) {
                    users[i].write('Incorrect password supplied.\n');
                    file.write(`${username} got the password wrong.\n`);
                }
            }
        } else {
            let socketDestroy = users.find(user => user.username === kickee);
            users = users.filter(user => {
                return user.username !== kickee;
            });
            for(var i = 0; i < users.length; i++) {
                users[i].write(`${username} has kicked ${kickee}.\n`);
            }
            file.write(`${username} has kicked ${kickee}.\n`);
            socketDestroy.destroy();
        }
    };

    function handleList(){
        let clientList = [];
        for (let i = 0; i < users.length; i++) {
            clientList.push(users[i].username);
        }
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                users[i].write(`${clientList}`);
                file.write(`${username} accessed the Client List: ${clientList}\n`);
            }
        }
    };
    
    socket.on('end', () => {
        users = users.filter(user => {
            return user.username !== username;
        });
        for(var i = 0; i < users.length; i++) {
            if (users[i] !== username){
                users[i].write(`${username} has disconnected.\n`);
                file.write(`${username} has disconnected\n`);
            }
        }
    });
});

server.listen(3000);

console.log('Listening on port 3000');
