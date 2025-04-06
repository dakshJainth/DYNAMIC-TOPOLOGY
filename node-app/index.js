const WebSocket = require('ws');

const NODE_ID = process.env.NODE_ID || 'nodeX';
const TARGET_NODE = process.env.TARGET_NODE || null; // Who to message
const MESSAGE = process.env.MESSAGE || `Hello from ${NODE_ID}`; // Message content

const ws = new WebSocket('ws://server:5050');

ws.on('open', () => {
  console.log(`${NODE_ID} connected to server`);

  // Register node with the main server
  ws.send(JSON.stringify({ type: 'register', id: NODE_ID }));

  // After a short delay, send a message to another node
  if (TARGET_NODE) {
    setTimeout(() => {
      const payload = {
        type: 'send_direct',
        from: NODE_ID,
        to: TARGET_NODE,
        message: MESSAGE
      };
      console.log(`${NODE_ID} -> ${MESSAGE} -> ${TARGET_NODE}`);
      ws.send(JSON.stringify(payload));
    }, 3000);
  }
});

ws.on('message', (msg) => {
  const data = JSON.parse(msg);
  console.log(`${NODE_ID} received from ${data.from}: ${data.message}`);
});
