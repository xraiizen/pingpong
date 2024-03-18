// Game.js
let decalageY = 15;
let ball = {
    radius: 10,
    x: null,
    y: null,
    dx: 0,
    dy: 0,
    visible: true,
    velocity: 1
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
    width: 400,
    height: 10
};
let score = {
    host: 0,
    client: 0
};
function handleUpdateBallPosition(data) {
    ball.x = data.x;
    ball.dx = data.dx;
    ball.dy = data.dy;
    ball.velocity = data.velocity;
    ball.visible = data.visible;
}

function handleUpdateScore(updatedScore) {
    score.host = updatedScore.host;
    score.client = updatedScore.client;
    
    drawScores(userRole);
}
function UpdateBallToOtherScreen() {
    ball.x = canvas.width / 2; // Centrer la balle sur l'axe des x
    ball.y = ball.radius + 5; // Placer la balle un peu en dessous du haut du canvas pour éviter qu'elle ne soit immédiatement considérée comme sortie
    ball.dx = 0; // Réinitialiser le déplacement horizontal
    ball.dy = 0; // Réinitialiser le déplacement vertical
    ball.velocity = 1; // Réinitialiser la vitesse de la balle
    ball.visible = false; // Rendre la balle visible
}
function handleGoal() {
    if (userRole === 'hôte') {
        score.client++;
    } else if (userRole === 'client') {
        score.host++;
    }
    resetBallPosition(); // Réinitialiser la position de la balle
    ball.visible = false; // Rendre la balle invisible sur l'écran du joueur qui a marqué
    sendDataScore(); // Envoyer le score mis à jour
    sendDataBall(false); // Envoyer la position de la balle avec 'visible' à false
}

function resetBallPosition() {
    ball.x = canvas.width / 2 - (ball.radius / 2);
    ball.y = canvas.height / 2 - (ball.radius / 2);
    ball.dx = 0;
    ball.dy = 0;
    ball.velocity = 1;
}

function collisionRaquette() {
    // Vérifier si la balle est au niveau de la raquette
    if (ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height) {
        if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
            // Inverser la direction verticale de la balle
            ball.dy = -ball.dy;
            ball.dx = 3*ball.velocity * ((ball.x - (paddle.x + paddle.width / 2)) / paddle.width);

            // Ajuster le dy en fonction de l'endroit où la balle touche la raquette horizontalement
            let touchPointX = (ball.y - (paddle.y + paddle.width / 2)) / (paddle.width / 2);
            // Ici, vous pourriez vouloir ajuster la vitesse verticale dy basée sur touchPointX si c'était votre intention originale
            // Par exemple, si vous souhaitez que le contact au centre de la raquette envoie la balle verticalement vers le haut avec plus de force
            ball.dy -= touchPointX * ball.velocity +2; // Cela réduira ou augmentera dy basé sur où la balle touche la raquette

            // Assurez-vous que la balle ne "traverse" pas la raquette en ajustant sa position y
            ball.y = paddle.y - ball.radius;
        }
    }
    // Mise à jour de la position de la balle
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
        handleGoal();
    }
    // Rebond sur le bas du canvas
    if (ball.y + ball.radius >= canvas.height) {
        console.log("rebond sur le bas du canvas");
        ball.dy = -ball.dy;
    }


    // Gérer la sortie par le haut du canvas
    if (ball.y - ball.radius < 5) {
        console.log("ball.y - ball.radius", ball.y - ball.radius)
        sendDataBall();
        UpdateBallToOtherScreen();
    }

    // Mettre à jour la position de la balle si elle est visible
    if (ball.visible) {
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
}

// Initialisez le jeu
setupCanvas();
animateSetup();
