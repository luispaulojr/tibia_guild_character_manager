const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const apiUrl = 'https://api.tibiadata.com/v4';
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./characters.db');

// Create table if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS characters (name TEXT PRIMARY KEY, role TEXT, location TEXT)");
});

const fetchCharacterData = async (characterName) => {
    try {
        const response = await axios.get(`${apiUrl}/character/${characterName}`);
        return response.data.character;
    } catch (error) {
        console.error(`Error fetching character data for ${characterName}:`, error);
        throw error;
    }
};

const fetchGuildData = async (guildName) => {
    try {
        const response = await axios.get(`${apiUrl}/guild/${guildName}`);
        return response.data.guild;
    } catch (error) {
        console.error(`Error fetching guild data for ${guildName}:`, error);
        throw error;
    }
};

const getCharacterDetails = (name, callback) => {
    db.get("SELECT role, location FROM characters WHERE name = ?", [name], (err, row) => {
        if (err) {
            console.error(`Error retrieving character details for ${name}:`, err);
            callback(err);
        } else {
            callback(null, row);
        }
    });
};

const updateCharacterDetails = (name, role, location) => {
    db.run("INSERT OR REPLACE INTO characters (name, role, location) VALUES (?, ?, ?)", [name, role, location], (err) => {
        if (err) {
            console.error(`Error updating character details for ${name}:`, err);
        } else {
            console.log(`Character details updated for ${name}: Role - ${role}, Location - ${location}`);
        }
    });
};

app.get('/api/character/:name', async (req, res) => {
    const characterName = req.params.name;
    try {
        const data = await fetchCharacterData(characterName);
        getCharacterDetails(characterName, (err, details) => {
            if (err) {
                res.status(500).send('Error fetching character details');
            } else {
                res.json({ ...data, ...details });
            }
        });
    } catch (error) {
        res.status(500).send('Error fetching character data');
    }
});

app.post('/api/character', (req, res) => {
    const { name, role, location } = req.body;
    console.log(`Received data: Name - ${name}, Role - ${role}, Location - ${location}`);
    updateCharacterDetails(name, role, location);
    res.status(200).send('Character details updated');
});

app.get('/api/guild/:name', async (req, res) => {
    const guildName = req.params.name;
    try {
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
            if (guildData && guildData.members) {
                const members = guildData.members;
                const batchSize = 10; // Batch size for incremental updates

                for (let i = 0; i < members.length; i += batchSize) {
                    const batch = members.slice(i, i + batchSize);
                    const characterPromises = batch.map(async member => {
                        const data = await fetchCharacterData(member.name);
                        data.character.status = member.status; // Ensure the status is included
                        return data;
                    });
                    const characterDataArray = await Promise.all(characterPromises);

                    characterDataArray.forEach((characterData) => {
                        if (characterData) {
                            getCharacterDetails(characterData.name, (err, details) => {
                                if (!err) {
                                    console.log(details)
                                    const status = characterData.status || 'unknown';
                                    socket.emit('statusUpdate', { ...characterData, ...details, status });
                                } else {
                                    console.error(`Character data is missing for a member(${characterData.name}) in the batch`);
                                }
                            });
                        } else {
                            console.error(`Character data is missing for a member(${characterData.name}) in the batch`);
                        }
                    });

                    await new Promise(resolve => setTimeout(resolve, 500)); // Delay next batch
                }

                socket.emit('loadingComplete'); // Notify client loading is complete
            } else {
                console.error(`Guild data for ${guildName} is missing 'members' property`);
            }
        } catch (error) {
            console.error('Error fetching guild members status:', error);
        }
    };

    socket.on('requestGuildStatus', async (guildName) => {
        console.log(`Requesting status for guild: ${guildName}`);
        await checkGuildMembersStatus(guildName);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
