var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static")); // Routing
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Xombie API" });
});
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

var players = {};
var projectiles = {};
var gameDimensions = { width: 2000, height: 2000 };

var exists = id => {
  if (id in players) return true;
  else return false;
};

var addPlayer = id => {
  if (!exists(id)) {
    var newPlayer = {
      health: 100,
      position: { x: 100, y: 200, radius: 20 },
      lastUpdateTime: 0,
      speed: 30
    };
    players[id] = newPlayer;
  }
};

var lastUpdateTime = new Date().getTime();

io.on("connection", socket => {
  var { id } = socket;

  addPlayer(id);

  socket.on("fire", ({ position, target, userId, id }) => {
    var id = createBullet(position, target, userId, id);
  });

  const createBullet = (position, target, userId, id) => {
    let { angle, position: pos } = setAngle(position, target);
    projectiles[id] = { angle, position: pos, id, damage: 10, userId };
  };

  socket.on("disconnect", () => {
    delete players[id];
  });

  socket.on("playerUpdate", direction => {
    moveLogic(id, direction);
  });
});

setInterval(() => {
  checkHits();
  updateProjectiles();
  io.sockets.emit("state", { players, projectiles });
}, 1000 / 15);

const updateProjectiles = () => {
  var speed = 8;
  for (let id in projectiles) {
    // delete projectiles[id];
    let { x, y } = projectiles[id].position;
    if (
      x < 0 ||
      x > gameDimensions.width ||
      y < 0 ||
      y > gameDimensions.height
    ) {
      delete projectiles[id];
    } else {
      projectiles[id].position.x += projectiles[id].angle.angleX * speed;
      projectiles[id].position.y += projectiles[id].angle.angleY * speed;
    }
  }
};

const checkHits = () => {
  for (let userID in players) {
    for (let id in projectiles) {
      if (projectiles[id].userId != userID) checkBulletHit(userID, id);
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

  // console.log(
  //   `distance: ${distance}  radiusSum: ${bulletPos.radius + playerPos.radius}`
  // );

  if (distance <= bulletPos.radius + playerPos.radius + 10) {
    player.health -= bullet.damage;
    if (player.health <= 0) delete players[playerId];
    delete projectiles[bulletId];
  }
};

const moveLogic = (id, direction) => {
  let speed = 150;
  var player = players[id];
  if (!player) return;

  // code ...
  var currentTime = new Date().getTime();
  var timeDifference = currentTime - player.lastUpdateTime;
  player.position.x += (direction.x * timeDifference * speed) / 1000;
  player.position.y += (direction.y * timeDifference * speed) / 1000;
  player.lastUpdateTime = currentTime;

  //   // if (x + speed * direction.x > 30 && x + speed * direction.x < width - 20)
  //   players[id].position.x += speed * direction.x;
  //   // if (y + direction.y * speed > 30 && y + direction.y * speed < height - 40)
  //   players[id].position.y += direction.y * speed;/
};

var setAngle = (position, target) => {
  let deltaX = target.x - position.x;
  let deltaY = target.y - position.y;

  let angle = Math.atan2(deltaY, deltaX);

  let angleX = Math.cos(angle);
  let angleY = Math.sin(angle);

  let x = position.x + 50 * Math.cos(angle);
  let y = position.y + 50 * Math.sin(angle);

  return { angle: { angleX, angleY }, position: { x, y, radius: 2 } };
};