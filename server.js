const { WebSocketServer, WebSocket } = require("ws");
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  res.end("WebSocket server is running");
});

const wss = new WebSocketServer({
  server,
  path: "/ws"
});

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({
    type: "status",
    text: "接続成功！"
  }));

  socket.on("message", (raw) => {
    if (raw.length > 2000) return;

    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (data.type !== "chat" ||
        typeof data.text !== "string") return;

    const text = data.text.trim().slice(0, 500);
    if (!text) return;

    const message = JSON.stringify({
      type: "chat",
      text
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });
});

server.listen(
  process.env.PORT || 10000,
  "0.0.0.0",
  () => console.log("WebSocket server started")
);
