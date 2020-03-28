var express = require("express");
var http = require("http");
var path = require("path");
var WebSocket = require("ws");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server, { transports: ["websocket"] });
app.set("port", 5000);
app.use(express.static(path.join(__dirname, "dist")));
app.use("/static", express.static(__dirname + "/static")); // Routing

app.get("/", (req, res) => {
  res.send({ message: "Welcome to Xombie API" });
});
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

var players = {};
var projectiles = {};
var gameDimensions = { width: 1000, height: 800 };

var exists = id => {
  if (id in players) return true;
  else return false;
};

// const web = new WebSocket.Server({ server });

// var players = {};

// var generateID = storage => {
//   //create 8 digit random id
//   let str = "";
//   for (let i = 0; i < 5; i++) {
//     if (i % 2 == 0) str += Math.floor(Math.random() * 9);
//     else str += String.fromCharCode(Math.floor(Math.random() * (89 - 65) + 65));
//   }
//   if (storage[str]) generateID();
//   else return str;
// };

// web.on("connection", socket => {
//   if (!socket.id) socket.id = generateID(players);
//   players[socket.id] = {
//     x: 0,
//     y: 0
//   };
// });

// const update = () => {
//   web.clients.forEach(client => {
//     client.send("ping");
//   });
// };

// setInterval(() => {
//   console.log(players);
//   update();
// }, 1000);

var addPlayer = id => {
  if (!exists(id)) {
    var newPlayer = {
      health: 100,
      position: { x: 100, y: 200, radius: 30 },
      requestCompleted: "0"
    };
    players[id] = newPlayer;
  }
};

io.on("connection", socket => {
  var { id } = socket;

  addPlayer(id);

  socket.on("fire", array => {
    let { position, target } = decode(array, "bullet");

    createBullet(position, target, socket.id);
  });

  socket.on("disconnect", () => {
    delete players[id];
  });

  socket.on("moveRequest", input => {
    moveLogic(input, socket.id);
  });
});

const createBullet = (position, target, userID) => {
  let angle = setAngle(position, target);
  var ID = generateID();
  position.radius = 2;
  position.x += Math.floor(angle.x * 20);
  position.y += Math.floor(angle.y * 20);
  projectiles[ID] = { position, angle, userID };
};

const moveLogic = (input, id) => {
  let speed = 3;
  let player = players[id];
  if (!player) return;

  player.position.x += Math.floor(input.pressTimeX * speed * 100);
  player.position.y += Math.floor(input.pressTimeY * speed * 100);
  player.lastCompletedSequence = input.sequenceID;
};

//projectile logic

const updateProjectiles = () => {
  var speed = 70;

  for (let id in projectiles) {
    let curr = projectiles[id];
    let { position, angle } = curr;

    var { x: aX, y: aY } = angle;
    let { x, y } = position;

    if (
      x < 0 ||
      x > gameDimensions.width ||
      y < 0 ||
      y > gameDimensions.height
    ) {
      delete projectiles[id];
    } else {
      curr.position.x += Math.floor(aX * speed);
      curr.position.y += Math.floor(aY * speed);
    }
  }
};

const checkHits = () => {
  for (let userID in players) {
    for (let id in projectiles) {
      if (projectiles[id].userID != userID) checkBulletHit(userID, id);
    }
  }
};

const checkBulletHit = (playerId, bulletId) => {
  var player = players[playerId];
  var bullet = projectiles[bulletId];

  if (!player || !bullet || bullet.userId === playerId) return;

  let bulletPos = bullet.position;

  let playerPos = player.position;

  let dx = bulletPos.x - playerPos.x;
  let dy = bulletPos.y - playerPos.y;

  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= bulletPos.radius + playerPos.radius + 10) {
    player.health -= 10;
    if (player.health <= 0) delete players[playerId];

    delete projectiles[bulletId];
  }
};

var setAngle = (position, target) => {
  let deltaX = target.x - position.x;
  let deltaY = target.y - position.y;

  let angle = Math.atan2(deltaY, deltaX);

  let x = Math.cos(angle);
  let y = Math.sin(angle);

  return { x, y };
};

//send updates

setInterval(() => {
  let timeStamp = +new Date();
  updateProjectiles();
  checkHits();

  var encoded = encodeProjectiles();
  io.sockets.emit("state", { players, projectiles: encoded, timeStamp });
}, 1000 / 10);

var decode = (array, type) => {
  if (type == "bullet") {
    let [xI, yI, xF, yF] = array;
    return { position: { x: xI, y: yI }, target: { x: xF, y: yF } };
  } else if (type == "player") {
    let [health, x, y] = array;
    return { health, position: { x, y } };
  }
};

encodeProjectiles = () => {
  var payload = {};
  for (let id in projectiles) {
    payload[id] = encode(projectiles[id], "bullet");
  }
  return payload;
};

var projectiles;

var encode = (object, type) => {
  if (type == "bullet") {
    let { position } = object;
    return [position.x, position.y];
  } else if (type == "player") {
    let { health, position } = object;
    return [health, position.x, position.y];
  }
};

var generateID = () => {
  //create 8 digit random id
  let str = "";
  for (let i = 0; i < 5; i++) {
    if (i % 2 == 0) str += Math.floor(Math.random() * 9);
    else str += String.fromCharCode(Math.floor(Math.random() * (89 - 65) + 65));
  }
  if (projectiles[str]) generateID();
  else return str;
};
