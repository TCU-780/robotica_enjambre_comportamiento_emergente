var rojos = 0;
var azules = 0;
const ROJO = 0;
const AZUL = 1;
const VELOCIDAD = 35;
const TIEMPO_MOVIMIENTO = 0.35;
const TIEMPO_VOTACION = 1.5;
const TIEMPO_RONDA = 0.2;
const INTENSIDAD = 64;        // 1..64; mayor = más alcance
var color = 0;                // global: lo necesita el loop de emisión

function setColor(c) {
    if (c === ROJO) setMainLed({ r: 255, g: 0, b: 0 });
    else            setMainLed({ r: 0, g: 0, b: 255 });
}

// CLAVE: sendIRMessage (no startIRBroadcast) es lo que dispara onIRMessage.
// El color viaja como el número de canal del mensaje.
async function broadcastLoop() {
    while (true) {
        sendIRMessage(color, INTENSIDAD);
        await delay(0.25);
    }
}

async function move() {
    while (true) {
        let dir = Math.floor(Math.random() * 360);
        await roll(dir, VELOCIDAD, TIEMPO_MOVIMIENTO);
        await stopRoll();
        await delay(0.15);
    }
}

async function onIRMessage(channel) {
    if (channel === ROJO) rojos++;
    else if (channel === AZUL) azules++;
}
registerEvent(EventType.onIRMessage, onIRMessage);

async function startProgram() {
    color = Math.floor(Math.random() * 2);
    setColor(color);
    listenForIRMessage(ROJO, AZUL);
    move();
    broadcastLoop();
    while (true) {
        rojos  = (color === ROJO ? 1 : 0);   // auto-voto
        azules = (color === AZUL ? 1 : 0);
        await delay(TIEMPO_VOTACION);
        if (rojos > azules) color = ROJO;
        else if (azules > rojos) color = AZUL;
        else color = Math.floor(Math.random() * 2);
        setColor(color);
        await delay(TIEMPO_RONDA + Math.random() * 0.2);
    }
}