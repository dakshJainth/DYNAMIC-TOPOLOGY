const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const nodes = {};
let currentTopology = "ring"; 

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'send_direct') {
        const { from, to, message } = data;
        handleMessageRouting(from, message, to);
      }
      

    if (data.type === 'register') {
      nodes[data.id] = ws;
      console.log(`✅ Registered ${data.id}`);
    }

    if (data.type === 'send') {
      handleMessageRouting(data.from, data.message);
    }
  });
});

// Message Routing Based on Topology
function handleMessageRouting(from, message, to = null) {
    const ids = Object.keys(nodes).sort();
  
    // 📦 Direct messaging support
    if (to && nodes[to]) {
      console.log(`[${from}] -> ${message} -> [${to}]`);
      nodes[to].send(JSON.stringify({ from, message }));
      return;
    }
  
    // 🧠 AI-Like Topology Decision
    let effectiveTopology = currentTopology;
  
    // if (message.toLowerCase().includes('alert')) {
    //   effectiveTopology = 'broadcast';
    // } else if (ids.length >= 10) {
    //   effectiveTopology = 'mesh';
    // } else if (ids.length >= 7) {
    //   effectiveTopology = 'tree';
    // } else if (ids.length >= 4) {
    //   effectiveTopology = 'star';
    // } else {
    //   effectiveTopology = 'ring';
    // }
  
    console.log(`AI Topology Decision: ${effectiveTopology} (from ${from})`);
  
    switch (effectiveTopology) {
      case 'ring': {
        const idx = ids.indexOf(from);
        const next = ids[(idx + 1) % ids.length];
        console.log(`[${from}] -> ${message} -> [${next}]`);
        nodes[next]?.send(JSON.stringify({ from, message }));
        break;
      }
    
      case 'broadcast': {
        ids.forEach(id => {
          if (id !== from) {
            console.log(`[${from}] -> ${message} -> [${id}]`);
            nodes[id]?.send(JSON.stringify({ from, message }));
          }
        });
        break;
      }
    
      case 'star': {
        const center = 'node1'; // fixed center node
        if (from === center) {
          ids.forEach(id => {
            if (id !== center) {
              console.log(`[${from}] -> ${message} -> [${id}]`);
              nodes[id]?.send(JSON.stringify({ from, message }));
            }
          });
        } else {
          console.log(`[${from}] -> ${message} -> [${center}]`);
          nodes[center]?.send(JSON.stringify({ from, message }));
        }
        break;
      }
    
      case 'mesh': {
        ids.forEach(id => {
          if (id !== from) {
            console.log(`[${from}] -> ${message} -> [${id}]`);
            nodes[id]?.send(JSON.stringify({ from, message }));
          }
        });
        break;
      }
    
      case 'tree': {
        const tree = buildBinaryTree(ids);
        const children = tree[from] || [];
        children.forEach(child => {
          console.log(`[${from}] -> ${message} -> [${child}]`);
          nodes[child]?.send(JSON.stringify({ from, message }));
        });
        break;
      }
    
      default: {
        console.log(`⚠ Unknown topology: ${effectiveTopology}`);
        break;
      }
    }
  }
  

// Create Binary Tree Topology
function buildBinaryTree(ids) {
  const tree = {};
  ids.forEach((id, i) => {
    const left = ids[2 * i + 1];
    const right = ids[2 * i + 2];
    tree[id] = [left, right].filter(Boolean);
  });
  return tree;
}

// Routes

// GET home page
app.get('/', (req, res) => {
  res.send('🌐 Dynamic Topology Management Server is Running');
});

// Set the current topology
app.post('/topology', (req, res) => {
  const { topology } = req.body;

  if (!topology || !['ring', 'broadcast', 'star', 'mesh', 'tree'].includes(topology)) {
    return res.status(400).json({ error: "Invalid topology type." });
  }

  currentTopology = topology;
  console.log("Topology set to:", currentTopology);
  res.status(200).json({ message: `Topology set to ${topology}` });
});

// Send a message
app.post('/sendmessage', (req, res) => {
  const { from, message } = req.body;

  if (!from || !message) {
    return res.status(400).json({ error: "Missing 'from' or 'message' field." });
  }

  handleMessageRouting(from, message);
  res.status(200).json({ message:"Message sent from here!!"});
});

// Send a message
app.post('/send', (req, res) => {
    const { from, message, to } = req.body;
  
    if (!from || !message) {
      return res.status(400).json({ error: "Missing 'from' or 'message' field." });
    }
  
    handleMessageRouting(from, message, to);  // include `to` if provided
    res.status(200).json({ message: "Message sent from here!!" });
  });
  

// Start server (API + WebSocket)
server.listen(5050, () => {
  console.log("Server (API + WebSocket) running at http://localhost:5050");
});
