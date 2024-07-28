const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const apiUrl = 'https://api.tibiadata.com/v4';
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const fetchCharacterData = async (characterName) => {
    try {
        const response = await axios.get(`${apiUrl}/character/${characterName}`);
        console.log(`Character data for ${characterName}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching character data for ${characterName}:`, error);
        throw error;
    }
};

const fetchGuildData = async (guildName) => {
    try {
        const response = await axios.get(`${apiUrl}/guild/${guildName}`);
        console.log(`Guild data for ${guildName}:`, response.data);
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

    const checkGuildMembersStatus = async (guildName) => {
        try {
            const guildData = await fetchGuildData(guildName);
            if (guildData.guild && guildData.guild.members) {
                const members = guildData.guild.members;
                const batchSize = 10;

                for (let i = 0; i < members.length; i += batchSize) {
                    const batch = members.slice(i, i + batchSize);
                    const characterPromises = batch.map(member => fetchCharacterData(member.name));
                    const characterDataArray = await Promise.all(characterPromises);

                    characterDataArray.forEach((characterData, index) => {
                        if (characterData.character) {
                            characterData.character.character.status = batch[index].status || 'unknown';
                            socket.emit('statusUpdate', characterData.character );
                            console.log(characterData.character.character)
                        } else {
                            console.error(`Character data for ${batch[index].name} is missing 'character' property`);
                        }
                    });

                    await new Promise(resolve => setTimeout(resolve, 500)); // Delay next batch
                }

                socket.emit('loadingComplete'); // Notify client loading is complete
            } else {
                console.error(`Guild data for ${guildName} is missing 'guild' or 'members' property`);
            }
        } catch (error) {
            console.error('Error fetching guild members status:', error);
        }
    };

    const guildName = "Gangue do Meubom";
    setInterval(() => checkGuildMembersStatus(guildName), 60000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Initial load
    checkGuildMembersStatus(guildName);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
