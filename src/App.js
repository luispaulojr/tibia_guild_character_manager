import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');

const App = () => {
    const [characters, setCharacters] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [guildName] = useState('Gangue do Meubom'); // Default guild name

    useEffect(() => {
        const handleStatusUpdate = (data) => {
            setCharacters((prev) => {
                const index = prev.findIndex(char => char.character.name === data.character.name);
                if (index > -1) {
                    const updatedCharacters = [...prev];
                    updatedCharacters[index] = data;
                    return updatedCharacters;
                }
                return [...prev, data];
            });
        };

        const handleLoadingComplete = () => {
            setLoading(false);
        };

        socket.on('statusUpdate', handleStatusUpdate);
        socket.on('loadingComplete', handleLoadingComplete);

        socket.emit('requestGuildStatus', guildName); // Request status updates for the guild

        return () => {
            socket.off('statusUpdate', handleStatusUpdate);
            socket.off('loadingComplete', handleLoadingComplete);
        };
    }, [guildName]); // Re-run effect when guildName changes

    const allCount = characters.length;
    const onlineCount = characters.filter(char => char.character.status === 'online').length;
    const offlineCount = characters.filter(char => char.character.status === 'offline').length;

    const filteredCharacters = characters.filter(char => {
        if (filter === 'all') return true;
        return char.character.status === filter;
    });

    const renderTable = (vocation) => (
        <table className="character-table">
            <thead>
            <tr>
                <th>Name</th>
                <th>Level</th>
                <th>Vocation</th>
                <th>Status</th>
                <th>Guild Rank</th>
            </tr>
            </thead>
            <tbody>
            {filteredCharacters
                .filter(char => char.character.vocation.includes(vocation))
                .map((char, index) => (
                    <tr key={index} className={char.character.status === 'online' ? "online" : "offline"}>
                        <td>{char.character.name}</td>
                        <td>{char.character.level}</td>
                        <td>{char.character.vocation}</td>
                        <td>{char.character.status}</td>
                        <td>{char.character.guild.rank}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="app-container">
            <h1>{guildName} Guild Characters</h1>
            <div className="filter-buttons">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
                    All ({allCount})
                </button>
                <button onClick={() => setFilter('online')} className={filter === 'online' ? 'active' : ''}>
                    Online ({onlineCount})
                </button>
                <button onClick={() => setFilter('offline')} className={filter === 'offline' ? 'active' : ''}>
                    Offline ({offlineCount})
                </button>
            </div>
            {loading && (
                <div className="loading">Loading...</div>
            )}
            <div className="tables-container">
                {['Knight', 'Paladin', 'Sorcerer', 'Druid'].map(vocation => (
                    <div key={vocation} className="vocation-section">
                        <h2>{vocation}</h2>
                        {renderTable(vocation)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
