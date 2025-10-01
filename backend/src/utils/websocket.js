
const WebSocket = require('ws');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://192.0.0.2:3000',
  'http://172.18.33.183:8000',
];

let wss;

function setupWebSocket(server) {
  wss = new WebSocket.Server({
    server,
    verifyClient: (info, cb) => {
      const origin = info.origin;
      if (allowedOrigins.includes(origin)) {
        cb(true);
      } else {
        console.warn(`WebSocket connection from origin ${origin} rejected.`);
        cb(false, 403, 'Forbidden');
      }
    },
  });

  wss.on('connection', (ws, req) => {
    // The req object here is the http.IncomingMessage from the upgrade request
    console.log(`Client connected to WebSocket from origin: ${req.headers.origin}`);
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  console.log('WebSocket server is set up with origin verification');
}

function broadcast(data) {
  if (!wss) {
    console.error("WebSocket server is not initialized.");
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { setupWebSocket, broadcast };
