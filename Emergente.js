// 0 = rojo, 1 = azul
var myColor = Math.random() < 0.5 ? 0 : 1;

var redVotes = 0;
var blueVotes = 0;

// Canal 1 = mensaje rojo
// Canal 2 = mensaje azul
var channels = [1, 2];

function updateLed() {
  if (myColor === 0) {
    setMainLed({ r: 255, g: 0, b: 0 });
  } else {
    setMainLed({ r: 0, g: 0, b: 255 });
  }
}

async function broadcastColor() {
  if (myColor === 0) {
    sendIRMessage(1, 1);
  } else {
    sendIRMessage(2, 1);
  }
}

async function onIRMessage(channel) {
  if (channel === 1) {
    redVotes++;
  }

  if (channel === 2) {
    blueVotes++;
  }

  listenForIRMessage(channels);
}

registerEvent(EventType.onIRMessage, onIRMessage);

async function startProgram() {
  updateLed();
  listenForIRMessage(channels);

  while (true) {
    await broadcastColor();

    if (redVotes > blueVotes) {
      myColor = 0;
    } else if (blueVotes > redVotes) {
      myColor = 1;
    }

    updateLed();

    redVotes = 0;
    blueVotes = 0;

    await delay(2);
  }
}