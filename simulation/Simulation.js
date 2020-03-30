"use strict";
let { Queue } = require("../ds/Queue");
var { encodePlayers, decodeMovement } = require("../network/utils");
var self;
class Simulation {
  constructor() {
    this.requests = new Queue();
    this.players = {};
    self = this;
  }

  update() {
    if (!this.requests.empty()) {
      let request = this.requests.peek();
      console.log(request);
      self.processRequest(request);
      console.log(this.players);
      this.requests.dequeue();
    }
  }

  processRequest(request) {
    switch (request.type) {
      case 0:
        self.addPlayer(request.userID);
        break;
      case 1:
        self.moveLogic(request.payload, request.userID);
        break;

      case 4:
        delete this.players[request.userID];
    }
  }

  addPlayer(ID) {
    this.players[ID] = { position: { x: 0, y: 0 }, health: 100, sequenceID: 0 };
  }

  moveLogic(payload, ID) {
    //decode
    let view32 = new Int32Array(payload);
    let view8 = new Int8Array(payload);

    console.log("test: " + view8[0]);

    let player = this.players[ID];

    player.position.x += Math.floor(view8[1] * 1);
    player.position.y += Math.floor(view8[2] * 1);
    player.sequenceID = view32[4];
  }

  start() {
    setImmediate(this.tick);
  }

  tick() {
    self.update();
    setImmediate(self.tick);
  }
}

module.exports.Simulation = Simulation;
