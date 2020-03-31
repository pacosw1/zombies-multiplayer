"use strict";
let { Queue } = require("../ds/Queue");
var {
  encodePlayers,
  decodeMovement,
  decodeProjectile
} = require("../network/utils");
var self;
class Simulation {
  constructor() {
    this.requests = new Queue();
    this.players = {};
    this.projectiles = {};
    self = this;
  }

  update() {
    self.updateProjectiles();
    self.checkHits();
    if (!this.requests.empty()) {
      let request = this.requests.peek();
      self.processRequest(request);
      this.requests.dequeue();
    }
  }

  processRequest(request) {
    switch (request.type) {
      case 2:
        self.addProjectile(request.userID, request.payload);
        break;
      case 1:
        self.moveLogic(request.payload, request.userID);
        break;
      case 0:
        self.addPlayer(request.userID);
        break;
      case 4:
        delete this.players[request.userID];
        break;
    }
  }

  addPlayer(ID) {
    this.players[ID] = {
      position: { x: 0, y: 0, radius: 30 },
      health: 100,
      sequenceID: 0
    };
  }

  projectileExists(ID) {
    return projectiles[ID] ? true : false;
  }

  addProjectile(ID, payload) {
    let id = self.generateID();

    let target = decodeProjectile(payload);

    let initPos = this.players[ID].position;

    let angle = self.setAngle(initPos, target);
    this.projectiles[id] = {
      angle: angle,
      userID: ID,
      position: { x: initPos.x + 30, y: initPos.y + 30, radius: 4 },
      ID: id
    };
  }

  checkHits() {
    for (let userID in this.players) {
      for (let id in this.projectiles) {
        if (this.projectiles[id].userID != userID)
          self.checkBulletHit(userID, id);
      }
    }
  }

  checkBulletHit(playerId, bulletId) {
    var player = this.players[playerId];
    var bullet = this.projectiles[bulletId];

    if (!player || !bullet || bullet.userId === playerId) return;

    let bulletPos = bullet.position;

    let playerPos = player.position;

    let dx = bulletPos.x - playerPos.x;
    let dy = bulletPos.y - playerPos.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= bulletPos.radius + playerPos.radius) {
      player.health -= 10;
      if (player.health <= 0) delete this.players[playerId];

      delete this.projectiles[bulletId];
    }
  }

  setAngle(position, target) {
    let deltaX = target.x - position.x;
    let deltaY = target.y - position.y;

    let angle = Math.atan2(deltaY, deltaX);

    let x = Math.cos(angle);
    let y = Math.sin(angle);

    return { x, y };
  }

  generateID() {
    //create 8 digit random id
    let num = Math.floor(Math.random() * 50000 + 1);

    if (this.projectiles[num]) self.generateID();
    else return num;
  }

  updateProjectiles() {
    var speed = 15;

    for (let id in this.projectiles) {
      let curr = this.projectiles[id];
      let { position, angle } = curr;

      var { x: aX, y: aY } = angle;
      let { x, y } = position;

      if (x < 0 || x > 1400 || y < 0 || y > 1000) {
        delete this.projectiles[id];
      } else {
        curr.position.x += Math.floor(aX * speed);
        curr.position.y += Math.floor(aY * speed);
      }
    }
  }

  moveLogic(payload, ID) {
    //decode
    let speed = 350;
    let { pressX, pressY, sequenceID } = decodeMovement(payload);

    let player = this.players[ID];

    player.position.x += pressX * speed;
    player.position.y += pressY * speed;

    player.sequenceID = sequenceID;
  }

  start() {
    setInterval(() => self.tick(), 1000 / 60);
  }

  tick() {
    self.update();
  }
}

module.exports.Simulation = Simulation;
