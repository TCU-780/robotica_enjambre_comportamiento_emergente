var rojos = 0;
var azules = 0;

const ROJO = 0;
const AZUL = 1;

const VELOCIDAD = 35;
const TIEMPO_MOVIMIENTO = 0.35;
const TIEMPO_VOTACION = 0.7;
const TIEMPO_RONDA = 0.2;

function setColor(color) {
    if (color === ROJO) {
        setMainLed({ r: 255, g: 0, b: 0 });
    } else {
        setMainLed({ r: 0, g: 0, b: 255 });
    }
}

async function broadcastColor(color) {
    // El color va en ambos canales del par para que sea legible
    // tanto de cerca (<1 m) como de lejos (1-3 m).
    startIRBroadcast(color, color);
}

async function move() {
    while (true) {
        let direccion = Math.floor(Math.random() * 360);

        await roll(direccion, VELOCIDAD, TIEMPO_MOVIMIENTO);
        await stopRoll();

        await delay(0.15);
    }
}

async function onIRMessage(channel) {
    if (channel === ROJO) {
        rojos++;
    } else if (channel === AZUL) {
        azules++;
    }
}

registerEvent(EventType.onIRMessage, onIRMessage);

async function startProgram() {
    var color = Math.floor(Math.random() * 2);

    setColor(color);

    listenForIRMessage(ROJO, AZUL);

    move();

    while (true) {
        // Cuenta tu propio color: da inercia y evita que un robot
        // aislado (0 vecinos) parpadee al azar.
        rojos = color === ROJO ? 1 : 0;
        azules = color === AZUL ? 1 : 0;

        await broadcastColor(color);

        await delay(TIEMPO_VOTACION);

        if (rojos > azules) {
            color = ROJO;
        } else if (azules > rojos) {
            color = AZUL;
        } else {
            // Empate real con vecinos: rompe la simetria al azar.
            // Sin esto, las divisiones pares nunca se resuelven.
            color = Math.floor(Math.random() * 2);
        }

        setColor(color);

        // Jitter: desincroniza las rondas para que los robots no
        // voten en fase y no caigan en oscilaciones tipo flip-flop.
        await delay(TIEMPO_RONDA + Math.random() * 0.2);
    }
}