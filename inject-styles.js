drawMycelium();

function drawMycelium() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.fillStyle = "red";
    context.fillRect(0, 0, 800, 600);

    canvas.className = "mycelium-canvas";

    document.body.appendChild(canvas);
}
