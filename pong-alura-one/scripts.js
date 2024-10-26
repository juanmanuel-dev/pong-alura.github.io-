let bola;
let raquetaIzquierda;
let raquetaDerecha;
let puntajeIzquierdo = 0;
let puntajeDerecho = 0;
let juegoIniciado = false;
let velocidadIncremento = 0.5; // Incremento de velocidad por anotación
const MARGEN_RAQUETA = 5; // Margen de separación de las raquetas
let juegoPausado = false; // Variable para controlar el estado del juego
let tiempoUltimoIncremento = 0; // Variable para almacenar el tiempo del último incremento
let fondo; // Variable para la imagen de fondo
let bounceSound; // Variable para almacenar el sonido de rebote
let anotacionSound; // Variable para almacenar el sonido de anotación
let winSound; // Variable para almacenar el sonido de victoria
let loseSound; // Variable para almacenar el sonido de pérdida

function preload() {
    fondo = loadImage('/Sprites/fondo1.png'); // Cargar la imagen de fondo
    bounceSound = loadSound('/Sprites/bounce.wav'); // Cargar el sonido de rebote
    anotacionSound = loadSound('/Sprites/anotacion.wav'); // Cargar el sonido de anotación
    winSound = loadSound('/Sprites/win.wav'); // Cargar el sonido de victoria
    loseSound = loadSound('/Sprites/lose.wav'); // Cargar el sonido de pérdida
}

function setup() {
    createCanvas(800, 400).parent('game-container');
    bola = new Bola();
    raquetaIzquierda = new Raqueta(true);
    raquetaDerecha = new Raqueta(false);
    noLoop(); // Detener el bucle de dibujo hasta que se inicie el juego
}

function draw() {
    background(fondo); // Usar la imagen de fondo
    bola.update();
    bola.show();
    bola.checkRaqueta(raquetaIzquierda);
    bola.checkRaqueta(raquetaDerecha);
    
    raquetaIzquierda.show();
    raquetaDerecha.show();
    
    mostrarPuntaje();

    // Lógica para que la raqueta de la máquina siga la pelota
    raquetaDerecha.follow(bola);
    
    // Verificar si hay un ganador
    if (puntajeIzquierdo >= 10 || puntajeDerecho >= 10) {
        noLoop(); // Detener el juego
        setTimeout(() => {
            textSize(64);
            fill(255);
            textAlign(CENTER);
            if (puntajeIzquierdo >= 10) {
                winSound.play(); // Reproducir sonido de victoria
                text("¡Ganaste!", width / 2, height / 2);
            } else {
                loseSound.play(); // Reproducir sonido de pérdida
                text("¡Perdiste!", width / 2, height / 2);
            }
        }, 1000); // Retrasar 1 segundo (1000 milisegundos)
        return; // Salir de la función draw
    }
    
    // Incrementar la velocidad gradualmente cada 5 segundos
    if (millis() - tiempoUltimoIncremento > 5000) { // 5000 milisegundos = 5 segundos
        bola.incrementarVelocidad(); // Llamar a la función para incrementar la velocidad
        tiempoUltimoIncremento = millis(); // Actualizar el tiempo del último incremento
    }
}

function mostrarPuntaje() {
    textSize(32);
    fill(255);
    text(puntajeIzquierdo, 50, 50);
    text(puntajeDerecho, width - 100, 50);
}

function keyPressed() {
    if (key === 'w') {
        raquetaIzquierda.move(-10); // Mover raqueta izquierda hacia arriba
    } else if (key === 's') {
        raquetaIzquierda.move(10); // Mover raqueta izquierda hacia abajo
    } else if (key === 'ArrowUp') { // Mover raqueta derecha hacia arriba
        raquetaIzquierda.move(-10);
    } else if (key === 'ArrowDown') { // Mover raqueta derecha hacia abajo
        raquetaIzquierda.move(10);
    }
}

function keyReleased() {
    if (key === 'w' || key === 's') {
        raquetaIzquierda.move(0); // Detener movimiento
    } else if (key === 'ArrowUp' || key === 'ArrowDown') { // Detener movimiento de la raqueta derecha
        raquetaIzquierda.move(0);
    }
}

class Bola {
    constructor() {
        this.reset();
        this.imagen = loadImage('/Sprites/bola.png'); // Cargar la imagen de la bola
        this.cuentaRegresiva = 3; // Tiempo de cuenta regresiva
        this.tiempoUltimoPunto = 0; // Tiempo del último punto anotado
        this.mostrandoCuentaRegresiva = false; // Estado de la cuenta regresiva
        this.rotacion = 0; // Inicializar la rotación
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.xSpeed = random(5, 7) * (random() < 0.5 ? 1 : -1);
        this.ySpeed = random(5, 7) * (random() < 0.5 ? 1 : -1);
        this.mostrandoCuentaRegresiva = false; // Reiniciar el estado de la cuenta regresiva
    }

    update() {
        if (this.mostrandoCuentaRegresiva) {
            // Lógica para mostrar la cuenta regresiva
            if (millis() - this.tiempoUltimoPunto > 1000) { // Cada segundo
                this.cuentaRegresiva--; // Disminuir la cuenta regresiva
                this.tiempoUltimoPunto = millis(); // Actualizar el tiempo
            }
            if (this.cuentaRegresiva <= 0) {
                this.mostrandoCuentaRegresiva = false; // Terminar la cuenta regresiva
                this.reset(); // Reiniciar la bola
            }
            return; // Salir de la función update si se está mostrando la cuenta regresiva
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        // Calcular la rotación basada en la velocidad
        this.rotacion += (abs(this.xSpeed) + abs(this.ySpeed)) * 0.1; // Ajusta el factor de multiplicación según sea necesario

        if (this.y < 0 || this.y > height) {
            this.ySpeed *= -1; // Rebote en los bordes superior e inferior
            bounceSound.play(); // Reproducir sonido de rebote
        }

        if (this.x < 0) {
            puntajeDerecho++; // Punto para la máquina
            anotacionSound.play(); // Reproducir sonido de anotación
            this.mostrandoCuentaRegresiva = true; // Iniciar cuenta regresiva
            this.cuentaRegresiva = 1; // Reiniciar cuenta regresiva
            this.tiempoUltimoPunto = millis(); // Guardar tiempo del último punto
        } else if (this.x > width) {
            puntajeIzquierdo++; // Punto para el jugador
            anotacionSound.play(); // Reproducir sonido de anotación
            this.mostrandoCuentaRegresiva = true; // Iniciar cuenta regresiva
            this.cuentaRegresiva = 1; // Reiniciar cuenta regresiva
            this.tiempoUltimoPunto = millis(); // Guardar tiempo del último punto
        }
    }

    show() {

        // Configurar sombra para la bola
        drawingContext.shadowColor = color(0, 255, 255); // Color de sombra azul neón
        drawingContext.shadowBlur = 20; // Desenfoque de la sombra

        // Guardar el estado actual de la transformación
        push();
        translate(this.x + 10, this.y + 10); // Mover el origen al centro de la bola
        rotate(this.rotacion); // Aplicar la rotación
        image(this.imagen, -10, -10, 20, 20); // Mostrar la imagen de la bola centrada
        pop(); // Restaurar el estado de la transformación

        drawingContext.shadowBlur = 0; // Restablecer el desenfoque de sombra
    }

    checkRaqueta(raqueta) {
        if (this.x < raqueta.x + raqueta.width && this.x > raqueta.x && this.y < raqueta.y + raqueta.height && this.y > raqueta.y) {
            // Calcular el punto de contacto en la raqueta
            let contacto = (this.y - raqueta.y) / raqueta.height; // Proporción de contacto
            
            // Rebote en la raqueta
            this.xSpeed *= -1; 
            bounceSound.play(); // Reproducir sonido de rebote

            // Ajustar la velocidad en función de dónde se tocó la raqueta
            if (contacto < 0.2 || contacto > 0.8) { // Si toca los bordes
                this.ySpeed = map(contacto, 0, 1, -10, 10); // Cambiar el ángulo de salida
            } else if (this.y < 30 || this.y > height - 30) { // Si toca los primeros o últimos 30 píxeles
                this.ySpeed *= -1; // Cambiar la dirección vertical
            }
            // Si toca el centro, no se cambia la velocidad
        }
    }

    incrementarVelocidad() {
        this.xSpeed += (this.xSpeed > 0 ? velocidadIncremento : -velocidadIncremento);
        this.ySpeed += (this.ySpeed > 0 ? velocidadIncremento : -velocidadIncremento);
    }
}

class Raqueta {
    constructor(esIzquierda) {
        this.width = 10;
        this.height = 90;
        this.x = esIzquierda ? MARGEN_RAQUETA : width - this.width - MARGEN_RAQUETA; // Ajustar posición con margen
        this.y = height / 2 - this.height / 2;
        this.speed = 0;
        this.imagen = loadImage(esIzquierda ? '/Sprites/barra1.png' : '/Sprites/barra2.png'); // Cargar la imagen de la raqueta
    }

    move(paso) {
        this.speed = paso;
    }

    follow(bola) {
        // Lógica para que la raqueta de la máquina siga la pelota
        if (bola.y < this.y + this.height / 2) {
            this.y -= 5; // Mover hacia arriba
        } else {
            this.y += 5; // Mover hacia abajo
        }
        this.y = constrain(this.y, 0, height - this.height); // Limitar el movimiento dentro del área de juego
    }

    update() {
        this.y += this.speed;
        this.y = constrain(this.y, 0, height - this.height); // Limitar el movimiento dentro del área de juego
    }

    show() {
        this.update(); // Asegurarse de que la raqueta se actualice antes de mostrarla
        // Configurar sombra para la raqueta
        drawingContext.shadowColor = color(0, 255, 255); // Color de sombra azul neón
        drawingContext.shadowBlur = 20; // Desenfoque de la sombra
        image(this.imagen, this.x, this.y, this.width, this.height); // Mostrar la imagen de la raqueta
        drawingContext.shadowBlur = 0; // Restablecer el desenfoque de sombra
    }
}

// Lógica para iniciar el juego al hacer clic en el botón
document.getElementById('start-button').addEventListener('click', () => {
    puntajeIzquierdo = 0;
    puntajeDerecho = 0;
    bola.reset();
    loop(); // Iniciar el bucle de dibujo
    juegoPausado = false; // Asegurarse de que el juego no esté pausado
});

// Nueva lógica para pausar y reanudar el juego al hacer clic en el botón de pausa
document.getElementById('pause-button').addEventListener('click', () => {
    const pauseButton = document.getElementById('pause-button');
    if (juegoPausado) {
        loop(); // Reanudar el bucle de dibujo
        juegoPausado = false; // Cambiar el estado a no pausado
        pauseButton.textContent = "Pausar Juego"; // Cambiar texto a "Pausar Juego"
    } else {
        noLoop(); // Detener el bucle de dibujo
        juegoPausado = true; // Cambiar el estado a pausado
        pauseButton.textContent = "Reanudar Juego"; // Cambiar texto a "Reanudar Juego"
    }
});

// Asegurarse de que el foco esté en el lienzo
function mousePressed() {
    let canvas = document.getElementById('game-container');
    canvas.focus();
}

