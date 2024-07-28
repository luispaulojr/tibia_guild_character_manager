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
        console.log(`Fetching data for ${characterName}`);
        const response = await axios.get(`https://api.tibiadata.com/v4/character/${characterName}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching character data');
    }
});

app.get('/api/guild/:name', async (req, res) => {
    const guildName = req.params.name;
    try {
        console.log(`Fetching data for ${guildName}`);
        const response = await axios.get(`https://api.tibiadata.com/v4/guild/${guildName}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching guild data');
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
