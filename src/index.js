const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const apiUrl = 'https://api.tibiadata.com/v4';
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow requests from the React app
        methods: ["GET", "POST"]
    }
});

const fetchCharacterData = async (characterName) => {
    try {
        const response = await axios.get(`${apiUrl}/character/${characterName}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching character data for ${characterName}:`, error);
        throw error;
    }
};

const fetchGuildData = async (guildName) => {
    try {
        const response = await axios.get(`${apiUrl}/guild/${guildName}`);
        console.log(`Guild data for ${guildName}:`, response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error(`Error fetching guild data for ${guildName}:`, error);
        throw error;
    }
};

app.get('/api/character/:name', async (req, res) => {
    const characterName = req.params.name;
    try {
        console.log(`Fetching data for ${characterName}`);
        const data = await fetchCharacterData(characterName);
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching character data');
    }
});

app.get('/api/guild/:name', async (req, res) => {
    const guildName = req.params.name;
    try {
        console.log(`Fetching data for ${guildName}`);
        const data = await fetchGuildData(guildName);
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching guild data');
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    // Function to check and emit status of guild members
    const checkGuildMembersStatus = async (guildName) => {
        try {
            const guildData = await fetchGuildData(guildName);
            if (guildData.guild && guildData.guild.members) {
                const members = guildData.guild.members;

                for (const member of members) {
                    const characterData = await fetchCharacterData(member.name);
                    if (characterData.character) {
                        const character = characterData.character.character;
                        socket.emit('statusUpdate', { name: member.name, status: member.status, level:  character.level, vocation: character.vocation, guild_rank: character.guild.rank });
                    } else {
                        console.error(`Character data for ${member.name} is missing 'data' property`);
                    }
                }
            } else {
                console.error(`Guild data for ${guildName} is missing 'guild' or 'members' property`);
            }
        } catch (error) {
            console.error('Error fetching guild members status:', error);
        }
    };

    // Check status of guild members every 60 seconds
    const guildName = "Gangue do Meubom"; // Replace with the actual guild name
    setInterval(() => checkGuildMembersStatus(guildName), 10000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
