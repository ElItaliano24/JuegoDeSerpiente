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
let bloqueoDireccion = true
// Arreglos para la serpiente
let snakeX = []
let snakeY = []
let tiempoInicioRespiracion = null

const imagenDeManzana = new Image();
imagenDeManzana.src = "imgs/manzana.png";

const imagenCabezaDeSerpiente = new Image();
imagenCabezaDeSerpiente.src = "imgs/cabeza-serpiente.png";

imagenCabezaDeSerpiente.onload = () => {
    // Genera la primera posición de comida
    generarComida();
    // Arranca el bucle animado
    requestAnimationFrame(bucleAnimacion);
};

const escalaCabezaDeSerpiente = 1.8
const orientacionCabezaDeSerpiente = -Math.PI / 2;

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
    // Recorrer filas
    for (let fila = 0; fila < filas; fila++) {
        // Recorrer columnas
        for (let col = 0; col < columnas; col++) {
            // Alternar color como ajedrez
            if ((fila + col) % 2 === 0) {
                // Color claro
                ctx.fillStyle = "#A9D752"
            } else {
                // Color oscuro
                ctx.fillStyle = "#A3D14A"
            }
            ctx.fillRect(col * celda, fila * celda, celda, celda)
        }
    }
}
function dibujarCuerpoDeSerpiente(prog) {
    ctx.strokeStyle = "#A0C432";
    ctx.lineWidth = celda * 0.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < tamaño; i++) {
        const prev = posicionesPrevias[i];
        const curr = { x: snakeX[i], y: snakeY[i] };
        const x = (prev.x + (curr.x - prev.x) * prog) * celda + celda / 2;
        const y = (prev.y + (curr.y - prev.y) * prog) * celda + celda / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

dibujarTablero()

function calcularAnguloCabezaSerpiente(dirX, dirY) {
    let ang = 0;
    if (dirX === 1) ang = 0;           // Derecha
    if (dirX === -1) ang = Math.PI;    // Izquierda
    if (dirY === 1) ang = Math.PI / 2;  // Abajo
    if (dirY === -1) ang = -Math.PI / 2;  // Arriba
    return ang + orientacionCabezaDeSerpiente;
}

function dibujarSerpiente(prog) {

    dibujarCuerpoDeSerpiente(prog)

    for (let i = 0; i < tamaño; i++) {
        const prev = posicionesPrevias[i]
        const curr = { x: snakeX[i], y: snakeY[i] }
        const xInt = (prev.x + (curr.x - prev.x) * prog) * celda
        const yInt = (prev.y + (curr.y - prev.y) * prog) * celda

        if (i === 0 && imagenCabezaDeSerpiente.complete) {
            // dimesiones de la cabeza
            const wH = celda * escalaCabezaDeSerpiente
            const hH = celda * escalaCabezaDeSerpiente
            // centra sobre la casilla
            const offset = (celda - wH) / 2

            const x0 = xInt + offset
            const y0 = yInt + offset
            const cx = x0 + wH / 2
            const cy = y0 + hH / 2

            ctx.save()
            ctx.translate(cx, cy)
            const ang = calcularAnguloCabezaSerpiente(dirX, dirY)
            ctx.rotate(ang)
            ctx.drawImage(imagenCabezaDeSerpiente, -wH / 2, -hH / 2, wH, hH);
            ctx.restore()
        }
    }
}


function generarComida() {
    let col, fil, cuerpoSerpiente;
    do {
        col = Math.floor(Math.random() * columnas);
        fil = Math.floor(Math.random() * filas);
        cuerpoSerpiente = false;

        for (let i = 0; i < tamaño; i++) {
            if (snakeX[i] === col && snakeY[i] === fil) {
                cuerpoSerpiente = true; // La comida está en el cuerpo de la serpiente
                break;
            }
        }
    } while (cuerpoSerpiente)

    comidaX = col;
    comidaY = fil;
}

function dibujarComida(escala) {
    const w = celda * escala
    const h = celda * escala

    const x = comidaX * celda + (celda - w) / 2
    const y = comidaY * celda + (celda - h) / 2

    if (!imagenDeManzana.complete) {
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

    bloqueoDireccion = true; // Permite un nuevo movimiento

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

    if (!iniciado) {
        iniciado = true;
        requestAnimationFrame(bucleAnimacion); // Inicia la animación
    }

    if (!bloqueoDireccion) return; // Si ya se está moviendo, no hacer nada
    bloqueoDireccion = false; // Bloquea la dirección para evitar múltiples movimientos
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
    if (juegoTerminado) return; // Si el juego ha terminado, no continuar

    if (!tiempoUltimoMovimiento) tiempoUltimoMovimiento = timestamp;
    if (!tiempoInicioRespiracion) tiempoInicioRespiracion = timestamp;

    const ciclo = (timestamp - tiempoInicioRespiracion) / 1000;
    const escala = 1 + 0.1 * Math.sin(ciclo * Math.PI * 2);

    const delta = timestamp - tiempoUltimoMovimiento;
    progresoAnimacion = Math.min(delta / intervaloMovimiento, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarTablero();
    dibujarComida(escala);

    dibujarSerpiente(progresoAnimacion);

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


let toqueX = 0
let toqueY = 0
const umbralSwipe = 30; // Umbral para detectar swipe


canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return; // Asegurarse de que solo hay un toque{
    const t = e.touches[0];
    toqueX = t.clientX;
    toqueY = t.clientY;
}, { passive: true });

canvas.addEventListener("touchend", (e) => {
    if (!e.changedTouches || e.changedTouches.length !== 1) return; // Asegurarse de que solo hay un toque
    const t = e.changedTouches[0];
    const dx = t.clientX - toqueX;
    const dy = t.clientY - toqueY;

    if (Math.abs(dx) < umbralSwipe && Math.abs(dy) < umbralSwipe) return

    if (Math.abs(dx) > Math.abs(dy)) {
        // Movimiento horizontal
        if (dx > 0) mover("right");
        else mover("left");
    } else {
        // Movimiento vertical
        if (dy > 0) mover("down");
        else mover("up");
    }
}, { passive: true });