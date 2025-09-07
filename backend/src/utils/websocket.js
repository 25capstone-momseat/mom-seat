
const WebSocket = require('ws');

let wss;

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  console.log('WebSocket server is set up');
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
