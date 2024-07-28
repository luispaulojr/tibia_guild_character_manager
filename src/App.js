import React, { useEffect, useState } from "react";
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');
const guildName = 'Gangue do Meubom';
const App = () => {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    socket.on('statusUpdate', (data) => {
      setCharacters((prev) => [...prev, data]);
    });

    return () => socket.off('statusUpdate');
  }, []);

  return (
      <div className="App">
          <div>
              <h1>{guildName} Guild Characters</h1>
              <ul>
                  {characters.map((char, index) => (
                      <li key={index}>{char.name} - {char.status}</li>
                  ))}
              </ul>
          </div>
      </div>
  );
};

export default App;
