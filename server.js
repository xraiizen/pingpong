// Server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const {
  v4: uuidv4
} = require('uuid');

function generateUniqueId() {
  return uuidv4(); // Génère et retourne un UUID v4
}
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const salons = {
  // idSalon: { host: socketId, clients: [socketIds], score: { host: 0, client: 0 } }
};
let hostSocketId = null; // Utilisez l'ID du socket pour suivre l'hôte

// Use CORS and specify the origin
app.use(cors());
app.use('/node_modules', express.static('node_modules'));
app.use('/js', express.static('js'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté', socket.id);

  io.emit('listeSalons', Object.keys(salons));
  if (!hostSocketId) {
    hostSocketId = socket.id; // Stocke l'ID du socket de l'hôte
    socket.emit('role', 'hôte');
  } else {
    socket.emit('role', 'client');
  }

  socket.on('creerSalon', (options) => {
    const idSalon = generateUniqueId();
    salons[idSalon] = {
      host: socket.id,
      clients: [],
      options: options
    };
    socket.join(idSalon);
    socket.salonId = idSalon;
    socket.emit('salonCree', idSalon);
    // Envoyez la liste des salons à tous les clients
    io.emit('listeSalons', Object.keys(salons));
  });

  socket.on('rejoindreSalon', (idSalon) => {
    // Logique pour rejoindre un salon...
  });


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
  socket.on('updateScore', (score) => {
    const idSalon = socket.salonId; // Récupérez l'ID du salon à partir de l'objet socket
    if (!idSalon || !salons[idSalon]) {
      return; // Assurez-vous que le salon existe
    }
    socket.broadcast.emit('updateScore', score);
    if (score.host >= 3 || score.client >= 3) {
      io.to(idSalon).emit('finPartie', {
        message: 'La partie est terminée. Voulez-vous rejouer ?'
      });
      // Ajoutez toute logique supplémentaire pour gérer la fin de la partie
    }
  });
});

function verifierEtDemarrerPartie(idSalon) {
  const salon = salons[idSalon];
  if (salon && salon.clients.length == 1) { // Par exemple, si vous souhaitez démarrer avec au moins 2 joueurs
    io.to(idSalon).emit('debutPartie', {
      message: 'La partie commence !'
    });
    // Envoyez l'état initial de la partie ici
    const etatInitial = {
      // Définissez l'état initial de votre jeu ici
    };
    io.to(idSalon).emit('etatInitial', etatInitial);
  }
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});