// Events.js
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
