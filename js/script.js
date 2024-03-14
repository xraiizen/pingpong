const socket = io("http://127.0.0.1:3000/");
const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');
let decalageY = 15;
let ball = {
    radius: 10,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    visible: false,
    velocity: 3
};
let paddle = {
    height: 10,
    width: 75,
    x: null,
    y: null,
    direction: null
};
let goal = {
    x: 0,
    y: 0,
    width: 75,
    height: 10
};
let score = {
    host: 0,
    client: 0
};
let userRole = '';

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight + decalageY;
    animateSetup();
}


function animateSetup() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawGoals();
    drawScores();
    collisionRaquette();
    collisionBords();
    requestAnimationFrame(animateSetup);
}

function resetBallPosition() {
    ball.x = canvas.width / 2 - (ball.radius / 2);
    ball.y = canvas.height / 2 - (ball.radius / 2);
    ball.dx = 0;
    ball.dy = 0;
    ball.velocity = 3;
}

function drawBall() {
    if (!ball.visible) return;
    ball.x = ball.x || canvas.width / 2 - (ball.radius / 2);
    ball.y = ball.y || canvas.height / 2 - (ball.radius / 2);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    paddle.x = paddle.x || (canvas.width - paddle.width) / 2;
    paddle.y = paddle.y || canvas.height - paddle.height;
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.shadowColor = '#22282C';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fill();
    ctx.closePath();
}

function drawGoals() {
    goal.x= canvas.width / 2 - goal.width / 2,
    goal.y= canvas.height - goal.height,
    ctx.beginPath();
    ctx.rect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.closePath();

}

function drawScores() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`Hôte: ${score.host}`, 10, 75); // Positionner le score de l'hôte en haut à gauche
    ctx.fillText(`Vous etes ${userRole}`, canvas.width / 2 - 100,
        75); // Positionner le score du client en haut à droite
    ctx.fillText(`Client: ${score.client}`, canvas.width - 140,
        75); // Positionner le score du client en haut à droite
}

//     function updateBallPosition() {
//       if (!ball.visible) return;
//       // Démarrez le mouvement de la balle lors de la première collision avec la raquette
//       //console.log(ball.dy, ball.dx, ball.y, paddle.y - ball.radius);
//       if (ball.dy === 0 && ball.dx === 0 && ball.y === paddle.y - ball.radius) {
//         console.log(ball.dy, ball.dx, ball.y, paddle.y - ball.radius)
//         if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
//           ball.velocity = 1; // Réinitialisez la vitesse si nécessaire
//           ball.dy = -2 * ball.velocity; // Définissez les valeurs initiales pour commencer le mouvement
//           ball.dx = 8 * ((ball.x - (paddle.x + paddle.width / 2)) / paddle.width);
//         }
//       }

//       // Collision avec les bords latéraux du canvas
//       if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
//         ball.dx = -ball.dx;
//       }

//       // Collision avec la raquette, en prenant en compte la position verticale actuelle de la balle
//       if (ball.dy > 0 && ball.y < paddle.y - ball.radius && ball.y + ball.dy >= paddle.y - ball.radius) {
//         if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
//           ball.dy = -ball.dy * ball.velocity; // Inverse la direction verticale de la balle et applique l'accélération
//           ball.dx = 8 * ((ball.x - (paddle.x + paddle.width / 2)) / paddle
//           .width); // Applique l'accélération horizontale
//           // Pas besoin de réajuster `ball.y` ici car l'ajustement est basé sur la condition de collision
//         }
//       }

//       // Gère la collision avec le haut du canvas ou la transmission de la balle
//       if (ball.y < 0) {
//           ball.visible = false;
//           sendData();
//           return; // Arrête la mise à jour de la position pour éviter les mouvements inattendus

//       }

//       // Rebond sur le bas du canvas
//       if (ball.y + ball.dy > canvas.height - ball.radius) {
//     // Supposons que le but inférieur appartient à l'hôte
//     if (ball.x > canvas.width / 2 - goal.width / 2 && ball.x < canvas.width / 2 + goal.width / 2) {
//         if (userRole === 'hôte') {
//             score.client++;
//         } else if (userRole === 'client') {
//             score.host++;
//         }
//         resetBallPosition();
//         sendData();
//     } else {
//         ball.dy = -ball.dy;
//     }
// }

//       ball.x += ball.dx;
//       ball.y += ball.dy;
//     }

function collisionRaquette() {
    // Calculer les côtés de la raquette
    let paddleTop = paddle.y;
    let paddleBottom = paddle.y + paddle.height;
    let paddleLeft = paddle.x;
    let paddleRight = paddle.x + paddle.width;

    // Calculer le point le plus proche sur la raquette à la balle
    let closestPointX = Math.max(paddleLeft, Math.min(ball.x, paddleRight));
    let closestPointY = Math.max(paddleTop, Math.min(ball.y, paddleBottom));

    // Calculer la distance entre le point le plus proche sur la raquette et le centre de la balle
    let distanceX = ball.x - closestPointX;
    let distanceY = ball.y - closestPointY;

    // Calculer la distance en utilisant le théorème de Pythagore
    let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Vérifier si la distance est inférieure au rayon de la balle (collision détectée)
    if (distance <= ball.radius) {
        // Inverser la direction verticale de la balle

        ball.dy = ball.velocity * ((ball.y - (paddle.y + paddle.width / 2)) / paddle.width);
        ball.dx = ball.velocity * ((ball.x - (paddle.x + paddle.width / 2)) / paddle.width);



        console.log("Collision détectée");
        console.log("ball.dx,", ball.dx, "ball.dy", ball.dy);
    }
    // Mettre à jour la position de la balle
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function collisionBords() {
    // Rebond sur les bords latéraux
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        console.log("rebond sur les bords latéraux");
        ball.dx = -ball.dx; // Inverse la direction horizontale
    }

    //  Rebond dans le goals
   
    if (ball.x + ball.radius >= goal.x && ball.x - ball.radius <= goal.x + goal.width && ball.y + ball.radius >= canvas.height - goal.height) {
        console.log("rebond dans le but");
        ball.dy = -ball.dy;
        resetBallPosition();
        sendData();
    }
    // Rebond sur le bas du canvas
    if (ball.y + ball.radius >= canvas.height) {
        console.log("rebond sur le bas du canvas");
        ball.dy = -ball.dy;
    }


    // Gérer la sortie par le haut du canvas
    if (ball.y - ball.radius < 5) {
        console.log("ball.y - ball.radius", ball.y - ball.radius)
        ball.visible = false;
        sendData();
        resetBallPosition();
    }

    // Mettre à jour la position de la balle si elle est visible
    if (ball.visible) {
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
}





function sendData() {
    socket.emit('updateBallPosition', {
        x: ball.x,
 
        dx: ball.dx,
        dy: -ball.dy,
        velocity: ball.velocity
    });
    socket.emit('updateScore', {
        host: score.host,
        client: score.client
    });
}




document.addEventListener("mousemove", mouseMoveHandler, false);


// Gérer le mouvement de la raquette
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    var relativeY = e.clientY - canvas.offsetTop;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
    if (relativeY > 0 && relativeY < canvas.height) {
        paddle.y = relativeY - paddle.height / 2;
    }
}

// Initialiser le canvas
window.addEventListener('resize', setupCanvas);
socket.on('role', (role) => {
    userRole = role;
    setupCanvas();
});

// Mettre à jour la position de la balle en fonction des données reçues
socket.on('updateBallPosition', (data) => {
    ball.x = data.x;
    ball.dx = data.dx;
    ball.dy = data.dy;
    ball.velocity = data.velocity;
    ball.visible = true;
});

// Mettre à jour les scores en fonction des données reçues
socket.on('updateScore', (updatedScore) => {
    score.host = updatedScore.host;
    score.client = updatedScore.client;
    drawScores();
});