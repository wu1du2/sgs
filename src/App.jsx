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
  const [userId, setUserId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [entered, setEntered] = useState(false);

  if (!entered) {
    const canEnter = userId.trim() && roomId.trim();
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f2f4f7',
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/images/generals/界徐盛.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>加入房间</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', width: '280px' }}>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="用户ID"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="房间号"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          <button
            onClick={() => canEnter && setEntered(true)}
            disabled={!canEnter}
            style={{
              padding: '12px 20px',
              backgroundColor: canEnter ? '#ffd700' : '#c8c8c8',
              border: '2px solid #e6c200',
              borderRadius: '8px',
              cursor: canEnter ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#2d3436',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}
          >
            进入
          </button>
        </div>
      </div>
    );
  }

  if (playerID === null) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f2f4f7',
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/images/generals/界徐盛.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>选择座位</h1>
        <div style={{ fontSize: '14px', color: '#eee', marginTop: '8px' }}>
          {userId} · 房间 {roomId}
        </div>
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
              座位 {id}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
      <CardClient playerID={playerID} matchID={roomId} userId={userId} roomId={roomId} enableLobby />
    </div>
  );
};

export default App;
