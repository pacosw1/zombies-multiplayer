exports.encodePlayers = players => {
  var keys = Object.keys(players);
  var bytes = keys.length * 8;
  var start = 0;
  var gameState = new ArrayBuffer(bytes);
  for (let ID in players) {
    encodePlayer(gameState, players, ID, start);
    start += 8;
  }
  return gameState;
};

decodeNodeBuffer = nodeBuffer => {
  let arrayBuffer = new ArrayBuffer(nodeBuffer.length);
  let view8 = new Int8Array(arrayBuffer);
  let view32 = new Uint32Array(arrayBuffer);
  let i = 0;
  for (let i = 0; i < nodeBuffer.length; i++) {
    view8[i] = nodeBuffer[i];
  }
  return arrayBuffer;
};

exports.decodeMovement = buffer => {
  buffer = decodeNodeBuffer(buffer);
  let view32 = new Int32Array(buffer, 4, 1);
  let view8 = new Int8Array(buffer, 0, 3);

  return {
    sequenceID: view32[0],
    pressX: view8[1],
    pressY: view8[2]
  };
};

const encodePlayer = (gameState, players, ID, start) => {
  let view32 = new Uint32Array(gameState, start, 1);
  let view8 = new Uint8Array(gameState, start + 4, 4);

  let player = players[ID];

  //compressed timestamp
  view32[0] = player.sequenceID;

  //player stats
  view8[0] = ID;
  view8[1] = player.health;
  //player position
  view8[2] = player.position.x;
  view8[3] = player.position.y;
};
