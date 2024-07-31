import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { FaBomb, FaBullseye, FaGamepad, FaUser, FaClipboard } from 'react-icons/fa';
import tibiaLogo from './assets/tibia-logo-artwork-top.gif'
import { GiChicken } from 'react-icons/gi';
import './App.css';
import { DateTime } from 'luxon';

const apiUrl = 'http://localhost:4000';
const socket = io(apiUrl);

const roleIcons = {
    MWALLER: <img src="https://www.tibiawiki.com.br/images/f/f7/Magic_Wall2.gif" alt="MWALLER" className="gif-icon" />,
    BOMB: <FaBomb title="BOMB" />,
    FOCUS: <FaBullseye title="FOCUS" />,
    CHICKEN: <GiChicken title="CHICKEN" />,
    PROPLAYER: <FaGamepad title="PROPLAYER" />,
    MAKER: <span className="maker-icon" title="MAKER">MK</span>,
    MAINCHAR: <FaUser title="MAINCHAR" />
};

const roleOptions = [
    'MWALLER',
    'BOMB',
    'FOCUS',
    'CHICKEN',
    'PROPLAYER',
    'MAKER',
    'MAINCHAR'
];

const App = () => {
    const [characters, setCharacters] = useState([]);
    const [roleFilter, setRoleFilter] = useState('allRoles');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [guildName] = useState('<GUILD_NAME>'); // Define the guild name

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
    }, [guildName]);

    const vocationAbbreviations = (vocation) => {
        const vocations = {
            'Elder Druid': 'ED',
            'Master Sorcerer': 'MS',
            'Elite Knight': 'EK',
            'Royal Paladin': 'RP',
            'Druid': 'D',
            'Sorcerer': 'S',
            'Knight': 'K',
            'Paladin': 'P'
        };
        return vocations[vocation] || vocation;
    };

    const handleRoleChange = (name, newRole) => {
        setCharacters(prev => prev.map(char => char.character.name === name ? { ...char, role: newRole } : char));
        console.log(`Updated role for ${name} to ${newRole}`);
        fetch(`${apiUrl}/api/character`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, role: newRole, location: characters.find(char => char.character.name === name).location })
        }).then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));
    };

    const handleLocationChange = (name, newLocation) => {
        setCharacters(prev => prev.map(char => char.character.name === name ? { ...char, location: newLocation } : char));
        console.log(`Updated location for ${name} to ${newLocation}`);
        fetch(`${apiUrl}/api/character`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, role: characters.find(char => char.character.name === name).role, location: newLocation })
        }).then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));
    };

    const handleExivaClick = (name) => {
        navigator.clipboard.writeText(`exiva "${name}"`);
    };

    const calculateTimeOnline = (lastLoginBRT) => {
        const lastLogin = DateTime.fromISO(lastLoginBRT);
        const now = DateTime.now().setZone('America/Sao_Paulo');
        const diff = now.diff(lastLogin, ['hours', 'minutes']).toObject();
        return `${Math.floor(diff.hours)}h ${Math.floor(diff.minutes)}m`;
    };

    const filteredCharacters = characters.filter(char => {
        if (roleFilter !== 'allRoles' && char.role !== roleFilter) return false;
        if (statusFilter === 'all') return true;
        return char.character.status === statusFilter;
    });

    const filteredAllCount = filteredCharacters.length;
    const filteredOnlineCount = filteredCharacters.filter(char => char.character.status === 'online').length;
    const filteredOfflineCount = filteredCharacters.filter(char => char.character.status === 'offline').length;

    const renderTable = (vocation) => (
        <table className="character-table">
            <thead>
            <tr>
                <th>Exiva</th>
                <th>Name</th>
                <th>Level</th>
                <th>Vocation</th>
                <th>Status</th>
                <th>Guild Rank</th>
                <th>Role</th>
                <th>Location</th>
                <th>Time Online</th>
            </tr>
            </thead>
            <tbody>
            {filteredCharacters
                .filter(char => char.character.vocation.includes(vocation))
                .map((char, index) => (
                    <tr key={index} className={char.character.status === 'online' ? "online" : "offline"}>
                        <td className="center-icon">
                            <button onClick={() => handleExivaClick(char.character.name)}>
                                <FaClipboard />
                            </button>
                        </td>
                        <td>{char.character.name}</td>
                        <td>{char.character.level}</td>
                        <td>{vocationAbbreviations(char.character.vocation)}</td>
                        <td>{char.character.status}</td>
                        <td>{char.character.guild.rank}</td>
                        <td className="center-icon">
                            <div className="role-icon-wrapper">
                                {char.role && roleOptions.includes(char.role) ? (
                                    <span
                                        className="role-icon"
                                        onClick={() => {
                                            const newRole = prompt("Enter new role:", char.role);
                                            if (roleOptions.includes(newRole)) {
                                                handleRoleChange(char.character.name, newRole);
                                            } else {
                                                alert("Invalid role");
                                            }
                                        }}
                                    >
                                        {roleIcons[char.role]}
                                    </span>
                                ) : (
                                    <select onChange={(e) => handleRoleChange(char.character.name, e.target.value)} value="">
                                        <option value="" disabled>Select role</option>
                                        {roleOptions.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                )}
                                <span className="tooltip">{char.role}</span>
                            </div>
                        </td>
                        <td>
                            <input
                                type="text"
                                value={char.location || ''}
                                onChange={(e) => handleLocationChange(char.character.name, e.target.value)}
                                placeholder="Enter location"
                            />
                        </td>
                        <td>{char.character.last_login_brt ? calculateTimeOnline(char.character.last_login_brt) : 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="app-container">
            <img src={tibiaLogo} className="app-logo" alt="Tibia Logo"/>
            <h1 className="guild-title">{guildName} Guild Characters</h1>
            <div className="filter-buttons">
                <button onClick={() => setRoleFilter('allRoles')} className={roleFilter === 'allRoles' ? 'active' : ''}>
                    All Roles
                </button>
                {roleOptions.map(role => (
                    <button key={role} onClick={() => setRoleFilter(role)}
                            className={roleFilter === role ? 'active' : ''}>
                        {role}
                    </button>
                ))}
            </div>
            <div className="filter-buttons">
                <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'active' : ''}>
                    All ({filteredAllCount})
                </button>
                <button onClick={() => setStatusFilter('online')} className={statusFilter === 'online' ? 'active' : ''}>
                    Online ({filteredOnlineCount})
                </button>
                <button onClick={() => setStatusFilter('offline')}
                        className={statusFilter === 'offline' ? 'active' : ''}>
                    Offline ({filteredOfflineCount})
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
