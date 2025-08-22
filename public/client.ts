interface Player {
  id: string;
  x: number;
  y: number;
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${protocol}//${location.host}/ws`);
let myId: string | null = null;
let players: Record<string, Player> = {};

socket.onmessage = (event: MessageEvent) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "init") {
    myId = msg.id;
    players = msg.players;
  } else if (msg.type === "join") {
    players[msg.player.id] = msg.player;
  } else if (msg.type === "update") {
    players[msg.player.id] = msg.player;
  } else if (msg.type === "leave") {
    delete players[msg.id];
  }
};

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (["w", "a", "s", "d"].indexOf(e.key) !== -1) {
    socket.send(JSON.stringify({ type: "move", dir: keyToDir(e.key) }));
  }
});

function keyToDir(key: string): string {
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
  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = id === myId ? "blue" : "red";
    ctx.fillRect(p.x, p.y, 20, 20);
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
