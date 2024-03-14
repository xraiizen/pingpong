const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let hostSocketId = null; // Utilisez l'ID du socket pour suivre l'hôte

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté', socket.id);

  if (!hostSocketId) {
    hostSocketId = socket.id; // Stocke l'ID du socket de l'hôte
    socket.emit('role', 'hôte');
  } else {
    socket.emit('role', 'client');
  }

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
    if (socket.id === hostSocketId) {
      hostSocketId = null; // Réinitialisez l'hôte
      const remainingSockets = Object.keys(io.sockets.sockets);
      if (remainingSockets.length > 0) {
        hostSocketId = remainingSockets[0]; // Désignez un nouvel hôte parmi les utilisateurs restants
        io.to(hostSocketId).emit('role', 'hôte');
      }
    }
  });

  socket.on('updateBallPosition', (position) => {
    // Transmettez cette mise à jour à tous les clients sauf à l'émetteur
    console.log('Envoi de la mise à jour de la position de la balle', position);
    socket.broadcast.emit('updateBallPosition', position);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
