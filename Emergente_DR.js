const COLOR_INICIAL = 0;

const CANAL_ROJO = 0;
const CANAL_AZUL = 1;
const INTENSIDAD = 2;

const TIEMPO_SONDEO = 0.8;
const TIEMPO_MOVIMIENTO = 1.5;
const VELOCIDAD = 50;

let miColor = COLOR_INICIAL;
let votosRojo = 0;
let votosAzul = 0;
let haySenal = false;

function mostrarColor() {
    if (miColor === 0) {
        setMainLed({ r: 255, g: 0, b: 0 });
    } else {
        setMainLed({ r: 0, g: 0, b: 255 });
    }
}

async function indicarCambio() {
    setMainLed({ r: 255, g: 255, b: 255 });
    await delay(0.3);
    mostrarColor();
}

async function onIRMessage() {
    haySenal = true;
}

registerEvent(EventType.onIRMessage, onIRMessage);

async function sondear(canal) {
    haySenal = false;
    listenForIRMessage([canal]);
    await delay(TIEMPO_SONDEO);
    return haySenal;
}

async function cicloConsenso() {
    const vioRojo = await sondear(CANAL_ROJO);
    const vioAzul = await sondear(CANAL_AZUL);

    if (!vioRojo && !vioAzul) return;

    if (vioRojo) votosRojo++;
    if (vioAzul) votosAzul++;

    const totalRojo = votosRojo + (miColor === 0 ? 1 : 0);
    const totalAzul = votosAzul + (miColor === 1 ? 1 : 0);

    const colorAnterior = miColor;

    if (totalAzul > totalRojo) {
        miColor = 1;
    } else if (totalRojo > totalAzul) {
        miColor = 0;
    }

    if (miColor !== colorAnterior) {
        await indicarCambio();
    } else {
        mostrarColor();
    }
}

async function moverYTransmitir() {
    const canal = miColor === 0 ? CANAL_ROJO : CANAL_AZUL;
    sendIRMessage(canal, INTENSIDAD);

    const direccion = Math.floor(Math.random() * 360);
    await roll(direccion, VELOCIDAD, TIEMPO_MOVIMIENTO);
    stopRoll();
}

async function startProgram() {
    miColor = COLOR_INICIAL;
    mostrarColor();

    await delay(2);

    while (true) {
        await moverYTransmitir();
        await cicloConsenso();
        sendIRMessage(
            miColor === 0 ? CANAL_ROJO : CANAL_AZUL,
            INTENSIDAD
        );
    }
}