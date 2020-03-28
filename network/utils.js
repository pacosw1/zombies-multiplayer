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

const encodePlayer = (gameState, players, ID, start) => {
  console.log(ID);
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
