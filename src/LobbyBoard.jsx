import React from 'react';

export const LobbyBoard = ({ G, ctx, moves, playerID, setPlayerID, roomId, userId, setUserId }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(userId);

  const handleStartGame = () => {
    // Find first available seat
    const lobbySeats = ['0', '1', '2'];
    const availableSeat = lobbySeats.find(id => !G.players?.[id]?.userId);
    
    // If available, take it. If not (full), try to join a random seat.
    // The backend prevents overwriting occupied seats, so this is safe.
    // This implements "First come, first served" without blocking the user.
    const seatToJoin = availableSeat || lobbySeats[Math.floor(Math.random() * lobbySeats.length)];
    
    setPlayerID(seatToJoin);
  };

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
      <h1 style={{ 
        textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
        marginBottom: '60px',
        fontSize: '48px'
      }}>
        三国杀
      </h1>
      
      <button 
        onClick={handleStartGame}
        style={{
          padding: '10px 30px',
          backgroundColor: '#e74c3c',
          border: '2px solid #c0392b',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          color: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
          transform: 'scale(1)',
          transition: 'all 0.2s ease',
          textShadow: '0 1px 1px rgba(0,0,0,0.3)',
          letterSpacing: '2px'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ff5e4d';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#e74c3c';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        开始游戏
      </button>
      
      <div style={{ marginTop: '40px', color: '#eee', textShadow: '1px 1px 2px black', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>当前身份:</span>
        {isEditing ? (
          <input 
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              if (tempName.trim()) {
                setUserId(tempName.trim());
              } else {
                setTempName(userId);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(false);
                if (tempName.trim()) {
                  setUserId(tempName.trim());
                } else {
                  setTempName(userId);
                }
              }
            }}
            autoFocus
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '16px'
            }}
          />
        ) : (
          <span 
            onClick={() => {
              setTempName(userId);
              setIsEditing(true);
            }}
            style={{ 
              cursor: 'pointer',
              borderBottom: '1px dashed #eee',
              paddingBottom: '2px'
            }}
            title="点击修改ID"
          >
            {userId}
          </span>
        )}
      </div>
    </div>
  );
};
