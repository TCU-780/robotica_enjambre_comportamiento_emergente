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
    startIRBroadcast(color, 4);
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
        rojos = 0;
        azules = 0;

        await broadcastColor(color);

        await delay(TIEMPO_VOTACION);

        if (rojos > azules) {
            color = ROJO;
        } else if (azules > rojos) {
            color = AZUL;
        }
    }
}