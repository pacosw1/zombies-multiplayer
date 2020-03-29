var express = require("express");
var http = require("http");
var path = require("path");
var WebSocket = require("ws");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server, { transports: ["websocket"] });

var { encodePlayers, decodeMovement } = require("./network/utils");
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

const web = new WebSocket.Server({ server });

var players = {};

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
    delete players[socket.id];
  };

  socket.onmessage = ({ data }) => {
    if (data.byteLength == 0) {
      var id = generate();
      addPlayer(id);
      socket.id = id;
      let buffer = new ArrayBuffer(2);
      let view = new Uint8Array(buffer);
      view[0] = 1;
      view[1] = socket.id;
      socket.send(buffer);
    } else {
      //different cases for messages
      let view = new Uint8Array(data);
      if (view[0] == 2) {
        let input = decodeMovement(data);
        moveLogic(input, socket.id);
      }
    }
  };
});

var encoded;

const update = () => {
  encoded = encodePlayers(players);
  web.clients.forEach(client => {
    client.send(encoded);
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
  // console.log(players);
  update();
}, 1000 / 10);

var players = {
  // "1": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "2": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "3": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "4": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "5": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // }
  // "6": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "7": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "8": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "9": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "10": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // }
  // "11": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "12": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "13": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "14": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "15": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "16": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "17": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "18": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "19": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "20": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "21": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "22": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "23": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "24": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "25": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "26": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "27": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "28": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "29": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "30": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "31": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "32": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "33": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "34": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "35": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "36": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "37": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "38": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "39": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // },
  // "40": {
  //   health: 100,
  //   position: { x: 0, y: 0 },
  //   sequenceID: 12323
  // }
};

// io.on("connection", socket => {
//   var { id } = socket;

//   addPlayer(id);

//   socket.on("fire", array => {
//     let { position, target } = decode(array, "bullet");

//     createBullet(position, target, socket.id);
//   });

//   socket.on("disconnect", () => {
//     delete players[id];
//   });

//   socket.on("moveRequest", input => {
//     moveLogic(input, socket.id);
//   });
// });

// const createBullet = (position, target, userID) => {
//   let angle = setAngle(position, target);
//   var ID = generateID();
//   position.radius = 2;
//   position.x += Math.floor(angle.x * 20);
//   position.y += Math.floor(angle.y * 20);
//   projectiles[ID] = { position, angle, userID };
// };

const moveLogic = (input, id) => {
  let speed = 1;
  let player = players[id];
  if (!player) return;

  player.position.x += Math.floor(input.pressX * speed);
  player.position.y += Math.floor(input.pressY * speed);
  player.sequenceID = input.sequenceID;
};

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

// const checkHits = () => {
//   for (let userID in players) {
//     for (let id in projectiles) {
//       if (projectiles[id].userID != userID) checkBulletHit(userID, id);
//     }
//   }
// };

// const checkBulletHit = (playerId, bulletId) => {
//   var player = players[playerId];
//   var bullet = projectiles[bulletId];

//   if (!player || !bullet || bullet.userId === playerId) return;

//   let bulletPos = bullet.position;

//   let playerPos = player.position;

//   let dx = bulletPos.x - playerPos.x;
//   let dy = bulletPos.y - playerPos.y;

//   let distance = Math.sqrt(dx * dx + dy * dy);

//   if (distance <= bulletPos.radius + playerPos.radius + 10) {
//     player.health -= 10;
//     if (player.health <= 0) delete players[playerId];

//     delete projectiles[bulletId];
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
  if (players[id]) generate();
  else return id;
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
