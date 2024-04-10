// Interface.js

document.getElementById('creerSalon').addEventListener('click', function() {
    const options = { nomDuSalon: "Nom dynamique ou une valeur de champ de saisie" }; // Exemple: récupérer la valeur d'un champ de saisie si nécessaire
    socket.emit('creerSalon', options);
});

document.getElementById('rejoindreSalon').addEventListener('click', function() {
    const idSalon = document.getElementById('idSalon').value; // Supposons que tu as un champ de saisie pour l'ID du salon
    if(idSalon) {
        socket.emit('rejoindreSalon', idSalon);
        this.disabled = true;
    } else {
        alert("Veuillez entrer un ID de salon valide.");
    }
});
socket.on('listeSalons', function(salons) {
    const listeSalonsDiv = document.getElementById('listeSalons');
    listeSalonsDiv.innerHTML = ''; // Vider la liste actuelle

    salons.forEach(function(salonId) {
        const salonElem = document.createElement('div');
        salonElem.classList.add("listeSalonsChild");
        salonElem.textContent = `Salon ID: ${salonId}`;
        salonElem.addEventListener('click', function() {
            document.getElementById('idSalon').value = salonId;
        });
        listeSalonsDiv.appendChild(salonElem);
    });
});
// Lorsque le salon est créé ou rejoint
function afficherJeu() {
    setupCanvas();
    document.getElementById('menu').style.display = 'none'; // Masquer le menu
    document.getElementById('ballCanvas').style.display = 'block'; // Afficher le canvas du jeu
}

// Lorsque l'ID du salon est reçu après la création ou la jonction
socket.on('salonCree', function(idSalon) {
 document.getElementById('affichageIdSalon').textContent = `ID du salon: ${idSalon}`;
    // afficherJeu();
});

socket.on('salonRejoint', function(idSalon) {
    document.getElementById('affichageIdSalon').textContent = `Rejoint le salon ID: ${idSalon}`;
     afficherJeu();
});

