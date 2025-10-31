
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');


var game_manager = require("./game_manager");


const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.on('new_session', () => {
        
        socket.emit('session_id', game_manager.new_session());
    });

    socket.on('keep_alive', (session_id) => {
        alive = game_manager.keep_alive(session_id);
        socket.emit("alive", alive);
    });

    socket.on('new_roll', (session_id) => {
        game_manager.new_roll(session_id);

        // Broadcast rolls to all clients except sender
        socket.broadcast.emit("rolls", game_manager.get_rolls());

        // Send rolls to sender
        socket.emit("rolls", game_manager.get_rolls());
    });

    socket.on('get_rolls', () => {
        socket.emit("rolls", game_manager.get_rolls());
    });

    socket.on('new_game', () => {
        game_manager.new_game();


        socket.broadcast.emit("rolls", game_manager.get_rolls());
        socket.emit("rolls", game_manager.get_rolls());
    });

    socket.on('unroll', () => {
        game_manager.unroll();

        socket.broadcast.emit("rolls", game_manager.get_rolls());
        socket.emit("rolls", game_manager.get_rolls());
    });



});


const port = 2001;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});