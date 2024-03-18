// Client.js
const socket = io("http://127.0.0.1:3000/");
let userRole = '';

socket.on('role', (role) => {
    userRole = role;
    ball.visible = role === 'hôte';
    setupCanvas();
});
socket.emit('demanderListeSalons');


socket.on('updateBallPosition', handleUpdateBallPosition);
socket.on('updateScore', handleUpdateScore);

function sendDataBall(isVisible) {
    socket.emit('updateBallPosition', {
        x: ball.x,
        dx: ball.dx,
        dy: -ball.dy,
        velocity: ball.velocity,
        visible: typeof isVisible === 'undefined' ? true : isVisible
    });
}

function sendDataScore() {
    socket.emit('updateScore', {
        host: score.host,
        client: score.client
    });
    ball.visible = true;
}

  