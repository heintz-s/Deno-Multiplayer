var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var protocol = location.protocol === "https:" ? "wss:" : "ws:";
var socket = new WebSocket("".concat(protocol, "//").concat(location.host, "/ws"));
var myId = null;
var players = {};
socket.onmessage = function (event) {
    var msg = JSON.parse(event.data);
    if (msg.type === "init") {
        myId = msg.id;
        players = msg.players;
    }
    else if (msg.type === "join") {
        players[msg.player.id] = msg.player;
    }
    else if (msg.type === "update") {
        players[msg.player.id] = msg.player;
    }
    else if (msg.type === "leave") {
        delete players[msg.id];
    }
};
document.addEventListener("keydown", function (e) {
    if (["w", "a", "s", "d"].indexOf(e.key) !== -1) {
        socket.send(JSON.stringify({ type: "move", dir: keyToDir(e.key) }));
    }
});
function keyToDir(key) {
    switch (key) {
        case "w": return "up";
        case "s": return "down";
        case "a": return "left";
        case "d": return "right";
        default: return "";
    }
}
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var id in players) {
        var p = players[id];
        ctx.fillStyle = id === myId ? "blue" : "red";
        ctx.fillRect(p.x, p.y, 20, 20);
    }
    requestAnimationFrame(gameLoop);
}
gameLoop();
