// Canvas.js
const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

function drawBall() {
    if (!ball.visible) {
        console.log("Tentative de dessin de la balle alors qu'elle devrait être invisible.");
        return;
    }
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
    goal.x = canvas.width / 2 - goal.width / 2,
        goal.y = canvas.height - goal.height,
        ctx.beginPath();
    ctx.rect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.closePath();

}

function drawScores(userRole) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`Hôte: ${score.host}`, 10, 75); // Positionner le score de l'hôte en haut à gauche
    ctx.fillText(`Vous etes ${userRole}`, canvas.width / 2 - 100,
        75); // Positionner le score du client en haut à droite
    ctx.fillText(`Client: ${score.client}`, canvas.width - 140,
        75); // Positionner le score du client en haut à droite
}
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight + decalageY;
    // Initialise ou réinitialise la position de la balle au centre après le redimensionnement
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    animateSetup();
}

function animateSetup() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawGoals();
    if (typeof userRole !== 'undefined') {
        drawScores(userRole);
    }
    collisionRaquette();
    collisionBords();
    requestAnimationFrame(animateSetup);
}
