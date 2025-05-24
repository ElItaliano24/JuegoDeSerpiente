// Declaración de variables
let columnas = 19
let filas = 19
let velocidad = 400 // milisegundos entre frames
let tamaño = 1 // tamaño de la serpiente
let puntaje = 0
let comidaX = 0
let comidaY = 0
let tiempoUltimoMovimiento = 0 // Tiempo del último movimiento
let intervaloMovimiento = velocidad // Intervalo de movimiento
let progresoAnimacion = 1 // Progreso de la animación
let posicionesPrevias = [] // Almacena las posiciones previas de la serpiente
let juegoTerminado = false // Bandera para indicar si el juego ha terminado
// Arreglos para la serpiente
let snakeX = []
let snakeY = []
let tiempoInicioRespiracion = null

const imagenDeManzana = new Image();
imagenDeManzana.src = "imgs/manzana.png";

// Posición inicial de la serpiente al centro del tablero
snakeX[0] = Math.floor(columnas / 2);
snakeY[0] = Math.floor(filas / 2);

for (let i = 0; i < tamaño; i++) {
    posicionesPrevias[i] = { x: snakeX[i], y: snakeY[i] }
}

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

function generarComida() {
    comidaX = Math.floor(Math.random() * columnas);
    comidaY = Math.floor(Math.random() * filas);
}

function dibujarComida(escala) {
    const w = celda * escala
    const h = celda * escala

    const x = comidaX * celda + (celda - w) / 2
    const y = comidaY * celda + (celda - h) / 2

    if(!imagenDeManzana.complete) {
        ctx.fillStyle = "#FF0000"; // Rojo
        ctx.fillRect(comidaX * celda, comidaY * celda, celda, celda);
        return
    }

    ctx.drawImage(imagenDeManzana, x, y, w, h);    
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

        let colaAnterior = {
            x: snakeX[tamaño - 1],
            y: snakeY[tamaño - 1]
        }
        tamaño++;
        posicionesPrevias.push(colaAnterior)     // La serpiente crece
        puntaje++;      // Aumenta el puntaje
        //Ajustar velocidad
        velocidad = Math.max(100, 400 - puntaje * 20)
        // Reiniciar el intervalo con la nueva velocidad
        intervaloMovimiento = velocidad
        conteoPuntaje.textContent = puntaje
        actualizarPuntajeMaximo()
        generarComida(); // Nueva comida
    }

    // Verificar si se sale del tablero
    if (
        snakeX[0] < 0 || snakeX[0] >= columnas ||
        snakeY[0] < 0 || snakeY[0] >= filas
    ) {
        juegoTerminado = true; // Cambia el estado del juego
        alert("💀 ¡Perdiste! La serpiente se salió del tablero.");
        location.reload(); // Reinicia el juego
        return; // Evita que siga ejecutando el resto
    }

    // ¿Se muerde la cola?
    for (let i = 1; i < tamaño; i++) {
        if (snakeX[0] === snakeX[i] && snakeY[0] === snakeY[i]) {
            juegoTerminado = true; // Cambia el estado del juego
            actualizarPuntajeMaximo()
            alert("💥 ¡Te mordiste a ti mismo! Game over.");
            location.reload();
            return;
        }
    }
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

function mover(direccion) {
    console.log("mover→", direccion);

    if (!iniciado) {
        iniciado = true;
        requestAnimationFrame(bucleAnimacion); // Inicia la animación
    }
    switch (direccion) {
        case "up":
            if (dirY !== 1) {
                dirX = 0;
                dirY = -1;
            }
            break;
        case "down":
            if (dirY !== -1) {
                dirX = 0;
                dirY = 1;
            }
            break;
        case "left":
            if (dirX !== 1) {
                dirX = -1;
                dirY = 0;
            }
            break;
        case "right":
            if (dirX !== -1) {
                dirX = 1;
                dirY = 0;
            }
            break;
    }

}

document.addEventListener("keydown", event => {
    const mapa = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
    };
    if (mapa[event.key]) mover(mapa[event.key]);
});

document.querySelectorAll('#controles-tactiles button').forEach(btn => {
    btn.addEventListener('click', () => {
        mover(btn.dataset.dir);
    });
});

function bucleAnimacion(timestamp) {
    if(juegoTerminado) return; // Si el juego ha terminado, no continuar

    if (!tiempoUltimoMovimiento) tiempoUltimoMovimiento = timestamp;
    if (!tiempoInicioRespiracion) tiempoInicioRespiracion = timestamp;

    const ciclo = (timestamp - tiempoInicioRespiracion) / 1000;
    const escala = 1 + 0.1 * Math.sin(ciclo * Math.PI * 2);

    const delta = timestamp - tiempoUltimoMovimiento;
    progresoAnimacion = Math.min(delta / intervaloMovimiento, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarTablero();
    dibujarComida(escala);

    ctx.fillStyle = "#007F00";
    for (let i = 0; i < tamaño; i++) {
        const prev = posicionesPrevias[i];
        const curr = { x: snakeX[i], y: snakeY[i] };
        const xInt = prev.x + (curr.x - prev.x) * progresoAnimacion;
        const yInt = prev.y + (curr.y - prev.y) * progresoAnimacion;
        ctx.fillRect(xInt * celda, yInt * celda, celda, celda);
    }

    if (delta >= intervaloMovimiento) {
        // 1) guardo estado “previo”
        for (let i = 0; i < tamaño; i++) {
            posicionesPrevias[i] = { x: snakeX[i], y: snakeY[i] };
        }
        // 2) muevo la lógica de la serpiente
        actualizarPosicionSerpiente();
        // 3) reinicio el tiempo
        tiempoUltimoMovimiento = timestamp;
    }
    requestAnimationFrame(bucleAnimacion);
} 
