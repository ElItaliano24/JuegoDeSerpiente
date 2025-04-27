// Declaración de variables
let columnas = 19
let filas = 19
let velocidad = 400 // milisegundos entre frames
let tamaño = 1 // tamaño de la serpiente
let puntaje = 0
let comidaX = 0
let comidaY = 0

// Arreglos para la serpiente
let snakeX = []
let snakeY = []

// Posición inicial de la serpiente al centro del tablero
snakeX[0] = Math.floor(columnas / 2);
snakeY[0] = Math.floor(filas / 2);

// Acceder al canvas y su contexto
const canvas = document.getElementById("miCanvas")
const ctx = canvas.getContext("2d")

// Tamaño de cada celda
const celda = canvas.width / columnas

// Leer el puntaje maximo inicial
let puntajeMaximo = parseInt(localStorage.getItem("puntajeMaximo")) || 0
// Mostrar el puntaje maximo en el HTML
const conteoPuntajeMaximo = document.getElementById("record")
conteoPuntajeMaximo.textContent = puntajeMaximo
// Dibujar el tablero tipo ajedrez
function dibujarTablero() {
    for (let fila = 0; fila < filas; fila++) {
        for (let col = 0; col < columnas; col++) {
            // Alternar color como ajedrez
            if ((fila + col) % 2 === 0) {
                ctx.fillStyle = "#A9D752"
            } else {
                ctx.fillStyle = "#A3D14A"
            }
            ctx.fillRect(col * celda, fila * celda, celda, celda)
        }
    }
}

dibujarTablero()

function dibujarSerpiente() {
    ctx.fillStyle = "#007F00"
    for (let i = 0; i < tamaño; i++) {
        ctx.fillRect(snakeX[i] * celda, snakeY[i] * celda, celda, celda);
    }
}

dibujarSerpiente()
generarComida();
dibujarComida();

function generarComida() {
    comidaX = Math.floor(Math.random() * columnas);
    comidaY = Math.floor(Math.random() * filas);
}

function dibujarComida() {
    ctx.fillStyle = "#FF0000"; // Rojo
    ctx.fillRect(comidaX * celda, comidaY * celda, celda, celda);
}

// Inicializar dirección hacia arriba 
let dirX = 0;
let dirY = 0;

// Mover y redibujar la serpiente
function actualizarPosicionSerpiente() {

    // Mover el cuerpo
    for (let i = tamaño - 1; i > 0; i--) {
        snakeX[i] = snakeX[i - 1];
        snakeY[i] = snakeY[i - 1];
    }

    // Mover la cabeza
    snakeX[0] += dirX;
    snakeY[0] += dirY;

    const conteoPuntaje = document.getElementById("puntaje");

    // ¿La serpiente se come la comida?
    if (snakeX[0] === comidaX && snakeY[0] === comidaY) {
        tamaño++;       // La serpiente crece
        puntaje++;      // Aumenta el puntaje
        //Ajustar velocidad
        velocidad = Math.max(100, 400 - puntaje * 20)
        // Reiniciar el intervalo con la nueva velocidad
        clearInterval(intervalo);
        intervalo = setInterval(actualizarPosicionSerpiente, velocidad);
        conteoPuntaje.textContent = puntaje
        actualizarPuntajeMaximo()
        generarComida(); // Nueva comida
    }

    // Verificar si se sale del tablero
    if (
        snakeX[0] < 0 || snakeX[0] >= columnas ||
        snakeY[0] < 0 || snakeY[0] >= filas
    ) {
        clearInterval(intervalo); // 💥 Detener el movimiento
        alert("💀 ¡Perdiste! La serpiente se salió del tablero.");
        location.reload(); // Reinicia el juego
        return; // Evita que siga ejecutando el resto
    }

    // ¿Se muerde la cola?
    for (let i = 1; i < tamaño; i++) {
        if (snakeX[0] === snakeX[i] && snakeY[0] === snakeY[i]) {
            clearInterval(intervalo);
            actualizarPuntajeMaximo()
            alert("💥 ¡Te mordiste a ti mismo! Game over.");
            location.reload();
            return;
        }
    }


    // Redibujar tablero y serpiente
    dibujarTablero();
    dibujarSerpiente();
    dibujarComida();
}

function actualizarPuntajeMaximo() {
    if (puntaje > puntajeMaximo) {
        puntajeMaximo = puntaje;
        localStorage.setItem("puntajeMaximo", puntajeMaximo);
        conteoPuntajeMaximo.textContent = puntajeMaximo; // Actualiza el HTML
    }
}

let intervalo = null; // aún no comienza el juego
let iniciado = false; // bandera para detectar primer movimiento

// Controles de flechas
document.addEventListener("keydown", function (event) {
    // Iniciar el movimiento con la primera tecla
    if (!iniciado) {
        intervalo = setInterval(actualizarPosicionSerpiente, velocidad);
        iniciado = true;
    }

    switch (event.key) {
        case "ArrowUp":
            if (dirY !== 1) {
                dirX = 0;
                dirY = -1;
            }
            break;
        case "ArrowDown":
            if (dirY !== -1) {
                dirX = 0;
                dirY = 1;
            }
            break;
        case "ArrowLeft":
            if (dirX !== 1) {
                dirX = -1;
                dirY = 0;
            }
            break;
        case "ArrowRight":
            if (dirX !== -1) {
                dirX = 1;
                dirY = 0;
            }
            break;
    }
});