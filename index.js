var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server);
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
var messages = [];
var gameDimensions = { width: 1000, height: 1000 };

var exists = id => {
  if (id in players) return true;
  else return false;
};

var addPlayer = id => {
  if (!exists(id)) {
    var newPlayer = {
      health: 100,
      position: { x: 100, y: 200, radius: 20 },
      requestCompleted: "0",
      positionBuffer: []
    };
    players[id] = newPlayer;
  }
};

io.on("connection", socket => {
  var { id } = socket;

  addPlayer(id);

  socket.on("fire", ({ position, target, userId, id }) => {
    createBullet(position, target, userId, id);
  });

  const createBullet = (position, target, userId, id) => {
    let { angle, position: pos } = setAngle(position, target);
    projectiles[id] = { angle, position: pos, id, damage: 10, userId };
  };

  socket.on("disconnect", () => {
    delete players[id];
  });

  socket.on("moveRequest", input => {
    moveLogic(input);
  });
});

const moveLogic = input => {
  let speed = 3;
  var player = players[input.playerID];
  if (!player) return;

  // code ...
  player.position.x += input.pressTimeX * speed * 100;
  player.position.y += input.pressTimeY * speed * 100;
  player.lastCompletedSequence = input.sequenceID;

  //   // if (x + speed * direction.x > 30 && x + speed * direction.x < width - 20)
  //   players[id].position.x += speed * direction.x;
  //   // if (y + direction.y * speed > 30 && y + direction.y * speed < height - 40)
  //   players[id].position.y += direction.y * speed;/
};

//projectile logic

const updateProjectiles = () => {
  var speed = 30;
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
      projectiles[id].position.x += Math.floor(
        projectiles[id].angle.angleX * speed
      );
      projectiles[id].position.y += Math.floor(
        projectiles[id].angle.angleY * speed
      );
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

//send updates

setInterval(() => {
  checkHits();

  updateProjectiles();
  io.sockets.emit("state", { players, projectiles });
}, 1000 / 10);
