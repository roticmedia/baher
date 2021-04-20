const Socket = require('socket.io');

module.exports = (server) => {
    const io = Socket(server, {
        cors: '*',
    });

    io.on('connection', (socket) => {
        console.log('hello');
    });
};
