"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server);
const PlayerList_1 = require("./PlayerList");
app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static")); // Routing
app.get("/", (req, res) => {
    res.send({ message: "Welcome to Xombie API" });
});
server.listen(5000, function () {
    console.log("Starting server on port 5000");
});
let players = PlayerList_1.PlayerList.players;
io.on("connection", socket => {
    socket.on("player", userData => {
        console.log(`${userData.username} has connected to the server.`);
        players[socket.id] = {
            username: userData.username,
            x: 100,
            y: 100
        };
        socket.on("playerInfo", data => {
            let { move } = data;
            //update position
            console.log("position updated");
            players[socket.id].move = move;
            console.log(players);
        });
    });
});
// import * as express from "express";
// import * as bodyParser from "body-parser";
// import { Request, Response } from "express";
// import * as socketIO from "socket.io";
// class App {
//   constructor() {
//     this.app = express();
//     this.config();
//     this.routes();
//   }
//   public app: express.Application;
//   private config(): void {
//     this.app.use(bodyParser.json());
//     this.app.use("/src", express.static(__dirname + "/src")); // Routing
//     this.app.use(bodyParser.urlencoded({ extended: false }));
//   }
//   private routes(): void {
//     const router = express.Router();
//     router.get("/", (req: Request, res: Response) => {
//       res.status(200).send({
//         message: "Hello World!"
//       });
//     });
//     router.post("/", (req: Request, res: Response) => {
//       const data = req.body;
//       // query a database and save data
//       res.status(200).send(data);
//     });
//     this.app.use("/", router);
//   }
// }
// export default new App().app;
//# sourceMappingURL=app.js.map