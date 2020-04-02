exports.encodePlayers = (players, projectiles) => {
  var lenPlayers = Object.keys(players).length * 8;
  var lenProjectiles = Object.keys(projectiles).length * 6;
  var bytes = lenPlayers + lenProjectiles;
  // console.log(bytes);
  var start = 4;
  var gameState = new ArrayBuffer(bytes + 4);
  var overhead = new Int16Array(gameState, 0, 2);

  overhead[0] = 0;

  for (let ID in players) {
    encodePlayer(gameState, players, ID, start);
    start += 8;
  }

  overhead[1] = start;
  for (let ID in projectiles) {
    encodeProjectile(gameState, projectiles, ID, start);
    start += 6;
  }
  return gameState;
};

//2 bytes for ping
//2 bytes for projectile start byte

exports.decodeNode = buffer => {
  let x = new ArrayBuffer(buffer.byteLength);
  let view = new Uint8Array(x);
  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }
  return x;
};

exports.decodeMovement = buffer => {
  let node = this.decodeNode(buffer);
  let viewUnsigned = new Uint16Array(node, 4, 1);
  let view8 = new Int8Array(buffer, 1, 2);
  return {
    sequenceID: viewUnsigned[0],
    pressX: view8[1] / 1000,
    pressY: view8[2] / 1000
  };
};

exports.decodeProjectile = buffer => {
  let node = this.decodeNode(buffer);

  let [x, y] = new Uint16Array(node, 2, 2);
  return { x, y };
};

const encodeProjectile = (gameState, projectiles, ID, start) => {
  let view16 = new Uint16Array(gameState, start, 3);

  let projectile = projectiles[ID];

  view16[0] = projectile.ID;
  view16[1] = Math.floor(projectile.position.x);
  view16[2] = Math.floor(projectile.position.y);
};

// [sequenceID, x, y, ID, health]
const encodePlayer = (gameState, players, ID, start) => {
  let view16 = new Uint16Array(gameState, start, 3);
  let view8 = new Uint8Array(gameState, start + 6, 2);

  let player = players[ID];

  //compressed timestamp
  view16[0] = player.sequenceID;

  //player stats
  view8[0] = ID;
  view8[1] = player.health;
  //player position
  view16[1] = Math.floor(player.position.x);
  view16[2] = Math.floor(player.position.y);
};
