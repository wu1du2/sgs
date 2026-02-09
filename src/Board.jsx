import React from 'react';
import { Card } from './Card';

// Hero Area Component
const HeroArea = ({ name = "General", hp = 4, skills = ["Strike", "Dodge"], portrait, isMe = false }) => (
  <div style={{
    width: '140px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#e0e0e0',
    pointerEvents: 'auto',
    border: '2px solid #8b4513', // Bronze/Wood border
    boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
    flexShrink: 0 // Prevent shrinking
  }}>
    {/* Avatar & Name Row */}
    <div style={{ display: 'flex', width: '100%', marginBottom: '8px', alignItems: 'center' }}>
      {/* Avatar */}
      <div style={{ 
        width: '50px', 
        height: '50px', 
        backgroundColor: '#555', 
        borderRadius: '4px',
        border: '1px solid #aaa',
        marginRight: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundImage: portrait ? `url(${portrait})` : 'none'
      }}>
        {!portrait && '👤'}
      </div>
      
      {/* Name & HP */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffd700' }}>{name}</div>
        <div style={{ fontSize: '12px', color: '#ff4444', letterSpacing: '1px' }}>
          {'♥'.repeat(hp)}
        </div>
      </div>
    </div>

    {/* Skills */}
    <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
      {skills.map((skill, i) => (
        <button key={i} style={{
          fontSize: '10px',
          padding: '2px 6px',
          backgroundColor: '#eecfa1',
          color: '#3e2723',
          border: '1px solid #8b4513',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: 1,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {skill}
        </button>
      ))}
    </div>

    {/* Equipment Slots */}
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
      {['Wpn', 'Arm', '+1', '-1'].map((slot, i) => (
        <div key={i} style={{ 
          height: '20px', 
          border: '1px dashed #666', 
          fontSize: '9px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#aaa',
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          {slot}
        </div>
      ))}
    </div>
  </div>
);

const GeneralSelection = ({ options, onSelect, onChange, changeUsed }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      color: 'white'
    }}>
      <h2 style={{ marginBottom: '40px', color: '#ffd700', textShadow: '0 0 10px #ff0000' }}>选择武将</h2>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((general, index) => (
          <div key={general.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ transform: 'scale(1.2)', marginBottom: '20px' }}>
              <HeroArea 
                name={general.name} 
                hp={general.hp} 
                skills={general.skills} 
                portrait={general.portrait}
              />
            </div>
            <button 
              onClick={() => onSelect(general.id)}
              style={{
                marginTop: '10px',
                padding: '10px 24px',
                backgroundColor: '#ffd700',
                color: '#8b4513',
                border: '2px solid #8b4513',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
              }}
            >
              SELECT
            </button>
            {!changeUsed[index] && (
              <button 
                onClick={() => onChange(general.id)}
                style={{
                  marginTop: '10px',
                  padding: '5px 12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: '1px solid #c0392b',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                CHANGE
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function CardBoard({ ctx, G, moves, playerID }) {
  const myPlayerID = playerID;
  const numPlayers = 3;

  // Responsive hand width state
  const [maxHandWidth, setMaxHandWidth] = React.useState(
    typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 40) : 600
  );

  // Update max width on resize
  React.useEffect(() => {
    const handleResize = () => {
      // Limit to 600px or screen width minus padding
      setMaxHandWidth(Math.min(600, window.innerWidth - 40));
    };
    
    window.addEventListener('resize', handleResize);
    // Initial calculation
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-ready when joining
  React.useEffect(() => {
    if (playerID && !G.readyPlayers.includes(playerID)) {
      moves.playerReady();
    }
  }, [playerID, G.readyPlayers, moves]);
  
  // Helper to get relative player positions
  // Returns: 'bottom' (me), 'right' (next player), 'left' (previous player)
  const getPosition = (id) => {
    if (id === myPlayerID) return 'bottom';
    if (id === (parseInt(myPlayerID) + 1) % numPlayers + "") return 'right';
    return 'left';
  };

  const onClickDraw = () => {
    if (G.phase === 'playing') {
      moves.drawCard();
    }
  };

  const onClickPlay = (cardIndex) => {
    if (G.phase === 'playing') {
      moves.playCard(cardIndex);
    }
  };

  const onAddMockPlayers = () => {
    moves.addMockPlayers();
  };

  const onSelectGeneral = (generalId) => {
    moves.selectGeneral(generalId);
  };

  const onChangeGeneral = (generalId) => {
    moves.changeGeneral(generalId);
  };

  // Render a player's hand area
  const renderPlayerArea = (id) => {
    const position = getPosition(id);
    const isMe = position === 'bottom';
    const hand = G.hands[id] || [];
    const isCurrentTurn = id === ctx.currentPlayer;
    const general = G.players[id]?.general;

    // Dynamic overlap calculation
    const CARD_WIDTH = 60;
    const DEFAULT_OVERLAP = 30;
    
    let marginLeft = -DEFAULT_OVERLAP;
    
    if (isMe && hand.length > 1) {
      const defaultTotalWidth = CARD_WIDTH + (hand.length - 1) * (CARD_WIDTH - DEFAULT_OVERLAP);
      if (defaultTotalWidth > maxHandWidth) {
        const visibleWidth = (maxHandWidth - CARD_WIDTH) / (hand.length - 1);
        marginLeft = -(CARD_WIDTH - visibleWidth);
      }
    }

    const areaStyle = {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      ...(position === 'bottom' && { bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '100%', pointerEvents: 'none' }), // Add width and pointerEvents
      ...(position === 'left' && { top: '40%', left: '20px', transform: 'translateY(-50%)' }),
      ...(position === 'right' && { top: '40%', right: '20px', transform: 'translateY(-50%)' }),
    };

    // Player Info Component
    const PlayerInfo = () => (
      <div style={{ 
        marginBottom: '10px', 
        padding: '5px 15px',
        backgroundColor: G.readyPlayers.includes(id) ? '#4CAF50' : 'rgba(0,0,0,0.5)',
        color: 'white',
        borderRadius: '20px',
        fontWeight: 'bold',
        boxShadow: isCurrentTurn ? '0 0 10px #ffd700' : 'none',
        border: isCurrentTurn ? '2px solid #ffd700' : 'none',
        pointerEvents: 'auto',
        textAlign: 'center',
        width: 'fit-content',
        alignSelf: 'center'
      }}>
        Player {id} {isMe ? '(You)' : ''} {G.readyPlayers.includes(id) ? '✓' : '...'}
      </div>
    );

    // Hand Cards Component
    const HandCards = () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        maxWidth: isMe ? '100%' : '200px', // Allow full width for calculation
        flexWrap: isMe ? 'nowrap' : 'wrap',
        pointerEvents: 'auto' // Re-enable pointer events
      }}>
        {hand.map((card, index) => (
          <div key={index} style={{ marginLeft: index === 0 ? 0 : `${marginLeft}px`, zIndex: index, transition: 'margin-left 0.3s ease' }}>
            <Card 
              card={card} 
              isHidden={!(isMe || G.isGameStarted)} // Show cards if game started (for debug) or if it's me
              onClick={() => isMe && onClickPlay(index)}
            />
          </div>
        ))}
      </div>
    );

    if (isMe) {
      return (
        <React.Fragment key={id}>
          <div style={areaStyle}>
            <HandCards />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 50
          }}>
            <PlayerInfo />
            <HeroArea 
              name={general ? general.name : "My Hero"} 
              hp={general ? general.hp : 4}
              skills={general ? general.skills : ["Strike", "Dodge"]}
              portrait={general ? general.portrait : null}
              isMe={true} 
            />
          </div>
        </React.Fragment>
      );
    }

    return (
      <div style={areaStyle}>
        {/* Hero Area for Left/Right players */}
        {!isMe && (
          <HeroArea 
            name={general ? general.name : `Player ${id}`}
            hp={general ? general.hp : 4}
            skills={general ? general.skills : ["Strike", "Dodge"]}
            portrait={general ? general.portrait : null}
          />
        )}
        
        <PlayerInfo />
        
        <HandCards />
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#2c3e50',
      backgroundImage: 'radial-gradient(circle at center, #34495e 0%, #2c3e50 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* General Selection Overlay */}
      {G.phase === 'selection' && G.generalOptions[playerID] && !G.players[playerID]?.general && (
        <GeneralSelection 
          options={G.generalOptions[playerID]} 
          onSelect={onSelectGeneral} 
          onChange={onChangeGeneral}
          changeUsed={G.generalChangeUsed[playerID] || [false, false, false]}
        />
      )}
      
      {/* Waiting for others overlay */}
      {G.phase === 'selection' && G.players[playerID]?.general && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Waiting for other players to select...
        </div>
      )}

      {/* Add Mock Players Button */}
      {G.phase === 'lobby' && myPlayerID === '0' && (
        <button
          onClick={onAddMockPlayers}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Add Mock Players
        </button>
      )}

      {/* Game Status Overlay */}
      {G.phase === 'lobby' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          zIndex: 100
        }}>
          Waiting for players ({G.readyPlayers.length}/3)...
        </div>
      )}

      {/* Deck Area */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: '20px'
      }}>
        {/* Draw Pile */}
        <div 
          onClick={onClickDraw}
          style={{
            width: '60px',
            height: '90px',
            backgroundColor: '#ecf0f1',
            borderRadius: '5px',
            border: '2px solid #bdc3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#7f8c8d' }}>
            Deck<br/>{G.deck.length}
          </div>
        </div>
      </div>

      {/* Render all players */}
      {['0', '1', '2'].map(id => renderPlayerArea(id))}
    </div>
  );
}