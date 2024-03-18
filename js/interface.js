// Interface.js
document.getElementById('creerSalon').addEventListener('click', () => {
    // Vous pouvez étendre cette logique pour inclure des options de salon, si nécessaire.
    socket.emit('creerSalon', { /* Options du salon */ });
});
document.getElementById('rejoindreSalon').addEventListener('click', () => {
    const idSalon = document.getElementById('idSalon').value;
    socket.emit('rejoindreSalon', idSalon);
});


socket.on('salonCree', (idSalon) => {
    document.getElementById('affichageIdSalon').textContent = `ID du Salon : ${idSalon}`;
});
socket.on('salonRejoint', (idSalon) => {
    console.log(`Rejoint le salon avec l'ID : ${idSalon}`);
    // Vous pouvez ajouter une logique supplémentaire ici pour afficher une interface de salon ou autre feedback.
});


socket.on('listeSalons', (salons) => {
    const listeSalonsEl = document.getElementById('listeSalons'); // Assurez-vous que cet élément existe dans votre HTML
    listeSalonsEl.innerHTML = ''; // Réinitialiser la liste des salons
    
    salons.forEach(idSalon => {
        const salonEl = document.createElement('li');
        salonEl.textContent = `Salon: ${idSalon}`;
        salonEl.addEventListener('click', () => {
            socket.emit('rejoindreSalon', idSalon);
        });
        listeSalonsEl.appendChild(salonEl);
    });
});


document.addEventListener('DOMContentLoaded', (event) => {
    // Initialisation du socket client et autres initialisations
    initSocketListeners();
});

function initSocketListeners() {
    socket.on('listeSalons', (salons) => {
    const listeSalonsEl = document.getElementById('listeSalons'); // Assurez-vous que cet élément existe dans votre HTML
    listeSalonsEl.innerHTML = ''; // Réinitialiser la liste des salons
    
    salons.forEach(idSalon => {
        const salonEl = document.createElement('li');
        salonEl.textContent = `Salon: ${idSalon}`;
        salonEl.addEventListener('click', () => {
            socket.emit('rejoindreSalon', idSalon);
        });
        listeSalonsEl.appendChild(salonEl);
    });
});
}