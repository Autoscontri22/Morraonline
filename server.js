const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

let waitingPlayer = null;
const rooms = {}; // roomId -> { players: [socketId], playerMap: {socketId: 1/2}, choices: {}, scores: {1:0,2:0} }

function determineWinner(a, b) {
    if (a === b) return 'draw';
    if ((a === 'rock' && b === 'scissors') ||
        (a === 'paper' && b === 'rock') ||
        (a === 'scissors' && b === 'paper')) {
        return 'player';
    }
    return 'opponent';
}

io.on('connection', (socket) => {
    console.log('Nuovo socket connesso:', socket.id);

    socket.on('joinGame', () => {
        if (waitingPlayer && waitingPlayer !== socket.id) {
            const roomId = `room-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const room = {
                players: [waitingPlayer, socket.id],
                playerMap: {},
                choices: {},
                scores: {1: 0, 2: 0},
            };
            room.playerMap[waitingPlayer] = 1;
            room.playerMap[socket.id] = 2;
            rooms[roomId] = room;

            io.sockets.sockets.get(waitingPlayer)?.join(roomId);
            socket.join(roomId);

            io.to(waitingPlayer).emit('matched', roomId, 1);
            io.to(socket.id).emit('matched', roomId, 2);
            waitingPlayer = null;

            console.log('Match creato', roomId, room.players);
        } else {
            waitingPlayer = socket.id;
            socket.emit('waitingOpponent');
            console.log('In attesa avversario', socket.id);
        }
    });

    socket.on('playMove', ({ roomId, move, playerNumber }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (!room.choices) room.choices = {};
        room.choices[playerNumber] = move;

        const otherNumber = playerNumber === 1 ? 2 : 1;

        if (room.choices[1] && room.choices[2]) {
            const playerMove = room.choices[playerNumber];
            const opponentMove = room.choices[otherNumber];

            const outcome = determineWinner(playerMove, opponentMove);
            let result;
            if (outcome === 'draw') result = 'draw';
            else if (outcome === 'player') result = 'win';
            else result = 'lose';

            if (outcome === 'player') {
                room.scores[playerNumber] += 1;
            } else if (outcome === 'opponent') {
                room.scores[otherNumber] += 1;
            }

            const finished = room.scores[1] >= 2 || room.scores[2] >= 2;
            let winner = null;
            if (finished) {
                winner = room.scores[1] > room.scores[2] ? 1 : 2;
            }

            for (const playerSocketId of room.players) {
                const pNum = room.playerMap[playerSocketId];
                const pMove = room.choices[pNum];
                const oppMove = room.choices[pNum === 1 ? 2 : 1];
                const pOutcome = determineWinner(pMove, oppMove);
                let pResult = 'draw';
                if (pOutcome === 'player') pResult = 'win';
                else if (pOutcome === 'opponent') pResult = 'lose';

                io.to(playerSocketId).emit('roundResult', {
                    playerChoice: pMove,
                    opponentChoice: oppMove,
                    result: pResult,
                    playerScore: room.scores[pNum],
                    opponentScore: room.scores[pNum === 1 ? 2 : 1],
                    finished,
                    winner,
                });
            }

            if (finished) {
                room.choices = {};
                room.scores = {1: 0, 2: 0};
            } else {
                room.choices = {};
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnesso:', socket.id);
        if (waitingPlayer === socket.id) {
            waitingPlayer = null;
            return;
        }

        // Se faceva parte di una stanza, notifica l'altro
        const roomId = Object.keys(rooms).find((id) => rooms[id].players.includes(socket.id));
        if (roomId) {
            const room = rooms[roomId];
            const otherPlayer = room.players.find((id) => id !== socket.id);
            if (otherPlayer) {
                io.to(otherPlayer).emit('opponentLeft');
            }
            delete rooms[roomId];
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});