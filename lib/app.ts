var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server);
import { PlayerList } from "./PlayerList";
app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static")); // Routing
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Xombie API" });
});
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

var players = {};

var lastUpdateTime = new Date().getTime();

io.on("connection", socket => {
  socket.on("player", userData => {
    if (!players[userData.username]) {
      console.log(`${userData.username} has connected`);

      players[userData.username] = {
        health: 100,
        position: { x: 100, y: 100 }
      };
    }
  });
  socket.on("updatePosition", ({ direction, username }) => {
    moveLogic(username, direction);
  });
});

setInterval(() => {
  io.sockets.emit("state", players);
}, 1000 / 60);

const moveLogic = (id, direction) => {
  let speed = 50;
  var player = players[id];

  // code ...
  var currentTime = new Date().getTime();
  var timeDifference = currentTime - lastUpdateTime;
  player.position.x += (5 * timeDifference * direction.x * speed) / 1000;
  player.position.y += (5 * timeDifference * direction.y * speed) / 1000;
  lastUpdateTime = currentTime;

  //   // if (x + speed * direction.x > 30 && x + speed * direction.x < width - 20)
  //   players[id].position.x += speed * direction.x;
  //   // if (y + direction.y * speed > 30 && y + direction.y * speed < height - 40)
  //   players[id].position.y += direction.y * speed;/
};
