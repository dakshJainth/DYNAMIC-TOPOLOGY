function setTopology(topology) {
    fetch('http://localhost:3000/topology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topology })
    }).then(() => alert("Topology changed to " + topology));
  }
  
  function sendMessage() {
    const from = document.getElementById('fromNode').value;
    const msg = document.getElementById('msg').value;
  
    fetch(`http://localhost:3000/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, message: msg })
    });
  }
  