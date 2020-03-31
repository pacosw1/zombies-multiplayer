var express = require("express");
var http = require("http");
var path = require("path");
var WebSocket = require("ws");
var app = express();
var server = http.Server(app);

var { encodePlayers, decodeMovement } = require("./network/utils");
var { Simulation } = require("./simulation/Simulation");
app.set("port", 5000);
app.use(express.static(path.join(__dirname, "dist")));
app.use("/static", express.static(__dirname + "/static")); // Routing

app.get("/", (req, res) => {
  res.send({ message: "Welcome to Xombie API" });
});
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

var gameDimensions = { width: 800, height: 800 };

var exists = id => {
  if (id in players) return true;
  else return false;
};

const web = new WebSocket.Server({ server });

var simulation = new Simulation();

simulation.start();

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

web.on("connection", socket => {
  socket.onclose = () => {
    simulation.requests.queue({ type: 4, userID: socket.id });
  };

  socket.onmessage = ({ data }) => {
    if (data.byteLength == 0) {
      var id = generate();
      socket.id = id;
      simulation.requests.queue({ type: 0, userID: id });

      let buffer = new ArrayBuffer(2);
      let view = new Uint8Array(buffer);
      view[0] = 1;
      view[1] = socket.id;
      socket.send(buffer);
    } else {
      //different cases for messages
      let view = new Uint8Array(data);
      if (view[0] == 2) {
        simulation.requests.queue({
          type: 1,
          payload: data,
          userID: socket.id
        });
      } else if (view[0] == 3) {
        simulation.requests.queue({
          type: 2,
          payload: data,
          userID: socket.id
        });
      }
    }
  };
});

var encoded;

const update = () => {
  // console.log(simulation.players);
  web.clients.forEach(client => {
    client.send(encodePlayers(simulation.players, simulation.projectiles));
  });
};

var addPlayer = id => {
  if (!exists(id)) {
    var newPlayer = {
      health: 100,
      position: { x: 0, y: 0, radius: 30 },
      sequenceID: 0
    };
    players[id] = newPlayer;
  }
};

setInterval(() => {
  update();
}, 1000.0 / 10);

// const createBullet = (position, target, userID) => {
//   let angle = setAngle(position, target);
//   var ID = generateID();
//   position.radius = 2;
//   position.x += Math.floor(angle.x * 20);
//   position.y += Math.floor(angle.y * 20);
//   projectiles[ID] = { position, angle, userID };
// };

// //projectile logic

// const updateProjectiles = () => {
//   var speed = 30;

//   for (let id in projectiles) {
//     let curr = projectiles[id];
//     let { position, angle } = curr;

//     var { x: aX, y: aY } = angle;
//     let { x, y } = position;

//     if (
//       x < 0 ||
//       x > gameDimensions.width ||
//       y < 0 ||
//       y > gameDimensions.height
//     ) {
//       delete projectiles[id];
//     } else {
//       curr.position.x += Math.floor(aX * speed);
//       curr.position.y += Math.floor(aY * speed);
//     }
//   }
// };

// var setAngle = (position, target) => {
//   let deltaX = target.x - position.x;
//   let deltaY = target.y - position.y;

//   let angle = Math.atan2(deltaY, deltaX);

//   let x = Math.cos(angle);
//   let y = Math.sin(angle);

//   return { x, y };
// };

// //send updates

// setInterval(() => {
//   updateProjectiles();
//   checkHits();

//   var binary = encodePlayers(players);
//   console.log(binary);

//   var timestamp = +new Date();

//   var encoded = encodeProjectiles();
//   io.sockets.emit("state", { players, projectiles: encoded, timestamp });
// }, 1000 / 10);

// var decode = (array, type) => {
//   if (type == "bullet") {
//     let [xI, yI, xF, yF] = array;
//     return { position: { x: xI, y: yI }, target: { x: xF, y: yF } };
//   } else if (type == "player") {
//     let [health, x, y] = array;
//     return { health, position: { x, y } };
//   }
// };

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

var generate = () => {
  var id = Math.floor(Math.random() * 100);
  if (simulation.players[id]) generate();
  else return id;
};
