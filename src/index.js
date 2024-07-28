const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow requests from the React app
        methods: ["GET", "POST"]
    }
});

app.get('/api/character/:name', async (req, res) => {
    const characterName = req.params.name;
    try {
        const response = await axios.get(`https://api.tibiadata.com/v2/characters/${characterName}.json`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching character data');
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    // Simulate character status updates for testing
    setInterval(() => {
        socket.emit('statusUpdate', { name: 'CharacterName', status: 'online' });
    }, 5000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
