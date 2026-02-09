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
        <h1>Select Player</h1>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {[0, 1, 2].map((id) => (
            <button 
              key={id}
              onClick={() => setPlayerID(String(id))}
              style={{
                padding: '15px 30px',
                backgroundColor: '#ffd700',
                border: '2px solid #e6c200',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '18px',
                color: '#2d3436',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Player {id}
            </button>
          ))}
        </div>
        <p style={{ marginTop: '30px', fontSize: '14px', color: '#ccc' }}>
          Click a button to join as that player
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
          width: '24px',
          height: '24px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: '1px solid white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          padding: 0
        }}
      >
        L
      </button>
    </div>
  );
};

export default App;
