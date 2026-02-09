import React from 'react';
import { Card } from './Card';

// Hero Area Component
const HeroArea = ({ name = "General", hp = 4, skills = ["Strike", "Dodge"], portrait, isMe = false, role = 'neutral', onClick, isSelectable, isSelected }) => {
  const getBorderColor = () => {
    if (isSelected) return '#00ffff'; // Cyan for selected
    if (isSelectable) return '#ffff00'; // Yellow for selectable
    if (role === 'landlord') return '#ff0000'; // Red for Landlord
    if (role === 'peasant') return '#00ff00'; // Green for Peasant
    return '#8b4513'; // Default Bronze/Wood
  };

  const getBackgroundColor = () => {
    if (role === 'landlord') return 'rgba(50, 0, 0, 0.8)';
    if (role === 'peasant') return 'rgba(0, 50, 0, 0.8)';
    return 'rgba(0,0,0,0.7)';
  };

  return (
    <div 
      onClick={onClick}
      style={{
        width: '140px',
        backgroundColor: getBackgroundColor(),
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#e0e0e0',
        pointerEvents: 'auto',
        border: `2px solid ${getBorderColor()}`,
        boxShadow: isSelected ? '0 0 20px 5px #00ffff' : (isSelectable ? '0 0 10px #ffff00' : '0 4px 8px rgba(0,0,0,0.5)'),
        flexShrink: 0, // Prevent shrinking
        cursor: isSelectable ? 'pointer' : 'default',
        animation: isSelected ? 'pulse-selected 1.5s infinite' : (isSelectable ? 'pulse 1.5s infinite' : 'none'),
        transition: 'all 0.3s ease'
      }}
    >
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
          {/* Role Label */}
          <div style={{ fontSize: '10px', color: role === 'landlord' ? '#ffaaaa' : '#aaffaa', marginTop: '2px' }}>
            {role === 'landlord' ? 'Landlord' : 'Peasant'}
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
};

const GeneralSelection = ({ options, onSelect, onChange, changeUsed, onBid, landlord }) => {
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
      <h2 style={{ marginBottom: '20px', color: '#ffd700', textShadow: '0 0 10px #ff0000' }}>选择武将</h2>
      
      {/* Bidding Buttons */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>叫分:</span>
        {[100, 200, 300].map(amount => (
          <button
            key={amount}
            onClick={() => onBid(amount)}
            disabled={landlord !== null}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: landlord !== null ? '#555' : '#ffd700',
              color: landlord !== null ? '#aaa' : '#8b4513',
              border: '2px solid #8b4513',
              borderRadius: '8px',
              cursor: landlord !== null ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
            }}
          >
            {amount}
          </button>
        ))}
        {landlord !== null && <span style={{ color: '#ff4444', fontWeight: 'bold' }}>已有人叫地主!</span>}
      </div>

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

const ScoreBoard = ({ players, onWin, landlord }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (isCollapsed) {
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1500,
      }}>
        <button 
          onClick={() => setIsCollapsed(false)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: '#ffd700',
            border: '1px solid #ffd700',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          积分板 ▼
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: '10px',
      borderRadius: '8px',
      color: 'white',
      zIndex: 1500,
      border: '1px solid #ffd700',
      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#ffd700', fontSize: '16px' }}>积分板</h3>
        <button 
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 5px',
            lineHeight: 1
          }}
          title="收起"
        >
          ▲
        </button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        {Object.entries(players).map(([id, p]) => (
          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
            <span>
              玩家 {id} 
              {p.role === 'landlord' && <span style={{ color: '#ff4444', marginLeft: '4px' }}>(地主)</span>}
              {p.role === 'peasant' && <span style={{ color: '#4CAF50', marginLeft: '4px' }}>(农民)</span>}
            </span>
            <span style={{ fontWeight: 'bold', color: p.score >= 0 ? '#4CAF50' : '#ff4444', marginLeft: '10px' }}>
              {p.score}
            </span>
          </div>
        ))}
      </div>
      {landlord && (
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px', borderTop: '1px solid #555', paddingTop: '10px' }}>
          <button 
            onClick={() => onWin('landlord')} 
            style={{ 
              flex: 1,
              backgroundColor: '#ff4444', 
              color: 'white', 
              border: '1px solid #c0392b', 
              padding: '5px', 
              cursor: 'pointer', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            地主胜
          </button>
          <button 
            onClick={() => onWin('peasant')} 
            style={{ 
              flex: 1,
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: '1px solid #388E3C', 
              padding: '5px', 
              cursor: 'pointer', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            农民胜
          </button>
        </div>
      )}
    </div>
  );
};

const GameResultOverlay = ({ result, myPlayerID, onRematch, rematchVotes }) => {
  if (!result) return null;

  const myScoreChange = result.scoreChanges[myPlayerID];
  const isWin = myScoreChange > 0;
  const isDraw = myScoreChange === 0;
  
  let title = "败北";
  let color = "#ff4444";
  
  if (isWin) {
    title = "胜利";
    color = "#ffd700";
  } else if (isDraw) {
    title = "平局";
    color = "#aaa";
  }

  const hasVoted = rematchVotes.includes(myPlayerID);

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      color: 'white'
    }}>
      <h1 style={{ 
        fontSize: '64px', 
        color: color, 
        textShadow: `0 0 20px ${color}`,
        marginBottom: '20px'
      }}>
        {title}
      </h1>
      
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold',
        color: myScoreChange >= 0 ? '#4CAF50' : '#ff4444',
        marginBottom: '40px'
      }}>
        {myScoreChange > 0 ? '+' : ''}{myScoreChange}
      </div>

      <button
        onClick={onRematch}
        disabled={hasVoted}
        style={{
          padding: '15px 40px',
          fontSize: '24px',
          fontWeight: 'bold',
          backgroundColor: hasVoted ? '#555' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: hasVoted ? 'default' : 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.2s'
        }}
      >
        {hasVoted ? '等待其他玩家...' : '下一局'} ({rematchVotes.length}/3)
      </button>
    </div>
  );
};

const ActionLog = ({ logs }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Get last 3 logs for collapsed view
  const recentLogs = logs.slice(-3);

  if (isExpanded) {
    return (
      <>
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2999
          }}
          onClick={() => setIsExpanded(false)}
        />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid #ffd700',
          borderRadius: '8px',
          padding: '20px',
          zIndex: 3000,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 20px rgba(0,0,0,0.8)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #555', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#ffd700' }}>Action Log</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff4444',
                fontSize: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', fontSize: '14px', lineHeight: '1.6', fontFamily: 'monospace' }}>
            {logs.length === 0 ? (
              <div style={{ color: '#777', textAlign: 'center', marginTop: '20px' }}>No actions recorded yet.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '5px', borderBottom: '1px solid #333', paddingBottom: '2px' }}>
                  <span style={{ color: '#888', marginRight: '10px' }}>#{i + 1}</span>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div 
      onClick={() => setIsExpanded(true)}
      style={{
        width: '250px',
        height: '90px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid #7f8c8d',
        borderRadius: '5px',
        padding: '10px',
        color: '#e0e0e0',
        fontSize: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.2s'
      }}
      title="Click to view full log"
    >
      {recentLogs.length === 0 && <div style={{ color: '#777', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>No actions yet</div>}
      {recentLogs.map((log, i) => (
        <div key={i} style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          marginBottom: '2px',
          color: i === recentLogs.length - 1 ? '#fff' : '#aaa'
        }}>
          {log}
        </div>
      ))}
    </div>
  );
};

export function CardBoard({ ctx, G, moves, playerID }) {
  const myPlayerID = playerID;
  const numPlayers = 3;

  // Selection State
  const [selectedCardIndices, setSelectedCardIndices] = React.useState([]);
  const [selectedTargetIds, setSelectedTargetIds] = React.useState([]);
  const [lasers, setLasers] = React.useState([]); // Array of { from: pos, to: pos }

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

  // Reset selection when turn ends or phase changes
  React.useEffect(() => {
    setSelectedCardIndices([]);
    setSelectedTargetIds([]);
  }, [ctx.turn, G.phase]);

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

  const getCoordinates = (position) => {
    if (position === 'bottom') return { x: '50%', y: '80%' };
    if (position === 'left') return { x: '15%', y: '40%' };
    if (position === 'right') return { x: '85%', y: '40%' };
    return { x: '50%', y: '50%' };
  };

  const onClickDraw = () => {
    if (G.phase === 'playing') {
      moves.drawCard();
    }
  };

  const onCardClick = (index) => {
    if (G.phase !== 'playing') return;
    
    if (selectedCardIndices.includes(index)) {
      setSelectedCardIndices(selectedCardIndices.filter(i => i !== index));
    } else {
      setSelectedCardIndices([...selectedCardIndices, index]);
    }
  };

  const onHeroClick = (targetId) => {
    if (selectedCardIndices.length > 0) {
       if (selectedTargetIds.includes(targetId)) {
         setSelectedTargetIds(selectedTargetIds.filter(id => id !== targetId));
       } else {
         setSelectedTargetIds([...selectedTargetIds, targetId]);
       }
    }
  };

  const handlePlayCards = () => {
    if (selectedCardIndices.length === 0) return;
    
    if (selectedTargetIds.length > 0) {
      const fromPos = getCoordinates('bottom');
      const newLasers = selectedTargetIds.map(targetId => ({
        from: fromPos,
        to: getCoordinates(getPosition(targetId))
      }));
      setLasers(newLasers);
      setTimeout(() => setLasers([]), 1000);
    }

    moves.playCards(selectedCardIndices, selectedTargetIds);
    setSelectedCardIndices([]);
    setSelectedTargetIds([]);
  };

  const handleDiscardCards = () => {
    if (selectedCardIndices.length === 0) return;
    moves.discardCards(selectedCardIndices);
    setSelectedCardIndices([]);
    setSelectedTargetIds([]);
  };

  const onSelectGeneral = (generalId) => {
    moves.selectGeneral(generalId);
  };

  const onChangeGeneral = (generalId) => {
    moves.changeGeneral(generalId);
  };

  const onBid = (amount) => {
    moves.claimLandlord(amount);
  };

  const onResolveGame = (winnerRole) => {
    moves.resolveGame(winnerRole);
  };

  const onRematch = () => {
    moves.voteRematch();
  };

  // Render a player's hand area
  const renderPlayerArea = (id) => {
    const position = getPosition(id);
    const isMe = position === 'bottom';
    const hand = G.hands[id] || [];
    const isCurrentTurn = id === ctx.currentPlayer;
    const general = G.players[id]?.general;
    const role = G.players[id]?.role || 'neutral';

    // Target Selection Logic
    const isSelectable = selectedCardIndices.length > 0;
    const isSelected = selectedTargetIds.includes(id);

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
              onClick={() => isMe && onCardClick(index)}
              isSelected={isMe && selectedCardIndices.includes(index)}
            />
          </div>
        ))}
      </div>
    );

    if (isMe) {
      return (
        <React.Fragment key={id}>
          <div style={areaStyle}>
            {/* Action Buttons */}
            {selectedCardIndices.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px',
                animation: 'fadeIn 0.3s',
                pointerEvents: 'auto' // Enable clicks
              }}>
                <button 
                  onClick={handlePlayCards}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  出牌
                </button>
                <button 
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  装备
                </button>
                <button 
                  onClick={handleDiscardCards}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  弃牌
                </button>
              </div>
            )}
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
              role={role}
              onClick={() => onHeroClick(id)}
              isSelectable={isSelectable}
              isSelected={isSelected}
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
            role={role}
            onClick={() => onHeroClick(id)}
            isSelectable={isSelectable}
            isSelected={isSelected}
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
      {/* Laser Effect */}
      {lasers.map((laser, i) => (
        <svg key={i} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
          <line 
            x1={laser.from.x} 
            y1={laser.from.y} 
            x2={laser.to.x} 
            y2={laser.to.y} 
            stroke="#ff0000" 
            strokeWidth="4" 
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 5px #ff0000)' }}
          >
            <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="1" />
            <animate attributeName="stroke-width" values="4;1" dur="1s" repeatCount="1" />
          </line>
        </svg>
      ))}

      {/* General Selection Overlay */}
      {G.phase === 'selection' && G.generalOptions[playerID] && !G.players[playerID]?.general && (
        <GeneralSelection 
          options={G.generalOptions[playerID]} 
          onSelect={onSelectGeneral} 
          onChange={onChangeGeneral}
          changeUsed={G.generalChangeUsed[playerID] || [false, false, false]}
          onBid={onBid}
          landlord={G.landlord}
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

      {/* Scoreboard */}
      <ScoreBoard players={G.players} onWin={onResolveGame} landlord={G.landlord} />

      {/* Game Result Overlay */}
      <GameResultOverlay 
        result={G.gameResult} 
        myPlayerID={playerID} 
        onRematch={onRematch}
        rematchVotes={G.rematchVotes}
      />

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
        width: 0,
        height: 0,
        overflow: 'visible'
      }}>
        {/* Action Log - Exactly Center */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}>
           <ActionLog logs={G.actionLog || []} />
        </div>

        {/* Draw Pile - Left of Log */}
        <div 
          onClick={onClickDraw}
          style={{
            position: 'absolute',
            top: 0,
            right: '145px', // 125px (half log) + 20px gap
            transform: 'translateY(-50%)',
            width: '60px',
            height: '90px',
            backgroundColor: '#ecf0f1',
            borderRadius: '5px',
            border: '2px solid #bdc3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10
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