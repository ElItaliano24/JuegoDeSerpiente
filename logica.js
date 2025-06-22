// ——————————————————————————————————————————————
// DECLARACIÓN DE VARIABLES GLOBALES
// ——————————————————————————————————————————————

let velocidad = 400; // milisegundos entre frames (controla la velocidad del juego)
let tamaño = 3; // longitud inicial de la serpiente (número de segmentos)
let puntaje = 0; // puntaje actual del jugador
let puntajeMaximo = parseInt(localStorage.getItem("puntajeMaximo")) || 0 // Puntaje máximo guardado en localStorage
const movil = window.innerWidth < 768; // Detectar si es móvil
let columnas = movil ? 12 : 19; // número de columnas del tablero
let filas = movil ? 22 : 19; // número de filas del tablero

let comidaX = 0, comidaY = 0; // posición de la comida en el tablero
let primeraComida = true; // controla generación especial de la primera manzana

let snakeX = [], snakeY = []; //arrays con las coordenadas de cada segmento (índice 0 = cabeza)
let posicionesPrevias = []; // Almacena las posiciones previas de la serpiente
let anchos = []; // grosores de trazo por segmento (para efecto de “cola”)

let dirX = 0, dirY = 0; // dirección de la serpiente (0 = sin movimiento, 1 = derecha, -1 = izquierda, etc.)
let bloqueoDireccion = true; // impide múltiples cambios de dirección antes de mover

let tiempoUltimoMovimiento = 0; // Tiempo del último movimiento
let intervaloMovimiento = velocidad; // intervalo dinámico de movimiento (se ajusta al comer)
let progresoAnimacion = 1; // Progreso de la animación

let juegoTerminado = false; // Bandera para indicar si el juego ha terminado

let tiempoInicioRespiracion = null; //para animación de “respiración” de la comida

let rutaSerpiente = new Path2D(); // Path2D para dibujar toda la serpiente de un tirón

// imágenes de la comida y la cabeza de la serpiente
const imagenDeManzana = new Image();
imagenDeManzana.src = "imgs/manzana.png";
const imagenCabezaDeSerpiente = new Image();
imagenCabezaDeSerpiente.src = "imgs/cabeza-serpiente.png";

// Esperar a que las imágenes se carguen antes de iniciar el juego
imagenCabezaDeSerpiente.onload = () => {
    // Genera la primera posición de comida
    generarComida();
    // Arranca el bucle animado
    requestAnimationFrame(bucleAnimacion);
};

const escalaCabezaDeSerpiente = 1.8
const orientacionCabezaDeSerpiente = -Math.PI / 2;
let anguloActualCabeza = orientacionCabezaDeSerpiente; // Ángulo actual de la cabeza de la serpiente

// Acceder al canvas y su contexto
const canvas = document.getElementById("miCanvas")
const ctx = canvas.getContext("2d")
const header = document.getElementById("pizarra")
const juegoTerminadoModal = document.getElementById("modalJuegoTerminado");
const puntajeFinal = document.getElementById("puntajeFinal");
const reiniciarJuego = document.getElementById("reiniciarJuego")

function ajustarTamañoCanvas() {
    // Obtener la altura de la ventana del navegador en pixeles
    const altoVentana = window.innerHeight
    // Obtener la altura del header
    const altoHeader = header.getBoundingClientRect().height
    // Calcular el ancho disponible para el canvas
    const unidadVW = window.innerWidth / 100; // 1vw en píxeles
    // Calcular los márgenes en píxeles
    const margenArriba = 2 * unidadVW; // 2vw en píxeles
    const margenAbajo = 2 * unidadVW; // 2vw en píxeles
    // Calcular el alto disponible para el canvas 
    const altoDisponible = altoVentana - altoHeader - margenArriba - margenAbajo;
    // Calcular un limite maximo de ancho al 95% porque 2.5% sera de margen a cada lado
    const anchoMaximoViewport = Math.floor(window.innerWidth * 0.95);

    // Si el ancho de la pantalla es menor a 768px
    if (movil) {
        // Alto máximo disponible
        let altoPx = altoDisponible
        // Calcular el ancho usando la proporción columnas/filas (12/22) para que cada casilla siga siendo un cuadrado perfecto.
        let anchoPx = Math.floor(altoPx * (12 / 22))
        // Si ese ancho proporcional sobrepasa el 95 % del viewport, lo recortamos a ese máximo y volvemos a recalcular el alto con la proporción inversa (filas/columnas).
        if (anchoPx > anchoMaximoViewport) {
            anchoPx = anchoMaximoViewport;
            altoPx = Math.floor(anchoPx * (22 / 12));
        }
        //style.width/height: controla el tamaño en la página
        canvas.style.width = anchoPx + "px"
        canvas.style.height = altoPx + "px"
        //canvas.width/height: controla la resolución interna de dibujo
        canvas.width = anchoPx
        canvas.height = altoPx
    } else {
        //En escritorio (no móvil), usamos un canvas cuadrado: tomamos el 90 % del ancho de la ventana, pero nunca más de 600 px.
        const tamBase = Math.min(window.innerWidth * 0.9, 600)
        // Igual que antes, sincronizamos CSS y buffer interno:
        canvas.style.width = tamBase + "px"
        canvas.style.height = tamBase + "px"
        canvas.width = tamBase
        canvas.height = tamBase
    }
}

function dibujarTablero() {
    // Recorrer filas
    for (let fila = 0; fila < filas; fila++) {
        // Recorrer columnas
        for (let col = 0; col < columnas; col++) {
            // Alternar color como ajedrez
            if ((fila + col) % 2 === 0) {
                // Color claro
                ctx.fillStyle = "#AEDBF0"
            } else {
                // Color oscuro
                ctx.fillStyle = "#276678"
            }
            ctx.fillRect(col * celda, fila * celda, celda, celda)
        }
    }
}

function calcularAnguloCabezaSerpiente(dirX, dirY) {
    let angulo = 0;
    if (dirX === 1) angulo = 0;           // Derecha
    if (dirX === -1) angulo = Math.PI;    // Izquierda
    if (dirY === 1) angulo = Math.PI / 2;  // Abajo
    if (dirY === -1) angulo = -Math.PI / 2;  // Arriba
    return angulo + orientacionCabezaDeSerpiente;
}





function mostrarModalJuegoTerminado() {
    puntajeFinal.textContent = puntaje
    juegoTerminadoModal.classList.remove("hidden")
}

function reiniciarEstadoJuego() {
    tamaño = 3;
    puntaje = 0;
    dirX = 0;
    dirY = 0;
    juegoTerminado = false;
    velocidad = 400;
    intervaloMovimiento = velocidad;
    progresoAnimacion = 1;
    primeraComida = true;

    colaDirecciones = []; // Reiniciar cola de direcciones
    iniciado = false; // Reiniciar bandera de inicio
    rutaSerpiente = new Path2D(); // Reiniciar ruta de la serpiente
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

    // Reiniciar posiciones de la serpiente
    snakeX = [];
    snakeY = [];
    posicionesPrevias = [];
    const centroX = Math.floor(columnas / 2);
    const centroY = Math.floor(filas / 2);
    snakeX[0] = centroX - 3;
    snakeY[0] = centroY;
    for (let i = 1; i < tamaño; i++) {
        snakeX[i] = snakeX[0] - i;
        snakeY[i] = snakeY[0];
    }
    for (let i = 0; i < tamaño; i++) {
        posicionesPrevias[i] = { x: snakeX[i], y: snakeY[i] }
    }
    recalcularAnchos();
    construirRutaSerpiente();
    generarComida();

    document.getElementById("puntaje").textContent = puntaje;
    juegoTerminadoModal.classList.add("hidden");

    tiempoUltimoMovimiento = 0;
    tiempoInicioRespiracion = null;
    progresoAnimacion = 1;
    anguloActualCabeza = orientacionCabezaDeSerpiente;
    colaDirecciones = [];

    requestAnimationFrame(bucleAnimacion);
}   

reiniciarJuego.addEventListener("click", reiniciarEstadoJuego);



ajustarTamañoCanvas()
window.addEventListener("resize", () => {
    window.location.reload();
});



// Posición inicial de la serpiente al centro del tablero
const centroX = Math.floor(columnas / 2);
const centroY = Math.floor(filas / 2);
snakeX[0] = centroX - 3;
snakeY[0] = centroY;

// Añadimos los dos segmentos “detrás” de la cabeza, extendidos hacia la izquierda
for (let i = 1; i < tamaño; i++) {
    snakeX[i] = snakeX[0] - i;        // columna a la izquierda de la cabeza
    snakeY[i] = snakeY[0];
}

for (let i = 0; i < tamaño; i++) {
    posicionesPrevias[i] = { x: snakeX[i], y: snakeY[i] }
}

// Tamaño de cada celda
const celda = canvas.width / columnas
recalcularAnchos()
construirRutaSerpiente()


// Mostrar el puntaje maximo en el HTML
const conteoPuntajeMaximo = document.getElementById("record")
conteoPuntajeMaximo.textContent = puntajeMaximo




function dibujarCuerpoDeSerpiente(prog) {
    ctx.strokeStyle = "#A0C432";
    ctx.lineCap = "round";

    // 1) REPOSO: dibujar todos los segmentos enteros
    if (dirX === 0 && dirY === 0) {
        for (let i = 1; i < tamaño; i++) {
            const a = posicionesPrevias[i - 1];
            const b = posicionesPrevias[i];
            const x0 = a.x * celda + celda / 2;
            const y0 = a.y * celda + celda / 2;
            const x1 = b.x * celda + celda / 2;
            const y1 = b.y * celda + celda / 2;

            ctx.lineWidth = anchos[i];
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }
        return;
    }

    // 2) MOVIMIENTO: tu interpolación normal
    if (prog === 1) {
        // cuando termine la interpolación, dibuja toda la ruta con ancho de la cabeza
        ctx.lineWidth = anchos[0];
        ctx.stroke(rutaSerpiente);
        return;
    }

    // fases intermedias: cada segmento entre su previa y su actual
    ctx.lineCap = "round";
    for (let i = 1; i < tamaño; i++) {
        const prev = posicionesPrevias[i - 1];
        const curr = { x: snakeX[i - 1], y: snakeY[i - 1] };
        const nextPrev = posicionesPrevias[i];
        const nextCurr = { x: snakeX[i], y: snakeY[i] };

        const x0 = (prev.x + (curr.x - prev.x) * prog) * celda + celda / 2;
        const y0 = (prev.y + (curr.y - prev.y) * prog) * celda + celda / 2;
        const x1 = (nextPrev.x + (nextCurr.x - nextPrev.x) * prog) * celda + celda / 2;
        const y1 = (nextPrev.y + (nextCurr.y - nextPrev.y) * prog) * celda + celda / 2;

        ctx.lineWidth = anchos[i];
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }
}



function recalcularAnchos() {
    anchos = [];
    const maxAncho = celda * 0.9;
    const minAncho = celda * 0.5;
    if (tamaño === 1) {
        anchos[0] = maxAncho;
        return;
    }
    for (let i = 0; i < tamaño; i++) {
        const t = i / (tamaño - 1);
        const t2 = t * t;
        anchos[i] = maxAncho * (1 - t2) + minAncho * t2;
    }
}

function construirRutaSerpiente() {
    rutaSerpiente = new Path2D();
    for (let i = 0; i < tamaño; i++) {
        const centroX = snakeX[i] * celda + celda / 2;
        const centroY = snakeY[i] * celda + celda / 2;
        if (i === 0) {
            rutaSerpiente.moveTo(centroX, centroY);
        } else {
            rutaSerpiente.lineTo(centroX, centroY);
        }
    }
}

dibujarTablero()



function dibujarSerpiente(prog) {

    dibujarCuerpoDeSerpiente(prog)

    const anguloObjetivoCabeza = calcularAnguloCabezaSerpiente(dirX, dirY);

    const factorInterpolacion = 0.2

    let diferenciaAngulo = anguloObjetivoCabeza - anguloActualCabeza;

    if (diferenciaAngulo > Math.PI) {
        diferenciaAngulo -= 2 * Math.PI; // Ajustar para el rango [-π, π]
    } else if (diferenciaAngulo < -Math.PI) {
        diferenciaAngulo += 2 * Math.PI; // Ajustar para el rango [-π, π]
    }

    anguloActualCabeza += diferenciaAngulo * factorInterpolacion;

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
            ctx.rotate(anguloActualCabeza)
            ctx.drawImage(imagenCabezaDeSerpiente, -wH / 2, -hH / 2, wH, hH);
            ctx.restore()
        }
    }
}


function generarComida() {

    // Primera comida, se coloca a la derecha a 3 bloques de la cabeza
    if (primeraComida) {
        comidaX = snakeX[0] + 6;
        comidaY = snakeY[0];
        primeraComida = false;
        return
    }

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



let colaDirecciones = []; // <-- ¡Asegúrate de que esto está declarado!
// Mover y redibujar la serpiente
function actualizarPosicionSerpiente() {
    // Procesar la cola de direcciones antes de mover
    if (colaDirecciones.length > 0) {
        const direccion = colaDirecciones.shift();
        switch (direccion) {
            case "up":
                if (dirY !== 1 || (dirX === 0 && dirY === 0)) {
                    dirX = 0;
                    dirY = -1;
                }
                break;
            case "down":
                if (dirY !== -1 || (dirX === 0 && dirY === 0)) {
                    dirX = 0;
                    dirY = 1;
                }
                break;
            case "left":
                if (dirX !== 1 || (dirX === 0 && dirY === 0)) {
                    dirX = -1;
                    dirY = 0;
                }
                break;
            case "right":
                if (dirX !== -1 || (dirX === 0 && dirY === 0)) {
                    dirX = 1;
                    dirY = 0;
                }
                break;
        }
    }

    if (dirX === 0 && dirY === 0) return;

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
        posicionesPrevias.push(colaAnterior)
        recalcularAnchos()
        construirRutaSerpiente()    // La serpiente crece
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
        mostrarModalJuegoTerminado()
        return; // Evita que siga ejecutando el resto
    }

    // ¿Se muerde la cola?
    for (let i = 1; i < tamaño; i++) {
        if (snakeX[0] === snakeX[i] && snakeY[0] === snakeY[i]) {
            juegoTerminado = true; // Cambia el estado del juego
            actualizarPuntajeMaximo()
            mostrarModalJuegoTerminado()
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
    // Permite hasta 2 direcciones en la cola para mayor fluidez
    if (colaDirecciones.length < 2) colaDirecciones.push(direccion);
}

document.addEventListener("keydown", event => {
    const mapa = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        a: "left",
        s: "down",
        d: "right",
        W: "up",
        A: "left",
        S: "down",
        D: "right"
    };
    const dir = mapa[event.key];
    if (dir) mover(dir);
});

function actualizarLogicaJuego() {
    actualizarPosicionSerpiente();
}

function renderizarJuego(progresoAnimacion, escalaComida) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarTablero();
    dibujarComida(escalaComida);
    dibujarSerpiente(progresoAnimacion);
}

function bucleAnimacion(timestamp) {
    if (juegoTerminado) return; // Si el juego ha terminado, no continuar

    if (!tiempoUltimoMovimiento) tiempoUltimoMovimiento = timestamp;
    if (!tiempoInicioRespiracion) tiempoInicioRespiracion = timestamp;

    const ciclo = (timestamp - tiempoInicioRespiracion) / 1000;
    const escala = 1 + 0.1 * Math.sin(ciclo * Math.PI * 2);

    const delta = timestamp - tiempoUltimoMovimiento;
    progresoAnimacion = Math.min(delta / intervaloMovimiento, 1);

    renderizarJuego(progresoAnimacion, escala);

    if (delta >= intervaloMovimiento) {
        // 1) guardo estado “previo”
        for (let i = 0; i < tamaño; i++) {
            posicionesPrevias[i] = { x: snakeX[i], y: snakeY[i] };
        }
        // 2) muevo la lógica de la serpiente
        actualizarLogicaJuego();
        // 3) reinicio el tiempo
        tiempoUltimoMovimiento = timestamp;

        bloqueoDireccion = true;
    }
    requestAnimationFrame(bucleAnimacion);
}

let toqueX = 0
let toqueY = 0
const umbralSwipe = 30; // Umbral para detectar swipe

canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return; // Asegurarse de que solo hay un toque
    e.preventDefault();
    const t = e.touches[0];
    toqueX = t.clientX;
    toqueY = t.clientY;
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    if (!e.changedTouches || e.changedTouches.length !== 1) return; // Asegurarse de que solo hay un toque
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - toqueX;
    const dy = t.clientY - toqueY;

    if (Math.abs(dx) < umbralSwipe && Math.abs(dy) < umbralSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Movimiento horizontal
        if (dx > 0) mover("right");
        else mover("left");
    } else {
        // Movimiento vertical
        if (dy > 0) mover("down");
        else mover("up");
    }
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Evitar el scroll de la página   
}, { passive: false });