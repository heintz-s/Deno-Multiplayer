interface Player {
  id: string;
  x: number;
  y: number;
}

const players: Record<string, Player> = {};
const sockets = new Map<string, WebSocket>();

function broadcast(message: unknown, except?: string) {
  for (const [id, socket] of sockets) {
    if (id !== except) {
      socket.send(JSON.stringify(message));
    }
  }
}

Deno.serve((req) => {
  const { pathname } = new URL(req.url);

  // Static file serving
  if (pathname === "/") {
    return new Response(Deno.readTextFileSync("./public/index.html"), {
      headers: { "content-type": "text/html" },
    });
  }

  if (pathname === "/client.js") {
    return new Response(Deno.readTextFileSync("./public/client.js"), {
      headers: { "content-type": "application/javascript" },
    });
  }

  // WebSocket for game
  if (pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const id = crypto.randomUUID();

    players[id] = { id, x: 100, y: 100 };
    sockets.set(id, socket);

    socket.onopen = () => {
      console.log(`Player ${id} connected`);
      socket.send(JSON.stringify({ type: "init", id, players }));
      broadcast({ type: "join", player: players[id] }, id);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "move") {
        const p = players[id];
        if (!p) return;
        if (msg.dir === "up") p.y -= 10;
        if (msg.dir === "down") p.y += 10;
        if (msg.dir === "left") p.x -= 10;
        if (msg.dir === "right") p.x += 10;
        broadcast({ type: "update", player: p });
      }
    };

    socket.onclose = () => {
      console.log(`Player ${id} disconnected`);
      delete players[id];
      sockets.delete(id);
      broadcast({ type: "leave", id });
    };

    return response;
  }

  return new Response("Not found", { status: 404 });
});
