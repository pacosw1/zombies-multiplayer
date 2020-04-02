var express = require("express");
var http = require("http");
var path = require("path");
var WebSocket = require("ws");
var app = express();
var server = http.Server(app);

var { encodePlayers } = require("./network/utils");
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

var exists = id => {
  if (id in players) return true;
  else return false;
};

const web = new WebSocket.Server({ server });

var simulation = new Simulation();

simulation.start();

web.on("connection", socket => {
  socket.onclose = () => {
    simulation.requests.queue({ type: 4, userID: socket.id });
  };

  socket.onmessage = ({ data }) => {
    if (data.byteLength == 0) {
      console.log("connect");
      var id = generate();
      socket.id = id;
      simulation.requests.queue({ type: 0, userID: id });

      let buffer = new ArrayBuffer(2);
      let view = new Uint8Array(buffer);
      view[0] = 1;
      view[1] = socket.id;
      socket.send(buffer);
    } else {
      console.log("other message");
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

var generate = () => {
  var id = Math.floor(Math.random() * 100);
  if (simulation.players[id]) generate();
  else return id;
};

var encoded;

const update = () => {
  encoded = encodePlayers(simulation.players, simulation.projectiles);
  web.clients.forEach(client => {
    client.send(encoded);
  });
};

setInterval(() => {
  update();
  console.log(send);
}, 1000.0 / 10);
