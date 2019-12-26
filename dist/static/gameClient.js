let move = {
    up: false,
    down: false,
    left: false,
    right: false
};
const socket = io();
let online = false;
socket.on("connect", () => {
    console.log("connected to server");
    socket.emit("player", { username: "pacosw1", move });
    console.log(socket.connected);
});
setInterval(function () {
    socket.emit("playerInfo", { move });
}, 1000 / 60);
socket.on("message", function (data) {
    console.log(data);
});
//# sourceMappingURL=gameClient.js.map