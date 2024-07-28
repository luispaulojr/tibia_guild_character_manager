import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const App = () => {
    const [characters, setCharacters] = useState([]);

    useEffect(() => {
        socket.on('statusUpdate', (data) => {
            setCharacters((prev) => {
                const index = prev.findIndex(char => char.name === data.name);
                if (index > -1) {
                    prev[index] = data;
                    return [...prev];
                }
                return [...prev, data];
            });
        });

        return () => socket.off('statusUpdate');
    }, []);

    return (
        <div>
            <h1>Gangue do Meubom Guild Characters</h1>
            <ul>
                {characters.map((char, index) => (
                    <li key={index}><span className={char.status === 'online' ? "online" : "offline"}>{char.status}</span> [{char.level}] {char.name} ({char.vocation}) - Rank: {char.guild_rank}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;
