import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CardGame } from './Game';
import { CardBoard } from './Board';
import './App.css';

// In development, connect to the separate game server port (8000)
// In production, the client is served by the game server, so we connect to the same origin
const server = import.meta.env.DEV ? 'http://localhost:8000' : undefined;

const CardClient = Client({
  game: CardGame,
  board: CardBoard,
  multiplayer: SocketIO({ server }),
  numPlayers: 3,
  debug: false,
});

const App = () => {
  const [playerID, setPlayerID] = useState(null);
  const [inputValue, setInputValue] = useState('');

  if (playerID === null) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#2d5a27',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Enter Game</h1>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Player ID:</label>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 0, 1, 2"
            style={{ padding: '5px', borderRadius: '4px', border: 'none' }}
          />
        </div>
        <button 
          onClick={() => setPlayerID(inputValue)}
          disabled={!inputValue}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffd700',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Join Game
        </button>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#ccc' }}>
          Valid IDs: 0, 1, 2
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <CardClient playerID={playerID} matchID="default" />
      <button 
        onClick={() => setPlayerID(null)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '5px 10px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: '1px solid white',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Leave
      </button>
    </div>
  );
};

export default App;
