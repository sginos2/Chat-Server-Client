const net = require('net');
const client = net.createConnection({port: 3000}, () => {
    console.log('You have connected to the server. Welcome!');
});

client.setEncoding('utf-8');

client.on('data', (data) => {
    console.log(data);
});

process.stdin.pipe(client);