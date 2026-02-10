import React from 'react';
import { Card } from './Card';
import { SGS_CARDS } from './sgs_data';
import { calculateDistance } from './Game';

// Helper for suit colors
const getSuitColor = (suit) => {
  if (suit === '♥') return '#d63031'; // Red
  if (suit === '♦') return '#0984e3'; // Blue
  if (suit === '♣') return '#00b894'; // Green
  if (suit === '♠') return '#b2bec3'; // Light Grey for dark backgrounds (Log/Ticker)
  return '#fff';
};

const CardSelectionModal = ({ targetPlayer, targetHand, onConfirm, onCancel, title, singleSelection }) => {
  const [selected, setSelected] = React.useState([]);

  const toggleSelection = (item) => {
    const exists = selected.find(s => s.type === item.type && s.index === item.index && s.slot === item.slot);
    if (exists) {
      setSelected(selected.filter(s => s !== exists));
    } else {
      if (singleSelection) {
        setSelected([item]);
      } else {
        setSelected([...selected, item]);
      }
    }
  };

  const isSelected = (type, indexOrSlot) => {
    return selected.some(s => s.type === type && (s.index === indexOrSlot || s.slot === indexOrSlot));
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      color: 'white',
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        width: '80%',
        maxWidth: '800px',
        maxHeight: '80%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Hand Cards */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {targetHand.map((card, index) => (
              <div
                key={index}
                onClick={() => toggleSelection({ type: 'hand', index })}
                style={{
                  width: '60px',
                  height: '90px',
                  backgroundColor: isSelected('hand', index) ? 'rgba(0, 255, 255, 0.3)' : '#555',
                  border: isSelected('hand', index) ? '3px solid #00ffff' : '1px solid #aaa',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected('hand', index) ? '0 0 15px #00ffff' : 'none',
                  animation: isSelected('hand', index) ? 'pulse-selected 1.5s infinite' : 'none',
                  color: '#aaa',
                  fontSize: '12px'
                }}
              >
                Card Back
              </div>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(targetPlayer.equipments).map(([slot, card]) => {
              if (!card) return null;
              return (
                <div
                  key={slot}
                  onClick={() => toggleSelection({ type: 'equip', slot })}
                  style={{
                    padding: '10px',
                    backgroundColor: isSelected('equip', slot) ? 'rgba(0, 255, 255, 0.3)' : '#444',
                    border: isSelected('equip', slot) ? '3px solid #00ffff' : '1px solid #aaa',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: isSelected('equip', slot) ? '0 0 15px #00ffff' : 'none',
                    animation: isSelected('equip', slot) ? 'pulse-selected 1.5s infinite' : 'none'
                  }}
                >
                  {card.name} ({slot})
                </div>
              );
            })}
          </div>
        </div>

        {/* Judgments */}
        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(targetPlayer.judges).map(([slot, card]) => {
              if (!card) return null;
              return (
                <div
                  key={slot}
                  onClick={() => toggleSelection({ type: 'judge', slot })}
                  style={{
                    padding: '10px',
                    backgroundColor: isSelected('judge', slot) ? 'rgba(0, 255, 255, 0.3)' : '#444',
                    border: isSelected('judge', slot) ? '3px solid #00ffff' : '1px solid #aaa',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: isSelected('judge', slot) ? '0 0 15px #00ffff' : 'none',
                    animation: isSelected('judge', slot) ? 'pulse-selected 1.5s infinite' : 'none'
                  }}
                >
                  {card.name} ({slot})
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => onConfirm(selected)} 
            disabled={selected.length === 0}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: selected.length > 0 ? '#4CAF50' : '#555', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: selected.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Hero Area Component
const HeroArea = ({ name = "General", hp = 4, hpMax = 4, skills = ["Strike", "Dodge"], portrait, isMe = false, role = 'neutral', onClick, isSelectable, isSelected, equipments = {}, onEquipClick, onModifyHP, judges = {}, onToggleJudgment, onSkillClick, scale = 1, handCount = 0, isLinked = false, onToggleChain }) => {
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
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
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
        transition: 'all 0.3s ease',
        position: 'relative' // Ensure overlay is positioned correctly
      }}
    >
      {/* Chain Effect Icon */}
      {isLinked && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          zIndex: 10,
          fontSize: '20px',
          filter: 'drop-shadow(0 0 2px black)'
        }}>
          🔗
        </div>
      )}

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
          <div style={{ fontSize: '12px', color: '#ff4444', letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '4px' }}>
              {'♥'.repeat(hp)}
              <span style={{ color: '#ff4444', opacity: 0.5 }}>{'♡'.repeat(Math.max(0, hpMax - hp))}</span>
            </span>
            
            {/* HP Modification Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginLeft: '4px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onModifyHP && onModifyHP(1); }}
                style={{
                  width: '12px',
                  height: '12px',
                  fontSize: '8px',
                  padding: 0,
                  lineHeight: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
                title="+1 HP"
              >
                +
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onModifyHP && onModifyHP(-1); }}
                style={{
                  width: '12px',
                  height: '12px',
                  fontSize: '8px',
                  padding: 0,
                  lineHeight: '10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
                title="-1 HP"
              >
                -
              </button>
            </div>
          </div>
          {/* Hand Count */}
          <div style={{ fontSize: '12px', color: '#fff', marginTop: '2px', fontWeight: 'bold' }}>
            手牌 {handCount}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
        {skills.map((skill, i) => (
          <button 
            key={i} 
            onClick={(e) => {
              e.stopPropagation();
              onSkillClick && onSkillClick(skill);
            }}
            style={{
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
            }}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Equipment Slots */}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {[
          { label: 'Wpn', key: 'weapon', icon: '⚔️' },
          { label: 'Arm', key: 'armor', icon: '🛡️' },
          { label: '+1', key: 'plusOne', icon: '🐎' },
          { label: '-1', key: 'minusOne', icon: '🐎' }
        ].map((slot, i) => {
          const equip = equipments[slot.key];
          return (
            <div 
              key={i} 
              onClick={(e) => {
                if (isMe && equip && onEquipClick) {
                  e.stopPropagation();
                  onEquipClick(slot.key);
                }
              }}
              style={{ 
                height: '20px', 
                border: '1px dashed #666', 
                fontSize: '9px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: equip ? '#ffd700' : '#aaa',
                backgroundColor: equip ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                cursor: (isMe && equip) ? 'pointer' : 'default',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                padding: '0 2px'
              }}
              title={equip ? equip.name : slot.label}
            >
              {equip ? equip.name : slot.label}
            </div>
          );
        })}
      </div>

      {/* Judgment Area */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '4px', gap: '2px' }}>
        {[
          { label: '兵', key: 'bing', color: '#3498db' },
          { label: '乐', key: 'le', color: '#e74c3c' },
          { label: '电', key: 'dian', color: '#9b59b6' }
        ].map((item) => {
          const card = judges[item.key];
          const isActive = !!card;
          return (
            <div
              key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                onToggleJudgment && onToggleJudgment(item.key);
              }}
              style={{
                flex: 1,
                height: '20px',
                backgroundColor: item.color,
                opacity: isActive ? 1 : 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                borderRadius: '4px',
                cursor: isActive ? 'pointer' : 'default',
                border: isActive ? '1px solid white' : '1px solid transparent',
                boxShadow: isActive ? `0 0 5px ${item.color}` : 'none',
                transition: 'all 0.2s',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
              title={isActive ? `${card.suit}${card.rank} ${card.name}` : item.label}
            >
              {isActive ? `${card.suit}${card.rank}` : item.label}
            </div>
          );
        })}
        {/* Chain Button */}
        <div
            onClick={(e) => {
                e.stopPropagation();
                onToggleChain && onToggleChain();
            }}
            style={{
                flex: 1,
                height: '20px',
                backgroundColor: isLinked ? '#2c3e50' : 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: isLinked ? '#ffd700' : '#aaa',
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'all 0.2s',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
            }}
            title="连环"
        >
            连
        </div>
      </div>
    </div>
  );
};

const GeneralSelection = ({ options, onSelect, onChange, changeUsed, onBid, landlord }) => {
  const isCompact = typeof window !== 'undefined' && window.innerWidth <= 700;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      zIndex: 2000,
      color: 'white',
      padding: '12px 10px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      {/* Bidding Buttons */}
      <div style={{ marginBottom: isCompact ? '12px' : '20px', display: 'flex', gap: isCompact ? '10px' : '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: isCompact ? '14px' : '18px', fontWeight: 'bold' }}>叫分:</span>
        {[100, 200, 300].map(amount => (
          <button
            key={amount}
            onClick={() => onBid(amount)}
            disabled={landlord !== null}
            style={{
              padding: isCompact ? '6px 12px' : '10px 20px',
              fontSize: isCompact ? '14px' : '16px',
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
        {landlord !== null && <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: isCompact ? '12px' : '14px' }}>已有人叫地主!</span>}
      </div>

      <div style={{ display: 'flex', gap: isCompact ? '16px' : '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((general, index) => (
          <div key={general.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ transform: `scale(${isCompact ? 1 : 1.1})`, marginBottom: isCompact ? '10px' : '16px' }}>
              <HeroArea 
                name={general.name} 
                hp={general.hp} 
                hpMax={general.hpMax}
                skills={general.skills} 
                portrait={general.portrait}
              />
            </div>
            <button 
              onClick={() => onSelect(general.id)}
              style={{
                marginTop: isCompact ? '6px' : '10px',
                padding: isCompact ? '6px 14px' : '10px 24px',
                backgroundColor: '#ffd700',
                color: '#8b4513',
                border: '2px solid #8b4513',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isCompact ? '14px' : '16px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
              }}
            >
              SELECT
            </button>
            {!changeUsed[index] && (
              <button 
                onClick={() => onChange(general.id)}
                style={{
                  marginTop: isCompact ? '6px' : '10px',
                  padding: isCompact ? '4px 10px' : '5px 12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: '1px solid #c0392b',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isCompact ? '11px' : '12px',
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

const ScoreBoard = ({ players, onWin, landlord, scale = 1 }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  if (isCollapsed) {
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1500,
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
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
      minWidth: '200px',
      transform: `scale(${scale})`,
      transformOrigin: 'top left'
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
              {p.role === 'landlord' && <span style={{ color: '#ff4444', marginLeft: '4px' }}>地主</span>}
              {p.role === 'peasant' && <span style={{ color: '#4CAF50', marginLeft: '4px' }}>农民</span>}
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

const ActionTicker = ({ logs }) => {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (logs && logs.length > 0) {
      setMessage(logs[logs.length - 1]);
      setVisible(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 1000);
    }
  }, [logs]);

  if (!visible) return null;

  // Parse message to find card names and suits
  const renderMessage = () => {
    // Get all unique card names, sorted by length descending to match longest first
    const cardNames = [...new Set(SGS_CARDS.map(c => c.name))].sort((a, b) => b.length - a.length);
    
    // Create a regex pattern for card names AND suits
    // Matches: Card Names OR Suit+Rank (e.g., ♥ 6) OR just Suit
    const pattern = new RegExp(`(${cardNames.join('|')}|[♠♥♣♦]\\s?[A-Z0-9]+|[♠♥♣♦])`, 'g');
    
    const parts = message.split(pattern);
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
        {parts.map((part, i) => {
          if (!part) return null;
          
          if (cardNames.includes(part)) {
            return (
              <span key={i} style={{ color: '#ffd700', fontWeight: 'bold' }}>
                {part}
              </span>
            );
          }
          
          // Check for Suit
          if (part.match(/[♠♥♣♦]/)) {
             const suit = part.match(/[♠♥♣♦]/)[0];
             const color = getSuitColor(suit);
             return (
               <span key={i} style={{ color: color, fontWeight: 'bold', fontSize: '18px' }}>
                 {part}
               </span>
             );
          }

          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%', // Position above the parent
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '20px',
      marginBottom: '10px',
      whiteSpace: 'nowrap',
      zIndex: 100,
      pointerEvents: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      border: '1px solid #ffd700'
    }}>
      {renderMessage()}
    </div>
  );
};

const ACTION_LOG_HEIGHT = 90;

const ActionLog = ({ logs }) => {
  const [viewMode, setViewMode] = React.useState('minimized'); // 'minimized', 'normal', 'expanded'

  // Get last 3 logs for collapsed view
  const recentLogs = logs.slice(-3);

  const renderLogText = (text) => {
    const cardNames = [...new Set(SGS_CARDS.map(c => c.name))].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${cardNames.join('|')}|[♠♥♣♦]\\s?[A-Z0-9]+|[♠♥♣♦])`, 'g');
    const parts = text.split(pattern);

    return parts.map((part, i) => {
      if (!part) return null;
      
      if (cardNames.includes(part)) {
        return <span key={i} style={{ color: '#ffd700', fontWeight: 'bold' }}>{part}</span>;
      }
      
      if (part.match(/[♠♥♣♦]/)) {
         const suit = part.match(/[♠♥♣♦]/)[0];
         const color = getSuitColor(suit);
         return <span key={i} style={{ color: color, fontWeight: 'bold' }}>{part}</span>;
      }
      
      return <span key={i}>{part}</span>;
    });
  };

  if (viewMode === 'expanded') {
    return (
      <>
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2999
          }}
          onClick={() => setViewMode('normal')}
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
              onClick={() => setViewMode('normal')}
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
                  {renderLogText(log)}
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  if (viewMode === 'minimized') {
    return (
      <div
        onClick={() => setViewMode('normal')}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid #7f8c8d',
          borderRadius: '50%',
          color: '#e0e0e0',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
          fontWeight: 'bold',
          transform: 'translateY(-120px)'
        }}
        title="Show Log"
      >
        Log
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setViewMode('expanded')}
        style={{
          width: '250px',
          height: `${ACTION_LOG_HEIGHT}px`,
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
            {renderLogText(log)}
          </div>
        ))}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setViewMode('minimized');
        }}
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#7f8c8d',
          color: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10
        }}
        title="Minimize Log"
      >
        _
      </button>
    </div>
  );
};

export function CardBoard({ ctx, G, moves, playerID }) {
  const myPlayerID = playerID;
  const numPlayers = 3;
  const getUiScale = (width) => {
    if (width <= 700) return 0.66;
    if (width <= 900) return 0.8;
    return 1;
  };

  // Selection State
  const [selectedCardIndices, setSelectedCardIndices] = React.useState([]);
  const [selectedTargetIds, setSelectedTargetIds] = React.useState([]);
  const [lasers, setLasers] = React.useState([]); // Array of { from: pos, to: pos }
  const [equipmentMenu, setEquipmentMenu] = React.useState(null); // { slot: string }
  const [judgmentMenu, setJudgmentMenu] = React.useState(null); // { playerID: string, type: string, card: object }
  const [showDiscardPile, setShowDiscardPile] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Listen for fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Responsive hand width state
  const [maxHandWidth, setMaxHandWidth] = React.useState(
    typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 40) : 600
  );
  const [uiScale, setUiScale] = React.useState(
    typeof window !== 'undefined' ? getUiScale(window.innerWidth) : 1
  );

  // Update max width on resize
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Limit to 600px or screen width minus padding
      setMaxHandWidth(Math.min(600, width - 40));
      setUiScale(getUiScale(width));
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
  const getPosition = (id) => {
    if (id === myPlayerID) return 'bottom';
    const totalPlayers = Object.keys(G.players).length;
    const relative = (parseInt(id) - parseInt(myPlayerID) + totalPlayers) % totalPlayers;
    
    if (totalPlayers === 3) {
      if (relative === 1) return 'right';
      return 'left';
    } else if (totalPlayers === 4) {
      if (relative === 1) return 'right-bottom';
      if (relative === 2) return 'right-top';
      return 'left';
    }
    // Fallback
    if (relative === 1) return 'right';
    return 'left';
  };

  const getCoordinates = (position) => {
    switch (position) {
      case 'bottom': return { x: '50%', y: '80%' };
      case 'left': return { x: '15%', y: '40%' };
      case 'right': return { x: '85%', y: '40%' };
      case 'right-bottom': return { x: '85%', y: '75%' };
      case 'right-top': return { x: '85%', y: '15%' };
      default: return { x: '50%', y: '50%' };
    }
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
    
    // Check if single equipment card is selected, if so, equip it
    if (selectedCardIndices.length === 1) {
      const cardIndex = selectedCardIndices[0];
      const card = G.hands[playerID][cardIndex];
      
      if (['武器', '防具', '加一', '减一'].includes(card.type)) {
        handleEquipCard();
        return;
      }

      // Handle Indulgence (乐) and Supply Shortage (兵)
      if (['乐不思蜀', '兵粮寸断'].includes(card.name)) {
        if (selectedTargetIds.length !== 1) {
          alert("请选择一名目标玩家");
          return;
        }
        const targetID = selectedTargetIds[0];
        const type = card.name === '乐不思蜀' ? 'le' : 'bing';
        
        // Check if target already has this judgment
        if (G.players[targetID].judges[type]) {
          alert("目标判定区已有该牌");
          return;
        }

        moves.playCardToJudgment({ card, targetPlayerID: targetID, type });
        setSelectedCardIndices([]);
        setSelectedTargetIds([]);
        return;
      }

      // Handle Lightning (闪电)
      if (card.name === '闪电') {
        // Lightning is played to self
        const type = 'dian';
        if (G.players[playerID].judges[type]) {
          alert("判定区已有闪电");
          return;
        }
        
        moves.playCardToJudgment({ card, targetPlayerID: playerID, type });
        setSelectedCardIndices([]);
        setSelectedTargetIds([]);
        return;
      }

      // Handle Snatch (顺手牵羊)
      if (card.name === '顺手牵羊') {
        if (selectedTargetIds.length !== 1) {
          alert("请选择一名目标玩家");
          return;
        }
        // Distance check removed as per user request
      }
    }

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

  const handleEquipCard = () => {
    if (selectedCardIndices.length !== 1) {
      alert("请选择一张装备牌进行装备");
      return;
    }
    
    const cardIndex = selectedCardIndices[0];
    const card = G.hands[playerID][cardIndex];
    
    if (!['武器', '防具', '加一', '减一'].includes(card.type)) {
      alert("这不是一张装备牌");
      return;
    }

    moves.equipCard(cardIndex);
    setSelectedCardIndices([]);
    setSelectedTargetIds([]);
  };

  const handleDiscardCards = () => {
    if (selectedCardIndices.length === 0) return;
    moves.discardCards(selectedCardIndices);
    setSelectedCardIndices([]);
    setSelectedTargetIds([]);
  };

  const onEquipClick = (slot) => {
    setEquipmentMenu({ slot });
  };

  const handleDiscardEquipment = () => {
    if (equipmentMenu) {
      moves.discardEquipment(equipmentMenu.slot);
      setEquipmentMenu(null);
    }
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

  const onModifyHP = (targetId, amount) => {
    moves.modifyHP(targetId, amount);
  };

  const onToggleChain = (targetId) => {
    moves.toggleLinked(targetId);
  };

  const onToggleJudgment = (targetId, type) => {
    // Only allow interaction if it's my judgment area and there is a card
    if (targetId === playerID && G.players[targetId].judges[type]) {
      setJudgmentMenu({
        playerID: targetId,
        type,
        card: G.players[targetId].judges[type]
      });
    }
  };

  const handleDiscardJudgment = () => {
    if (judgmentMenu) {
      moves.discardJudgmentCard(judgmentMenu.type);
      setJudgmentMenu(null);
    }
  };

  const handleMoveLightning = () => {
    if (judgmentMenu && judgmentMenu.type === 'dian') {
      moves.moveLightning();
      setJudgmentMenu(null);
    }
  };

  const onPerformJudgment = () => {
    moves.performJudgment();
  };

  const onSkillClick = (skillName) => {
    moves.useSkill(skillName);
  };

  // Render a player's hand area
  const renderPlayerArea = (id) => {
    const position = getPosition(id);
    const isMe = position === 'bottom';
    const hand = G.hands[id] || [];
    const isCurrentTurn = id === ctx.currentPlayer;
    const general = G.players[id]?.general;
    const role = G.players[id]?.role || 'neutral';
    const equipments = G.players[id]?.equipments || {};
    const judges = G.players[id]?.judges || {};

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

    const isCompact = typeof window !== 'undefined' && window.innerWidth <= 700;

    const areaStyle = {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      ...(position === 'bottom' && { bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '100%', pointerEvents: 'none', zIndex: 30 }), // Add width and pointerEvents
      ...(position === 'left' && (isCompact ? {
        top: '60px',
        left: '5px',
        transform: 'none',
        alignItems: 'flex-start'
      } : {
        top: '40%',
        left: '20px',
        transform: 'translateY(-50%)'
      })),
      ...(position === 'right' && (isCompact ? {
        top: '40px',
        right: '5px',
        transform: 'none',
        alignItems: 'flex-end'
      } : {
        top: '30%',
        right: '20px',
        transform: 'translateY(-50%)'
      })),
      ...(position === 'right-bottom' && (isCompact ? {
        top: 'auto',
        bottom: '40px',
        right: '5px',
        transform: 'none',
        alignItems: 'flex-end'
      } : {
        top: '60%',
        right: '20px',
        transform: 'translateY(-50%)'
      })),
      ...(position === 'right-top' && (isCompact ? {
        top: '40px',
        right: '5px',
        transform: 'none',
        alignItems: 'flex-end'
      } : {
        top: '20%',
        right: '20px',
        transform: 'translateY(-50%)'
      })),
    };

    // Player Info Component
    const PlayerInfo = () => null;

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
      const showLuckCardUI = G.phase === 'playing' && !G.players[id].luckCardConfirmed;
      const luckCardCount = G.players[id].luckCardCount;

      return (
        <React.Fragment key={id}>
          <div style={areaStyle}>
            {/* Luck Card UI */}
            {showLuckCardUI && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', pointerEvents: 'auto', position: 'relative', zIndex: 20 }}>
                <button
                  onClick={() => moves.useLuckCard()}
                  disabled={luckCardCount <= 0}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: luckCardCount > 0 ? '#3498db' : '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: luckCardCount > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  手气卡 {luckCardCount}/10
                </button>
                <button
                  onClick={() => moves.confirmLuckCard()}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  确定
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px',
              pointerEvents: 'auto',
              minHeight: '40px', // Reserve space
              justifyContent: 'center',
              position: 'relative',
              zIndex: 20
            }}>
              {selectedCardIndices.length > 0 && (
                <>
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
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      animation: 'fadeIn 0.3s'
                    }}
                  >
                    出牌
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
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      animation: 'fadeIn 0.3s'
                    }}
                  >
                    弃牌
                  </button>
                </>
              )}
              {G.pendingEffect && G.pendingEffect.active && G.pendingEffect.sourcePlayerID === id && (
                <>
                  <button 
                    onClick={() => moves.confirmEffect()}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      animation: 'fadeIn 0.3s'
                    }}
                  >
                    生效
                  </button>
                  <button 
                    onClick={() => moves.cancelEffect()}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      animation: 'fadeIn 0.3s'
                    }}
                  >
                    失效
                  </button>
                </>
              )}
            </div>
            <HandCards />
          </div>
          <div style={{
            position: 'absolute',
            bottom: isCompact ? '5px' : '20px',
            right: isCompact ? '5px' : '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 50
          }}>
            <PlayerInfo />
            <HeroArea 
              name={general ? general.name : "My Hero"} 
              hp={general ? general.hp : 4}
              hpMax={general ? general.hpMax : 4}
              skills={general ? general.skills : ["Strike", "Dodge"]}
              portrait={general ? general.portrait : null}
              isMe={true} 
              role={role}
              onClick={() => onHeroClick(id)}
              isSelectable={isSelectable}
              isSelected={isSelected}
              equipments={equipments}
              onEquipClick={onEquipClick}
              onModifyHP={(amount) => onModifyHP(id, amount)}
              judges={judges}
              onToggleJudgment={(type) => onToggleJudgment(id, type)}
              onSkillClick={isMe ? onSkillClick : undefined}
              scale={isCompact ? 0.9 : 1}
              handCount={hand.length}
              isLinked={G.players[id]?.is_linked}
              onToggleChain={() => onToggleChain(id)}
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
            hpMax={general ? general.hpMax : 4}
            skills={general ? general.skills : ["Strike", "Dodge"]}
            portrait={general ? general.portrait : null}
            role={role}
            onClick={() => onHeroClick(id)}
            isSelectable={isSelectable}
            isSelected={isSelected}
            equipments={equipments}
            onModifyHP={(amount) => onModifyHP(id, amount)}
            judges={judges}
            onToggleJudgment={(type) => onToggleJudgment(id, type)}
            scale={isCompact ? 0.9 : 1}
            handCount={hand.length}
            isLinked={G.players[id]?.is_linked}
            onToggleChain={() => onToggleChain(id)}
          />
        )}
        
        <PlayerInfo />
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
      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 5000,
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          color: 'white',
          padding: '5px 10px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
      {/* Equipment Menu Overlay */}
      {equipmentMenu && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setEquipmentMenu(null)}>
          <div style={{
            backgroundColor: '#333',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #ffd700',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '200px'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ffd700', margin: '0 0 10px 0', textAlign: 'center' }}>装备操作</h3>
            <button
              onClick={handleDiscardEquipment}
              style={{
                padding: '10px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              弃置装备
            </button>
            <button
              onClick={() => setEquipmentMenu(null)}
              style={{
                padding: '10px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Judgment Menu Overlay */}
      {judgmentMenu && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setJudgmentMenu(null)}>
          <div style={{
            backgroundColor: '#333',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #ffd700',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '200px'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ffd700', margin: '0 0 10px 0', textAlign: 'center' }}>
              {judgmentMenu.card.name} 操作
            </h3>
            
            {judgmentMenu.type === 'dian' && (
              <button
                onClick={handleMoveLightning}
                style={{
                  padding: '10px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                移动
              </button>
            )}

            <button
              onClick={handleDiscardJudgment}
              style={{
                padding: '10px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              弃置
            </button>
            
            <button
              onClick={() => setJudgmentMenu(null)}
              style={{
                padding: '10px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

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
      <ScoreBoard players={G.players} onWin={onResolveGame} landlord={G.landlord} scale={uiScale} />

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

      {/* Action Log - Near Action Buttons */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '170px',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
         <ActionTicker logs={G.actionLog || []} />
         <ActionLog logs={G.actionLog || []} />
      </div>

      {/* Deck Area */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '28%',
        width: 0,
        height: 0,
        overflow: 'visible'
      }}>

        {/* Draw Pile */}
        <div 
          onClick={onClickDraw}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translateY(-50%)',
            width: '50px',
            height: '75px',
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
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#7f8c8d' }}>
            Deck<br/>{G.deck.length}
          </div>
        </div>

        {/* Judgment Button - Left of Deck */}
        <div 
          onClick={onPerformJudgment}
          style={{
            position: 'absolute',
            top: '-20px',
            left: '-40px',
            width: '28px',
            height: '28px',
            backgroundColor: '#9b59b6',
            borderRadius: '4px',
            border: '2px solid #8e44ad',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
          title="判定"
        >
          判
        </div>

        {/* Discard Pile Button - Left of Deck */}
        <div 
          onClick={() => setShowDiscardPile(!showDiscardPile)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '-40px',
            width: '28px',
            height: '28px',
            backgroundColor: '#7f8c8d',
            borderRadius: '4px',
            border: '2px solid #95a5a6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
          title="查看弃牌堆"
        >
          弃
        </div>

        {showDiscardPile && (
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '-40px',
            width: '180px',
            maxHeight: '200px',
            backgroundColor: 'rgba(0,0,0,0.85)',
            border: '1px solid #7f8c8d',
            borderRadius: '6px',
            padding: '8px',
            color: '#ecf0f1',
            fontSize: '11px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            zIndex: 20
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              弃牌堆 ({(G.discardPile || []).length})
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {(G.discardPile || []).length === 0 ? (
                <div style={{ color: '#95a5a6' }}>空</div>
              ) : (
                (G.discardPile || []).map((card, index) => (
                  <div key={`${card.name}-${index}`} style={{ marginBottom: '2px' }}>
                    {card.suit} {card.rank} {card.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Render all players */}
      {Object.keys(G.players).map(id => renderPlayerArea(id))}

      {/* Card Selection Modal */}
      {G.selectCard && G.selectCard.active && G.selectCard.sourcePlayerID === playerID && (
        <CardSelectionModal
          targetPlayer={G.players[G.selectCard.targetPlayerID]}
          targetHand={G.hands[G.selectCard.targetPlayerID]}
          onConfirm={(selected) => moves.confirm_select_card(selected)}
          onCancel={() => {}} // No cancel for now as effect is resolving
          title={G.selectCard.pendingCard ? `Select cards for ${G.selectCard.pendingCard.name}` : 'Select Cards'}
          singleSelection={['过河拆桥', '顺手牵羊'].includes(G.selectCard.pendingCard?.name)}
        />
      )}
    </div>
  );
}