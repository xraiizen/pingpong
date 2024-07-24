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
app.use('/css', express.static('css'));

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
    if (typeof options !== 'object' || !options.nomDuSalon || typeof options.nomDuSalon !== 'string') {
      socket.emit('erreur', 'Options du salon invalides');
      return;
    }
    
    const idSalon = generateUniqueId();
    salons[idSalon] = {
      host: socket.id,
      clients: [],
      score: {
        host: 0,
        clients: {}
      },
      options: options
    };
    socket.join(idSalon);
    socket.salonId = idSalon;
    socket.emit('salonCree', idSalon);
    io.emit('listeSalons', Object.keys(salons));
  });
  

  socket.on('rejoindreSalon', (idSalon) => {
    if (typeof idSalon !== 'string' || idSalon.trim() === '') {
      socket.emit('erreur', 'ID de salon invalide');
      return;
    }
    // Vérifier si le salon existe
    if (!salons[idSalon]) {
      socket.emit('erreur', 'Salon introuvable');
      return;
    }
    const MAX_CLIENTS = 2; // Nombre maximum de clients par salon
    const salon = salons[idSalon];

    if (salon && salon.clients.length >= MAX_CLIENTS) {
      socket.emit('erreur', 'Ce salon est plein.');
      // notifier les joueurs dans le salon qu'une tentative de rejoindre a été bloquée car le salon est plein
      salon.clients.forEach(clientId => {
        io.to(clientId).emit('notification', 'Un joueur a tenté de rejoindre le salon mais il est déjà plein.');
      });
      return;
    }
    if (!salons[idSalon].host) {
      salons[idSalon].host = socket.id;
      socket.emit('role', 'hôte');
    } else {
      socket.emit('role', 'client');
    }
    // Ajouter le client au salon
    // Assure-toi que le salon existe et que le client peut rejoindre, etc.
    salon.clients.push(socket.id);
    salon.score.clients[socket.id] = 0; // Initialise le score du client
    socket.join(idSalon);
    socket.salonId = idSalon;

    
    // Envoyer la mise à jour de la liste des clients du salon
    
    // Notifier le client qu'il a rejoint le salon
    socket.emit('salonRejoint', idSalon);
    io.to(idSalon).emit('miseAJourClients', salon.clients);
    console.log('Clients du salon', salon.clients);
  });


  socket.on('disconnect', () => {
    const salon = salons[socket.salonId];
    if (salon) {
      if (socket.id === salon.host) {
        // L'hôte a quitté, désigner un nouveau hôte ou fermer le salon
        if (salon.clients.length > 0) {
          salon.host = salon.clients[0]; // Simple exemple de désignation du nouveau hôte
          io.to(salon.host).emit('role', 'hôte');
        } else {
          // Fermer le salon si aucun client n'est présent
          delete salons[socket.salonId];
        }
      } else {
        // Un client a quitté, le retirer de la liste des clients
        salon.clients = salon.clients.filter(clientId => clientId !== socket.id);
      }
      // Mise à jour de la liste des salons pour tous les clients
      io.emit('listeSalons', Object.keys(salons));
    }
  });


  socket.on('updateBallPosition', (position) => {
    // Assure-toi que l'ID du salon est stocké dans l'objet socket lors de la connexion ou de la création d'un salon
    const idSalon = socket.salonId;
    if (!idSalon) {
      console.log("Erreur: Le socket n'est associé à aucun salon.");
      return; // Sortir si l'ID du salon n'est pas défini
    }

    console.log('Envoi de la mise à jour de la position de la balle', position);
    // Envoie la mise à jour à tous les participants du salon, sauf à l'émetteur
    socket.to(idSalon).emit('updateBallPosition', position);
  });
  socket.on('updateScore', (data) => {
    const {
      idSalon,
      score
    } = data; // Supposons que 'data' contienne l'ID du salon et les scores à mettre à jour
    const salon = salons[idSalon];
    if (!salon || typeof score.host !== 'number' || typeof score.client !== 'number') {
      socket.emit('erreur', 'Données de score invalides');
      return; // Le salon n'existe pas
    }
    // Met à jour les scores. Exemple :
    salon.score.host += score.host;
    Object.keys(score.clients).forEach(clientId => {
      if (salon.score.clients.hasOwnProperty(clientId)) {
        salon.score.clients[clientId] += score.clients[clientId];
      }
    });

    // Envoie les scores mis à jour à tous les clients du salon
    io.to(idSalon).emit('scoreMisAJour', salon.score);
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
server.listen(port, '0.0.0.0',() => {
  console.log(`Serveur écoutant sur le port ${port}`);
});