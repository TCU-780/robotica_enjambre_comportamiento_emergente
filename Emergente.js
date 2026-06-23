
// Contadores para los colores que lee de los vecinos
var rojos = 0;
var azules = 0;

// Canales de transmision:
// 0: rojo
// 1: azul
var channels = [0, 1];

function setColor(color) {
    if (color === 0) {
        setMainLed({ r: 255, g: 0, b: 0 });
    } else {
        setMainLed({ r: 0, g: 0, b: 255 });
    }
}

async function broadcastColor(color) {
    if (color === 0) {
        startIRBroadcast(4, 0);
    } else {
        startIRBroadcast(4, 1);
    }
}

async function onIRMessage(channel) {
  if (channel === 0) {
    rojos++;
  }

  if (channel === 1) {
    azules++;
  }
}

registerEvent(EventType.onIRMessage, onIRMessage);

async function startProgram() {
    var color = Math.floor(Math.random() * 2);
    setColor(color);

    //listenForIRMessage(channels);
    listenForIRMessage(channels[0], channels[1]);

    while (true) {
        await broadcastColor(color);

        await delay(1.5);

        if (rojos > azules) {
            color = 0;
        } else if (azules > rojos) {
            color = 1;
        }
        
        setColor(color);
        rojos = 0;
        azules = 0;
        await delay(0.5);
    }
}