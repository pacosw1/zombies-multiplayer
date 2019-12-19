class PlayerList {
  constructor() {
    if (!PlayerList.instance) {
      this.players = [];
      PlayerList.instance = this;
    }

    return PlayerList.instance;
  }

  //rest is the same code as preceding example
}

const instance = new PlayerList();
Object.freeze(instance);

exports.PlayerList = instance;
