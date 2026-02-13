import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from './Card';
import { SGS_CARDS } from './sgs_data';
import { caochunSkill } from './skills/caochun';
import { yangbiaoSkill } from './skills/yangbiao';
import { shenluxunSkill } from './skills/shenluxun';
import { SHOW_DEBUG_INFO } from './Game';

// Helper for suit colors
const getSuitColor = (suit) => {
  if (suit === '♥') return '#d63031'; // Red
  if (suit === '♦') return '#0984e3'; // Blue
  if (suit === '♣') return '#00b894'; // Green
  if (suit === '♠') return '#b2bec3'; // Light Grey for dark backgrounds (Log/Ticker)
  return '#fff';
};

const CardSelectionModal = ({ targetPlayer, targetHand, onConfirm, onCancel, title, singleSelection, revealHand }) => {
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
                  backgroundColor: isSelected('hand', index) ? 'rgba(0, 255, 255, 0.3)' : (revealHand ? '#ecf0f1' : '#555'),
                  border: isSelected('hand', index) ? '3px solid #00ffff' : '1px solid #aaa',
                  borderRadius: '5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected('hand', index) ? '0 0 15px #00ffff' : 'none',
                  animation: isSelected('hand', index) ? 'pulse-selected 1.5s infinite' : 'none',
                  color: revealHand ? getSuitColor(card.suit) : '#aaa',
                  fontSize: '12px',
                  position: 'relative'
                }}
              >
                {revealHand ? (
                  <>
                    <div style={{ position: 'absolute', top: '5px', left: '5px' }}>{card.suit}</div>
                    <div style={{ position: 'absolute', top: '5px', right: '5px' }}>{card.rank}</div>
                    <div style={{ fontWeight: 'bold' }}>{card.name}</div>
                  </>
                ) : (
                  'Card Back'
                )}
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
            onClick={onCancel} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
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

const KangkaiCardModal = ({ hand, equipments, onConfirm, onCancel }) => {
  const [selected, setSelected] = React.useState(null);

  const selectHand = (index) => {
    setSelected({ type: 'hand', index });
  };

  const selectEquip = (slot) => {
    setSelected({ type: 'equip', slot });
  };

  const isSelected = (type, value) => {
    if (!selected) return false;
    if (type !== selected.type) return false;
    return type === 'hand' ? selected.index === value : selected.slot === value;
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => (
            <div
              key={`hand-${index}`}
              onClick={() => selectHand(index)}
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: isSelected('hand', index) ? '3px solid #00ffff' : '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: getSuitColor(card.suit),
                transform: isSelected('hand', index) ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>
                {card.suit}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>
                {card.rank}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {card.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(equipments).map(([slot, card]) => {
            if (!card) return null;
            return (
              <div
                key={`equip-${slot}`}
                onClick={() => selectEquip(slot)}
                style={{
                  padding: '10px',
                  backgroundColor: isSelected('equip', slot) ? 'rgba(0, 255, 255, 0.3)' : '#444',
                  border: isSelected('equip', slot) ? '3px solid #00ffff' : '1px solid #aaa',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                {card.name} ({slot})
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={!selected}
            style={{
              padding: '10px 20px',
              backgroundColor: selected ? '#4CAF50' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selected ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const FireAttackShowCardModal = ({ hand, onConfirm, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3>请展示一张手牌</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: selectedIndex === index ? '3px solid #e74c3c' : '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: getSuitColor(card.suit),
                transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>
                {card.suit}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>
                {card.rank}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {card.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onCancel}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#95a5a6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button 
            onClick={() => onConfirm(selectedIndex)} 
            disabled={selectedIndex === null}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: selectedIndex !== null ? '#e74c3c' : '#555', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
            }}
          >
            确定展示
          </button>
        </div>
      </div>
    </div>
  );
};

const HarvestBox = ({ cards, onPick, onClose }) => {
  const [isMinimized, setIsMinimized] = React.useState(false);

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '100px',
        zIndex: 3000,
      }}>
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e67e22',
            color: 'white',
            border: '2px solid #d35400',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          五谷丰登 ({cards.length}) ▲
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      pointerEvents: 'none' // Allow clicking through background
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #e67e22',
        width: '80%',
        maxWidth: '600px',
        pointerEvents: 'auto', // Re-enable pointer events for the box
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: '0 0 20px rgba(230, 126, 34, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#e67e22' }}>五谷丰登</h3>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e67e22',
              cursor: 'pointer',
              fontSize: '24px',
              fontWeight: 'bold',
              padding: '0 5px'
            }}
          >
            _
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => onPick(index)}
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.2s',
                color: getSuitColor(card.suit)
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>
                {card.suit}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>
                {card.rank}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {card.name}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            结束
          </button>
        </div>
      </div>
    </div>
  );
};

const MaLiangCheeringArea = ({ cards, onTransfer, onDiscard }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '180px',
      left: '20px',
      zIndex: 2000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '10px',
      borderRadius: '8px',
      border: '2px solid #3498db',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <h3 style={{ margin: 0, color: '#3498db', textAlign: 'center' }}>应援区 ({cards.length})</h3>
      <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '300px' }}>
        {cards.map((card, index) => (
           <div key={index} style={{
             width: '40px', height: '60px', backgroundColor: '#ecf0f1',
             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
             fontSize: '10px', color: getSuitColor(card.suit), borderRadius: '4px'
           }}>
             <div>{card.suit}</div>
             <div>{card.rank}</div>
           </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={onTransfer} style={{ padding: '5px 10px', backgroundColor: '#2ecc71', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>移交</button>
        <button onClick={onDiscard} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>弃牌</button>
      </div>
    </div>
  );
};

const HarvestCountSelector = ({ onSelect }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      color: 'white',
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '30px',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ margin: 0, color: '#f1c40f' }}>选择翻牌数量</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[1, 2, 3].map(num => (
            <button
              key={num}
              onClick={() => onSelect(num)}
              style={{
                width: '60px',
                height: '60px',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.1s',
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ZhuangShiModal = ({ onConfirm, onCancel }) => {
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);

  const options = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

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
        padding: '15px',
        borderRadius: '8px',
        width: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ margin: '0 0 5px 0', textAlign: 'center', color: '#ffd700' }}>壮誓</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '14px', color: '#ddd' }}>无距离限制&不可被响应 (x):</label>
          <select 
            value={x} 
            onChange={(e) => setX(parseInt(e.target.value))}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#444',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {options.map(val => (
              <option key={`x-${val}`} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '14px', color: '#ddd' }}>不计入次数 (y):</label>
          <select 
            value={y} 
            onChange={(e) => setY(parseInt(e.target.value))}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#444',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {options.map(val => (
              <option key={`y-${val}`} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={onCancel} 
            style={{ 
              padding: '6px 12px', 
              cursor: 'pointer',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            取消
          </button>
          <button 
            onClick={() => onConfirm(x, y)} 
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const KuangbaoSelector = ({ onSelect, onCancel }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        width: '300px',
        maxHeight: '80vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: 0 }}>选择狂暴标记数量</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {Array.from({ length: 21 }, (_, i) => i).map(num => (
            <button
              key={num}
              onClick={() => onSelect(num)}
              style={{
                padding: '10px',
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          style={{
            padding: '10px',
            backgroundColor: '#7f8c8d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
};

const QiHuiModal = ({ onSelect }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      color: 'white',
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ margin: 0, color: '#f1c40f', textAlign: 'center' }}>启诲：请选择一项</h3>
        <button 
            onClick={() => onSelect(1)}
            style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#3498db', border: 'none', color: 'white', borderRadius: '5px' }}
        >
            1. 回复1点体力
        </button>
        <button 
            onClick={() => onSelect(2)}
            style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#3498db', border: 'none', color: 'white', borderRadius: '5px' }}
        >
            2. 摸两张牌
        </button>
        <button 
            onClick={() => onSelect(3)}
            style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#3498db', border: 'none', color: 'white', borderRadius: '5px' }}
        >
            3. 下一张牌不计次数
        </button>
      </div>
    </div>
  );
};

const TianduModal = ({ card, onConfirm, onCancel }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      color: 'white',
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#f1c40f', textAlign: 'center' }}>天妒：是否获得此牌？</h3>
        
        {card && (
            <div style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: getSuitColor(card.suit),
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>{card.suit}</div>
                <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>{card.rank}</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>{card.name}</div>
            </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={onConfirm}
                style={{ padding: '8px 20px', cursor: 'pointer', backgroundColor: '#2ecc71', border: 'none', color: 'white', borderRadius: '5px', fontWeight: 'bold' }}
            >
                确定
            </button>
            <button 
                onClick={onCancel}
                style={{ padding: '8px 20px', cursor: 'pointer', backgroundColor: '#e74c3c', border: 'none', color: 'white', borderRadius: '5px', fontWeight: 'bold' }}
            >
                取消
            </button>
        </div>
      </div>
    </div>
  );
};

// Hero Area Component
const HeroArea = ({ name = "General", hp = 4, hpMax = 4, armor = 0, skills = ["Strike", "Dodge"], portrait, isMe = false, role = 'neutral', onClick, isSelectable, isSelected, equipments = {}, onEquipClick, onModifyHP, judges = {}, onToggleJudgment, onSkillClick, scale = 1, handCount = 0, isLinked = false, onToggleChain, kuangbaoCount = 0, onKuangbaoClick, qiHui = null, onQiHuiClick }) => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [qiHuiCollapsed, setQiHuiCollapsed] = React.useState(false);
  const elementRef = React.useRef(null);
  const [savedHeight, setSavedHeight] = React.useState(0);

  const prevHpRef = React.useRef(hp);
  const [animationState, setAnimationState] = React.useState('idle');
  const [animKey, setAnimKey] = React.useState(0);

  React.useEffect(() => {
    const currentHp = Number(hp);
    const prevHp = Number(prevHpRef.current);

    if (currentHp < prevHp) {
      setAnimationState('hurt');
      setAnimKey(prev => prev + 1);
      const timer = setTimeout(() => setAnimationState('idle'), 800);
      prevHpRef.current = currentHp;
      return () => clearTimeout(timer);
    } else if (currentHp > prevHp) {
      setAnimationState('recover');
      setAnimKey(prev => prev + 1);
      const timer = setTimeout(() => setAnimationState('idle'), 800);
      prevHpRef.current = currentHp;
      return () => clearTimeout(timer);
    }
    prevHpRef.current = currentHp;
  }, [hp]);

  React.useLayoutEffect(() => {
    if (!isMinimized && elementRef.current) {
      setSavedHeight(elementRef.current.offsetHeight);
    }
  }, [isMinimized, name, hp, hpMax, skills, equipments, judges, isLinked, handCount, portrait, role, isSelectable, isSelected, qiHui]);

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

  if (isMinimized) {
    const minimizedHeight = 28; // 24px height + 4px border
    const marginBottom = Math.max(0, savedHeight - minimizedHeight);

    return (
      <div 
        onClick={onClick}
        style={{
          width: '160px',
          height: '24px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          backgroundColor: getBackgroundColor(),
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#e0e0e0',
          pointerEvents: 'auto',
          border: `2px solid ${getBorderColor()}`,
          boxShadow: isSelected ? '0 0 20px 5px #00ffff' : (isSelectable ? '0 0 10px #ffff00' : '0 4px 8px rgba(0,0,0,0.5)'),
          flexShrink: 0,
          cursor: isSelectable ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          padding: '0 8px',
          overflow: 'hidden',
          marginBottom: `${marginBottom}px`
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffd700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
          {name}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0 4px'
          }}
          title="Expand"
        >
          🔽
        </button>
      </div>
    );
  }

  return (
    <div 
      key={animKey}
      ref={elementRef}
      onClick={onClick}
      className={animationState === 'hurt' ? 'hero-hurt' : animationState === 'recover' ? 'hero-recover' : ''}
      style={{
        width: '160px',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        backgroundColor: getBackgroundColor(),
        borderRadius: '8px',
        padding: '4px',
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
      <button
        onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '10px',
          zIndex: 20,
          padding: '2px'
        }}
        title="Minimize"
      >
        ➖
      </button>

      {/* Animation Overlays */}
      {animationState === 'hurt' && (
        <div className="overlay-anim" style={{
          position: 'absolute', inset: 0, 
          background: 'radial-gradient(circle, rgba(255, 50, 50, 0.8) 0%, rgba(255, 0, 0, 0.4) 100%)',
          zIndex: 5, borderRadius: '8px', pointerEvents: 'none',
          boxShadow: '0 0 30px 10px rgba(255, 0, 0, 0.8)',
          mixBlendMode: 'hard-light'
        }} />
      )}
      {animationState === 'recover' && (
        <div className="overlay-anim" style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 255, 0, 0.6)', 
          zIndex: 5, borderRadius: '8px', pointerEvents: 'none',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.8)'
        }} />
      )}

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

      {/* Kuangbao Indicator for Shen Lubu */}
      {name === '神吕布' && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onKuangbaoClick && onKuangbaoClick();
          }}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: '1px solid #c0392b',
            boxShadow: '0 0 5px rgba(231, 76, 60, 0.5)',
            zIndex: 15
          }}
        >
          狂暴{typeof kuangbaoCount === 'number' ? kuangbaoCount : 0}
        </div>
      )}

      {/* Avatar & Name Row */}
      <div style={{ display: 'flex', width: '100%', marginBottom: '4px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ 
          width: '64px', 
          height: '64px', 
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
          backgroundImage: portrait ? `url(${portrait})` : 'none',
          flexShrink: 0
        }}>
          {!portrait && '👤'}
        </div>
        
        {/* Name & HP */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffd700', marginBottom: '2px' }}>{name}</div>
          <div style={{ fontSize: '10px', color: '#ff4444', letterSpacing: '1px', display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ marginRight: '4px', display: 'flex', flexWrap: 'wrap' }}>
              {'♥'.repeat(hp)}
              <span style={{ color: '#ff4444', opacity: 0.5 }}>{'♡'.repeat(Math.max(0, hpMax - hp))}</span>
            </span>
            {armor > 0 && (
                <span style={{ color: '#3498db', fontWeight: 'bold', marginLeft: '4px' }}>
                    护甲{armor}
                </span>
            )}
            
            {/* HP Modification Buttons */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2px', marginLeft: '4px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onModifyHP && onModifyHP(1); }}
                style={{
                  width: '12px',
                  height: '12px',
                  fontSize: '10px',
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
                  fontSize: '10px',
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
          <div style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>
            手牌 {handCount}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '4px' }}>
        {skills.map((skill, i) => (
          <button 
            key={i} 
            onClick={(e) => {
              e.stopPropagation();
              onSkillClick && onSkillClick(skill);
            }}
            style={{
              fontSize: '9px',
              padding: '1px 4px',
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

      {/* Qi Hui Area */}
      {qiHui && (
        <div style={{ marginTop: '2px', width: '100%', border: '1px solid #7f8c8d', padding: '2px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.4)' }}>
             <div 
                onClick={(e) => {
                    e.stopPropagation();
                    setQiHuiCollapsed(!qiHuiCollapsed);
                }}
                style={{ fontSize: '9px', color: '#f1c40f', cursor: 'pointer', textAlign: 'center', marginBottom: qiHuiCollapsed ? 0 : '2px', fontWeight: 'bold' }}
             >
                 [启诲] {qiHuiCollapsed ? '▼' : '▲'}
             </div>
             
             {!qiHuiCollapsed && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                     <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                        {['基本', '锦囊', '装备'].map(btn => {
                            const isLit = qiHui.litButtons && qiHui.litButtons.includes(btn);
                            return (
                                <button
                                    key={btn}
                                    onClick={(e) => { e.stopPropagation(); onQiHuiClick && onQiHuiClick(btn); }}
                                    style={{
                                        fontSize: '8px',
                                        padding: '1px 3px',
                                        backgroundColor: isLit ? '#f1c40f' : '#34495e',
                                        color: isLit ? '#000' : '#bdc3c7',
                                        border: isLit ? '1px solid #f39c12' : '1px solid #2c3e50',
                                        borderRadius: '2px',
                                        cursor: isMe ? 'pointer' : 'default', // Only clickable by owner? Or everyone? Assuming owner.
                                        boxShadow: isLit ? '0 0 5px #f1c40f' : 'none'
                                    }}
                                    disabled={!isMe}
                                >
                                    {btn}
                                </button>
                            );
                        })}
                     </div>
                 </div>
             )}
        </div>
      )}

      {/* Equipment Slots */}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
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
                height: '16px', 
                border: '1px dashed #666', 
                fontSize: '8px', 
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
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '2px', gap: '1px' }}>
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
                height: '16px',
                backgroundColor: item.color,
                opacity: isActive ? 1 : 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
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
                height: '16px',
                backgroundColor: isLinked ? '#2c3e50' : 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
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

const GeneralSelection = ({ options, onSelect, onChange, changeUsed, onBid, landlord, debugInfo }) => {
  const isCompact = typeof window !== 'undefined' && window.innerWidth <= 700;
  const [renderLogs, setRenderLogs] = React.useState([]);

  React.useEffect(() => {
      const timestamp = new Date().toISOString();
      const currentGenerals = options.map(g => g.name).join(', ');
      setRenderLogs(prev => [...prev, `[${timestamp}] Rendered: ${currentGenerals}`]);
  }, [options]);

  const allDebugInfo = {
      backendLogs: debugInfo,
      frontendRenderLogs: renderLogs
  };

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
      {/* Debug Info */}
      {SHOW_DEBUG_INFO && (
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '10px' }}>
          <textarea
              readOnly
              value={JSON.stringify(allDebugInfo, null, 2)}
              style={{
                  width: '100%',
                  height: '100px',
                  fontSize: '10px',
                  backgroundColor: '#222',
                  color: '#0f0',
                  border: '1px solid #555'
              }}
              onClick={(e) => e.target.select()}
          />
          <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>
              Debug Info (Backend & Frontend)
          </div>
      </div>
      )}

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
                armor={general.initial_armor || 0}
                skills={general.skills} 
                portrait={general.localPortrait || general.portrait}
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
      }, 3000);
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
              <span key={i} style={{ color: '#ffd700', fontWeight: 'bold', textShadow: '0 0 5px rgba(255, 215, 0, 0.5)' }}>
                {part}
              </span>
            );
          }
          
          // Check for Suit
          if (part.match(/[♠♥♣♦]/)) {
             const suit = part.match(/[♠♥♣♦]/)[0];
             const color = getSuitColor(suit);
             return (
               <span key={i} style={{ color: color, fontWeight: 'bold', fontSize: '20px', textShadow: '0 0 2px rgba(255,255,255,0.3)' }}>
                 {part}
               </span>
             );
          }

          return <span key={i} style={{ textShadow: '0 1px 2px black' }}>{part}</span>;
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
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '25px',
      marginBottom: '15px',
      whiteSpace: 'nowrap',
      zIndex: 100,
      pointerEvents: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
      border: '2px solid #ffd700',
      textShadow: '0 1px 3px black'
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
    return ReactDOM.createPortal(
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
          height: '150px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid #ffd700',
          borderRadius: '8px',
          padding: '10px',
          zIndex: 3000,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 20px rgba(0,0,0,0.8)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
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
      </>,
      document.body
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

const PoxiModal = ({ myHand, targetHand, onConfirm, onCancel }) => {
  const [selectedMyCards, setSelectedMyCards] = React.useState([]);
  const [selectedTargetCards, setSelectedTargetCards] = React.useState([]);

  const toggleMyCard = (index) => {
    if (selectedMyCards.includes(index)) {
      setSelectedMyCards(selectedMyCards.filter(i => i !== index));
    } else {
      if (selectedMyCards.length + selectedTargetCards.length < 4) {
        setSelectedMyCards([...selectedMyCards, index]);
      }
    }
  };

  const toggleTargetCard = (index) => {
    if (selectedTargetCards.includes(index)) {
      setSelectedTargetCards(selectedTargetCards.filter(i => i !== index));
    } else {
      if (selectedMyCards.length + selectedTargetCards.length < 4) {
        setSelectedTargetCards([...selectedTargetCards, index]);
      }
    }
  };

  const totalSelected = selectedMyCards.length + selectedTargetCards.length;

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
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Target Hand Cards */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {targetHand.map((card, index) => (
              <div
                key={`target-${index}`}
                onClick={() => toggleTargetCard(index)}
                style={{
                  width: '60px',
                  height: '90px',
                  backgroundColor: selectedTargetCards.includes(index) ? 'rgba(255, 0, 0, 0.3)' : '#ecf0f1',
                  border: selectedTargetCards.includes(index) ? '3px solid #e74c3c' : '1px solid #bdc3c7',
                  borderRadius: '5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: getSuitColor(card.suit),
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px' }}>{card.suit}</div>
                <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>{card.rank}</div>
                <div style={{ fontSize: '10px', textAlign: 'center' }}>{card.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Hand Cards */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {myHand.map((card, index) => (
              <div
                key={`my-${index}`}
                onClick={() => toggleMyCard(index)}
                style={{
                  width: '60px',
                  height: '90px',
                  backgroundColor: selectedMyCards.includes(index) ? 'rgba(255, 0, 0, 0.3)' : '#ecf0f1',
                  border: selectedMyCards.includes(index) ? '3px solid #e74c3c' : '1px solid #bdc3c7',
                  borderRadius: '5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: getSuitColor(card.suit),
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px' }}>{card.suit}</div>
                <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>{card.rank}</div>
                <div style={{ fontSize: '10px', textAlign: 'center' }}>{card.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onCancel}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#95a5a6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button 
            onClick={() => onConfirm(selectedMyCards, selectedTargetCards)} 
            disabled={totalSelected > 4}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: totalSelected <= 4 ? '#e74c3c' : '#555', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: totalSelected <= 4 ? 'pointer' : 'not-allowed'
            }}
          >
            弃牌
          </button>
        </div>
      </div>
    </div>
  );
};

const RangjieMenu = ({ onChoose }) => {
  const btnStyle = {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '200px',
    transition: 'all 0.2s'
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '15px', 
        backgroundColor: '#2c3e50', padding: '30px', borderRadius: '15px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)', border: '1px solid #34495e'
      }}>
        <h3 style={{ color: '#ecf0f1', textAlign: 'center', margin: '0 0 10px 0' }}>让节：选择操作</h3>
        <button onClick={() => onChoose('scroll')} style={btnStyle}>拿锦囊</button>
        <button onClick={() => onChoose('basic')} style={btnStyle}>拿基本</button>
        <button onClick={() => onChoose('equip')} style={btnStyle}>拿装备</button>
        <button onClick={() => onChoose('move')} style={btnStyle}>移动牌</button>
        <button onClick={() => onChoose('cancel')} style={{...btnStyle, backgroundColor: '#7f8c8d'}}>取消</button>
      </div>
    </div>
  );
};

const RangjieMoveModal = ({ G, playerID, onFetchConfirm, onPutConfirm }) => {
  const stage = G.rangjieSelect.stage;
  const tempCard = G.rangjieTempCard;
  const [selectedTarget, setSelectedTarget] = React.useState(null);

  React.useEffect(() => {
    setSelectedTarget(null);
  }, [stage]);

  const getSlotCompat = (card) => {
    if (!card) return null;
    if (card.type === '武器') return { zone: 'equip', slot: 'weapon' };
    if (card.type === '防具') return { zone: 'equip', slot: 'armor' };
    if (card.type === '加一') return { zone: 'equip', slot: 'plusOne' };
    if (card.type === '减一') return { zone: 'equip', slot: 'minusOne' };
    if (card.type === '乐') return { zone: 'judge', slot: 'le' };
    if (card.type === '兵') return { zone: 'judge', slot: 'bing' };
    if (card.type === '电') return { zone: 'judge', slot: 'dian' };
    return null;
  };

  const compat = tempCard ? getSlotCompat(tempCard) : null;
  const isSelected = (pid, zone, slot) => {
    return selectedTarget && selectedTarget.targetPlayerID === pid && selectedTarget.zone === zone && selectedTarget.slot === slot;
  };

  const onConfirm = () => {
    if (!selectedTarget) return;
    if (stage === 'fetch') {
      onFetchConfirm(selectedTarget);
    } else {
      onPutConfirm(selectedTarget);
    }
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
      color: 'white'
    }}>
      <h2 style={{ color: '#ffd700' }}>
        {stage === 'fetch' ? '请选择一张牌移动到暂存区' : `请选择一个空位放置 ${tempCard.name}`}
      </h2>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', padding: '20px', width: '100%', overflowY: 'auto' }}>
        {Object.entries(G.players).map(([pid, p]) => (
          <div key={pid} style={{ 
            border: '1px solid #555', padding: '10px', borderRadius: '8px', 
            backgroundColor: 'rgba(255,255,255,0.05)', minWidth: '250px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: pid === playerID ? '#2ecc71' : '#aaa' }}>
              {p.general ? p.general.name : `Player ${pid}`}
            </h3>
            
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>装备区</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                {['weapon', 'armor', 'plusOne', 'minusOne'].map(slot => {
                  const card = p.equipments[slot];
                  const isClickable = stage === 'fetch' ? !!card : (!card && compat?.zone === 'equip' && compat?.slot === slot);
                  
                  return (
                    <div 
                      key={slot}
                      onClick={() => isClickable && setSelectedTarget({ targetPlayerID: pid, zone: 'equip', slot })}
                      style={{
                        padding: '8px',
                        border: isSelected(pid, 'equip', slot) ? '2px solid #ffd700' : (isClickable ? '1px dashed #00ffff' : '1px solid #444'),
                        backgroundColor: card ? '#333' : 'transparent',
                        cursor: isClickable ? 'pointer' : 'default',
                        fontSize: '12px',
                        textAlign: 'center',
                        opacity: isClickable ? 1 : 0.5
                      }}
                    >
                      {card ? card.name : slot}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>判定区</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                {['le', 'bing', 'dian'].map(slot => {
                  const card = p.judges[slot];
                  const isClickable = stage === 'fetch' ? !!card : (!card && compat?.zone === 'judge' && compat?.slot === slot);

                  return (
                    <div 
                      key={slot}
                      onClick={() => isClickable && setSelectedTarget({ targetPlayerID: pid, zone: 'judge', slot })}
                      style={{
                        padding: '8px',
                        border: isSelected(pid, 'judge', slot) ? '2px solid #ffd700' : (isClickable ? '1px dashed #ff00ff' : '1px solid #444'),
                        backgroundColor: card ? '#333' : 'transparent',
                        cursor: isClickable ? 'pointer' : 'default',
                        fontSize: '12px',
                        textAlign: 'center',
                        opacity: isClickable ? 1 : 0.5
                      }}
                    >
                      {card ? card.name : slot}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onConfirm}
        disabled={!selectedTarget}
        style={{
          marginTop: '20px',
          padding: '10px 30px',
          backgroundColor: selectedTarget ? '#2ecc71' : '#555',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: selectedTarget ? 'pointer' : 'not-allowed',
          fontSize: '16px'
        }}
      >
        确定
      </button>
    </div>
  );
};

const QuanJiSelectionModal = ({ hand, onConfirm, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3>请选择一张手牌置于“权”上</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                border: selectedIndex === index ? '3px solid #00ffff' : 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Card card={card} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={() => selectedIndex !== null && onConfirm(selectedIndex)}
            disabled={selectedIndex === null}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedIndex !== null ? '#2ecc71' : '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const PaiYiSelectionModal = ({ quan, onConfirm, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3>请选择一张“权”弃置</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {quan.map((card, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                border: selectedIndex === index ? '3px solid #00ffff' : 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Card card={card} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={() => selectedIndex !== null && onConfirm(selectedIndex)}
            disabled={selectedIndex === null}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedIndex !== null ? '#2ecc71' : '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const QuanViewModal = ({ cards, onClose }) => {
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
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        width: '80%',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }} onClick={e => e.stopPropagation()}>
        <h3>“权” ({cards.length})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {cards.map((card, index) => (
            <div key={index}>
              <Card card={card} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

const PinDianModal = ({ hand, onConfirm, title }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3>{title || "请选择一张手牌进行拼点"}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: selectedIndex === index ? '3px solid #e74c3c' : '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: getSuitColor(card.suit),
                transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>
                {card.suit}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>
                {card.rank}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {card.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => onConfirm(selectedIndex)} 
            disabled={selectedIndex === null}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: selectedIndex !== null ? '#e74c3c' : '#555', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const CongJianModal = ({ hand, equipments, selectedCard, onSelect, onConfirm, onCancel }) => {
  const isSelected = (type, value) => {
    if (!selectedCard) return false;
    if (type !== selectedCard.type) return false;
    return type === 'hand' ? selectedCard.index === value : selectedCard.slot === value;
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
        <h3 style={{ textAlign: 'center' }}>请选择一张牌交给目标</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => (
            <div
              key={`hand-${index}`}
              onClick={() => onSelect({ type: 'hand', index })}
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: isSelected('hand', index) ? '3px solid #00ffff' : '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: getSuitColor(card.suit),
                transform: isSelected('hand', index) ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>
                {card.suit}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>
                {card.rank}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {card.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(equipments).map(([slot, card]) => {
            if (!card) return null;
            return (
              <div
                key={`equip-${slot}`}
                onClick={() => onSelect({ type: 'equip', slot })}
                style={{
                  padding: '10px',
                  backgroundColor: isSelected('equip', slot) ? 'rgba(0, 255, 255, 0.3)' : '#444',
                  border: isSelected('equip', slot) ? '3px solid #00ffff' : '1px solid #aaa',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                {card.name} ({slot})
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedCard}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCard ? '#4CAF50' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedCard ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const MiZhaoPinDianModal = ({ hand, onConfirm, title }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3>{title || "请选择一张手牌进行拼点"}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                border: selectedIndex === index ? '3px solid #e74c3c' : '1px solid #bdc3c7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: getSuitColor(card.suit),
                transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>
                {card.suit}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>
                {card.rank}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {card.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => onConfirm(selectedIndex)} 
            disabled={selectedIndex === null}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: selectedIndex !== null ? '#e74c3c' : '#555', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const ZhanLieModal = ({ currentX, onConfirm, onCancel }) => {
  const [x, setX] = React.useState(currentX || 0);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '10px', width: '300px',
        display: 'flex', flexDirection: 'column', gap: '20px', color: 'white'
      }}>
        <h3 style={{ margin: 0, textAlign: 'center' }}>战烈: 更新X</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>数值: {x}</label>
            <input 
                type="range" 
                min="0" 
                max="10" 
                value={x} 
                onChange={(e) => setX(parseInt(e.target.value))} 
                style={{ width: '100%' }}
            />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onCancel} style={{ padding: '8px 15px', backgroundColor: '#7f8c8d', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>取消</button>
          <button onClick={() => onConfirm(x)} style={{ padding: '8px 15px', backgroundColor: '#e67e22', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>确定</button>
        </div>
      </div>
    </div>
  );
};

const ZhenFengModal = ({ onConfirm, onCancel }) => {
  const [hanZhanChoice, setHanZhanChoice] = React.useState('hpMax');
  const [zhanLieChoice, setZhanLieChoice] = React.useState('attackRange');

  const hanZhanOptions = [
    { value: 'hpMax', label: '体力上限' },
    { value: 'hp', label: '当前体力值' },
    { value: 'lostHp', label: '已损失体力值' },
    { value: 'aliveCount', label: '存活角色数' }
  ];

  const zhanLieOptions = [
    { value: 'attackRange', label: '攻击范围' },
    { value: 'hp', label: '当前体力值' },
    { value: 'lostHp', label: '已损失体力值' },
    { value: 'aliveCount', label: '存活角色数' }
  ];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '10px', width: '350px',
        display: 'flex', flexDirection: 'column', gap: '20px', color: 'white'
      }}>
        <h3 style={{ margin: 0, textAlign: 'center' }}>振锋: 调整数值</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>酣战调整:</label>
          <select 
            value={hanZhanChoice} 
            onChange={(e) => setHanZhanChoice(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', backgroundColor: '#555', color: 'white', border: 'none' }}
          >
            {hanZhanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>战烈调整:</label>
          <select 
            value={zhanLieChoice} 
            onChange={(e) => setZhanLieChoice(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', backgroundColor: '#555', color: 'white', border: 'none' }}
          >
            {zhanLieOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onCancel} style={{ padding: '8px 15px', backgroundColor: '#7f8c8d', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>取消</button>
          <button onClick={() => onConfirm(hanZhanChoice, zhanLieChoice)} style={{ padding: '8px 15px', backgroundColor: '#e67e22', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>确定</button>
        </div>
      </div>
    </div>
  );
};

const JianyingNameModal = ({ onConfirm, onCancel }) => {
  const options = ['杀', '酒', '桃'];
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minWidth: '300px'
      }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: 0 }}>请选择变换后的牌名</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => onConfirm(opt)}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          style={{
            padding: '8px',
            backgroundColor: '#7f8c8d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
};

const LiMuModal = ({ hand, onConfirm, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '10px',
        display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '400px', maxHeight: '80%', overflowY: 'auto'
      }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: 0 }}>立牧: 选择一张牌当【乐不思蜀】</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => {
             const isDiamond = card.suit === '♦';
             
             return (
             <div key={index} 
                onClick={() => setSelectedIndex(index)}
                style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                    border: selectedIndex === index ? '3px solid #00ffff' : (isDiamond ? '3px solid #e74c3c' : '1px solid #aaa'),
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: isDiamond ? '0 0 10px rgba(231, 76, 60, 0.5)' : 'none',
                    transition: 'all 0.2s'
                }}>
                <div style={{
                    width: '60px', height: '90px', backgroundColor: '#ecf0f1',
                    borderRadius: '5px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', position: 'relative',
                    color: getSuitColor(card.suit)
                }}>
                    <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px' }}>{card.suit}</div>
                    <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>{card.rank}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{card.name}</div>
                </div>
             </div>
          )})}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <button 
                onClick={() => selectedIndex !== null && onConfirm(selectedIndex)} 
                disabled={selectedIndex === null}
                style={{ padding: '8px 16px', backgroundColor: selectedIndex !== null ? '#2ecc71' : '#7f8c8d', color: 'white', border: 'none', borderRadius: '4px', cursor: selectedIndex !== null ? 'pointer' : 'not-allowed' }}>
                确定
             </button>
             <button onClick={onCancel} style={{ padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                取消
             </button>
        </div>
      </div>
    </div>
  );
};

const JianyingDisplay = ({ suit, rank }) => {
  if (!suit) return null;
  return (
    <div style={{
      marginTop: '5px',
      padding: '2px 5px',
      backgroundColor: 'rgba(0,0,0,0.6)',
      color: getSuitColor(suit),
      borderRadius: '4px',
      fontSize: '12px',
      border: '1px solid #aaa',
      textAlign: 'center'
    }}>
      上一张: {suit}{rank}
    </div>
  );
};

const ShiCaiModal = ({ cards, onMoveToTop, onDiscardAll, onClose }) => {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '10px',
        display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '400px', maxHeight: '80%', overflowY: 'auto'
      }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: 0 }}>恃才区域</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {cards.length === 0 ? <div style={{color:'#aaa'}}>空</div> : cards.map((card, index) => (
             <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{
                    width: '60px', height: '90px', backgroundColor: '#ecf0f1',
                    borderRadius: '5px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', position: 'relative',
                    color: getSuitColor(card.suit)
                }}>
                    <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px' }}>{card.suit}</div>
                    <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>{card.rank}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{card.name}</div>
                </div>
                <button onClick={() => onMoveToTop(index)} style={{ fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}>置于牌堆顶</button>
             </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <button onClick={onDiscardAll} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                全部弃置
             </button>
             <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                关闭
             </button>
        </div>
      </div>
    </div>
  );
};

const FenYinEffect = ({ message }) => {
  if (!message) return null;
  const isRed = message.includes('红');
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 4000,
      pointerEvents: 'none',
      animation: 'fadeInOut 2s ease-in-out'
    }}>
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: isRed ? '#ff0000' : '#000000',
        textShadow: '0 0 10px white',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '20px 40px',
        borderRadius: '10px',
        border: `5px solid ${isRed ? '#ff0000' : '#000000'}`
      }}>
        {message}
      </div>
    </div>
  );
};

const MieJiCardSelectionModal = ({ hand, onConfirm, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

  const isHighlighted = (card) => {
    return (card.suit === '♠' || card.suit === '♣') && card.type === '锦囊';
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '10px', width: '80%', maxWidth: '800px',
        display: 'flex', flexDirection: 'column', gap: '20px', color: 'white'
      }}>
        <h3 style={{ margin: 0, textAlign: 'center' }}>灭计: 选择一张牌置于牌堆顶</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {hand.map((card, index) => {
            const highlighted = isHighlighted(card);
            return (
              <div
                key={index}
                onClick={() => setSelectedIndex(index === selectedIndex ? null : index)}
                style={{
                  width: '80px', height: '120px',
                  backgroundColor: '#ecf0f1',
                  borderRadius: '6px',
                  border: selectedIndex === index ? '3px solid #e74c3c' : (highlighted ? '3px solid #f1c40f' : '1px solid #bdc3c7'),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                  color: getSuitColor(card.suit),
                  transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: highlighted ? '0 0 10px #f1c40f' : 'none'
                }}
              >
                <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>{card.suit}</div>
                <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>{card.rank}</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>{card.name}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>取消</button>
          <button 
            onClick={() => onConfirm(selectedIndex)} 
            disabled={selectedIndex === null}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: selectedIndex !== null ? '#e74c3c' : '#555', 
              color: 'white', border: 'none', borderRadius: '5px', 
              cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const MieJiTargetRespondModal = ({ hand, equipments, onGive, onDiscard }) => {
  const [selected, setSelected] = React.useState([]); // Array of {type, index/slot}

  const toggleSelection = (item) => {
    const exists = selected.find(s => s.type === item.type && s.index === item.index && s.slot === item.slot);
    if (exists) {
      setSelected(selected.filter(s => s !== exists));
    } else {
      setSelected([...selected, item]);
    }
  };

  const isSelected = (type, val) => {
    return selected.some(s => s.type === type && (s.index === val || s.slot === val));
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '10px', width: '80%', maxWidth: '800px',
        display: 'flex', flexDirection: 'column', gap: '20px', color: 'white'
      }}>
        <h3 style={{ margin: 0, textAlign: 'center' }}>灭计: 选择牌交出或弃置</h3>
        
        {/* Hand */}
        <div>
            <h4>手牌</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {hand.map((card, index) => (
                <div
                key={`hand-${index}`}
                onClick={() => toggleSelection({ type: 'hand', index })}
                style={{
                    width: '80px', height: '120px',
                    backgroundColor: '#ecf0f1',
                    borderRadius: '6px',
                    border: isSelected('hand', index) ? '3px solid #00ffff' : '1px solid #bdc3c7',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                    color: getSuitColor(card.suit),
                    transform: isSelected('hand', index) ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s'
                }}
                >
                <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '16px' }}>{card.suit}</div>
                <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px' }}>{card.rank}</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>{card.name}</div>
                </div>
            ))}
            </div>
        </div>

        {/* Equipments */}
        <div>
            <h4>装备</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(equipments).map(([slot, card]) => {
                if (!card) return null;
                return (
                <div
                    key={`equip-${slot}`}
                    onClick={() => toggleSelection({ type: 'equip', slot })}
                    style={{
                    padding: '10px',
                    backgroundColor: isSelected('equip', slot) ? 'rgba(0, 255, 255, 0.3)' : '#444',
                    border: isSelected('equip', slot) ? '3px solid #00ffff' : '1px solid #aaa',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    color: 'white'
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
            onClick={() => onGive(selected)} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2ecc71', 
              color: 'white', border: 'none', borderRadius: '5px', 
              cursor: 'pointer'
            }}
          >
            交出
          </button>
          <button 
            onClick={() => onDiscard(selected)} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#e74c3c', 
              color: 'white', border: 'none', borderRadius: '5px', 
              cursor: 'pointer'
            }}
          >
            弃置
          </button>
        </div>
      </div>
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
  const [quanView, setQuanView] = React.useState({ active: false, cards: [] });
  const [mizhaoStage, setMizhaoStage] = React.useState(null);
  const [mizhaoTargetA, setMizhaoTargetA] = React.useState(null);
  const [mizhaoTargetB, setMizhaoTargetB] = React.useState(null);
  
  // Shi Taishi Ci State
  const [showZhanLieModal, setShowZhanLieModal] = React.useState(false);
  const [zhanLieX, setZhanLieX] = React.useState(0);
  const [showZhenFengModal, setShowZhenFengModal] = React.useState(false);
  const [zhenFengHanZhan, setZhenFengHanZhan] = React.useState('hpMax');
  const [zhenFengZhanLie, setZhenFengZhanLie] = React.useState('attackRange');
  const [fenYinMessage, setFenYinMessage] = React.useState(null);

  // Xu You State
  const [showShiCaiModal, setShowShiCaiModal] = React.useState(false);

  // Prevent double clicks
  const processingAction = React.useRef(false);
  const handleSafeAction = (action, delay = 200) => {
    if (processingAction.current) {
        console.log('Duplicate action prevented');
        return;
    }
    processingAction.current = true;
    console.log('Executing action');
    action();
    setTimeout(() => {
      processingAction.current = false;
      console.log('Action lock released');
    }, delay); 
  };

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
      const actionId = Date.now() + Math.random();
      const me = G.players[playerID];
      if (me.general && me.general.name === '许攸') {
        handleSafeAction(() => moves.xuyouDrawCard(actionId));
      } else {
        handleSafeAction(() => moves.drawCard(actionId));
      }
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
    // Ma Liang Transfer
    if (G.maliang && G.maliang.status === 'selecting_transfer_target') {
      if (targetId === playerID) {
          alert("Cannot transfer to yourself");
          return;
      }
      moves.maliangTransferConfirm(targetId);
      return;
    }

    if (mizhaoStage === 'selectA') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      setMizhaoTargetA(targetId);
      return;
    }

    if (mizhaoStage === 'selectB') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      if (targetId === mizhaoTargetA) {
        alert("不能选择同一名角色");
        return;
      }
      setMizhaoTargetB(targetId);
      return;
    }

    if (activeSkill === '义争') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      // Validation: Target HP <= My HP
      const myPlayer = G.players[playerID];
      const targetPlayer = G.players[targetId];
      if (targetPlayer.hp > myPlayer.hp) {
           alert("目标体力值必须不大于你");
           return;
      }
      
      moves.initiatePinDian({ targetID: targetId, skillName: '义争' });
      setActiveSkill(null);
      return;
    }

    if (activeSkill === '慷忾') {
      if (selectedTargetIds.includes(targetId)) {
        setSelectedTargetIds(selectedTargetIds.filter(id => id !== targetId));
      } else {
        setSelectedTargetIds([targetId]);
      }
      return;
    }

    if (activeSkill === '灭计') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.miejiTarget(targetId);
      setActiveSkill(null);
      return;
    }

    if (activeSkill === '破军') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      
      // Toggle selection for Po Jun
      if (selectedTargetIds.includes(targetId)) {
        setSelectedTargetIds(selectedTargetIds.filter(id => id !== targetId));
      } else {
        // Po Jun targets a single player
        setSelectedTargetIds([targetId]);
      }
      return;
    }

    if (activeSkill === '椎锋') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.useZhuiFeng(targetId);
      setActiveSkill(null);
      return;
    }

    if (activeSkill === '冲坚') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.useChongJian(targetId);
      setActiveSkill(null);
      return;
    }

    // Poxi Target Selection
    if (G.poxiSelect && G.poxiSelect.active && G.poxiSelect.stage === 'target_selection') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.selectPoxiTarget(targetId);
      return;
    }

    // Jieying Target Selection
    if (G.jieyingSelect && G.jieyingSelect.active && G.jieyingSelect.stage === 'target_selection') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.selectJieyingTarget(targetId);
      return;
    }

    // CongJian Target Selection
    if (G.congjianSelect && G.congjianSelect.active && G.congjianSelect.stage === 'target_selection') {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.selectCongJianTarget(targetId);
      return;
    }

    // LongHun Target Selection
    if (G.longhunSelect && G.longhunSelect.active && G.longhunSelect.stage === 'target_selection') {
      moves.selectLongHunTarget(targetId);
      return;
    }

    // ChouCe Target Selection
    if (G.chouceSelect && G.chouceSelect.active && G.chouceSelect.stage === 'target_selection') {
      moves.selectChouceTarget(targetId);
      return;
    }

    // Liyu Target Selection
    if (G.liyuTargeting && G.liyuTargeting.active && G.liyuTargeting.sourceID === playerID) {
      if (targetId === playerID) {
        alert("不能选择自己");
        return;
      }
      moves.selectLiyuTarget(targetId);
      return;
    }

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

      // Handle Fire Attack (火攻)
      if (card.name === '火攻') {
        if (selectedTargetIds.length !== 1) {
          alert("请选择一名目标玩家");
          return;
        }
      }

      // Handle Peach (桃)
      if (card.name === '桃') {
        if (G.players[playerID].hp >= G.players[playerID].hpMax) {
          alert("满血不能吃桃");
          return;
        }
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

    const me = G.players[playerID];

    // Liu Zan Fen Yin Effect
    if (me.general && me.general.name === '留赞' && selectedCardIndices.length > 0) {
        const cardIndex = selectedCardIndices[0];
        const card = G.hands[playerID][cardIndex];
        let message = '';
        if (['♥', '♦'].includes(card.suit)) {
            message = '奋音(红)';
        } else if (['♠', '♣'].includes(card.suit)) {
            message = '奋音(黑)';
        }
        if (message) {
            setFenYinMessage(message);
            setTimeout(() => setFenYinMessage(null), 2000);
        }
    }

    if (me.general && me.general.name === '许攸') {
        moves.xuyouPlayCards(selectedCardIndices, selectedTargetIds);
    } else {
        moves.playCards(selectedCardIndices, selectedTargetIds);
    }
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
    const actionId = Date.now().toString(); // Use timestamp as action ID (simplified)
    const clickid = Math.random().toString(36).substring(2, 15);
    let sessionid = localStorage.getItem('sgs_debug_sessionid');
    if (!sessionid) {
        sessionid = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('sgs_debug_sessionid', sessionid);
    }
    handleSafeAction(() => moves.changeGeneral(generalId, actionId, clickid, sessionid));
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

  const [activeSkill, setActiveSkill] = React.useState(null);
  const [showZhuangShiModal, setShowZhuangShiModal] = React.useState(false);
  const [showKuangbaoSelector, setShowKuangbaoSelector] = React.useState(false);
  const [shanJiaState, setShanJiaState] = React.useState(3);

  const onKuangbaoClick = () => {
    setShowKuangbaoSelector(true);
  };

  const handleKuangbaoSelect = (num) => {
    moves.updateKuangbaoCount(num);
    setShowKuangbaoSelector(false);
  };

  // Pin Dian Modal Logic
  let showPinDianModal = false;
  let pinDianTitle = "";
  if (G.pindian && G.pindian.active) {
    if (G.pindian.sourceCard === null) {
      if (playerID === G.pindian.sourcePlayerID) {
        showPinDianModal = true;
        pinDianTitle = "请选择用于拼点的卡牌";
      }
    } else if (G.pindian.targetCard === null) {
      if (playerID === G.pindian.targetPlayerID) {
        showPinDianModal = true;
        pinDianTitle = "请选择用于拼点的卡牌 (对方已出牌)";
      }
    }
  }

  let showMizhaoPinDianModal = false;
  let mizhaoPinDianTitle = "";
  if (G.mizhaoPindian && G.mizhaoPindian.active) {
    if (G.mizhaoPindian.sourceCard === null) {
      if (playerID === G.mizhaoPindian.sourcePlayerID) {
        showMizhaoPinDianModal = true;
        mizhaoPinDianTitle = "请选择用于拼点的卡牌";
      }
    } else if (G.mizhaoPindian.targetCard === null) {
      if (playerID === G.mizhaoPindian.targetPlayerID) {
        showMizhaoPinDianModal = true;
        mizhaoPinDianTitle = "请选择用于拼点的卡牌 (对方已出牌)";
      }
    }
  }

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

  const onSkillClick = (rawSkillName) => {
    // IMPORTANT: Always trim the skill name to avoid issues with invisible characters or spaces
    // This caused a bug where '却敌' and '仇决' were not matching due to trailing spaces/invisible chars
    const skillName = rawSkillName.trim();
    console.log('onSkillClick called with:', skillName, 'length:', skillName.length);

    // Read-only display skills (containing colon)
    if (skillName.includes(':')) {
        return;
    }

    if (skillName.startsWith('成略')) {
        moves.xuyouChengLue();
        return;
    }

    if (skillName.startsWith('恃才')) {
        setShowShiCaiModal(true);
        return;
    }

    if (skillName.startsWith(caochunSkill.shanjia.name)) {
      setShanJiaState(prev => caochunSkill.shanjia.cycleState(prev));
      // Removed setActiveSkill('缮甲') to prevent target selection prompt
      return;
    }

    if (skillName.startsWith('昭汉')) {
      moves.useZhaohan();
      return;
    }

    if (skillName === '利驭') {
      moves.useLiyu();
      return;
    }

    if (skillName.startsWith('军略')) {
      moves.shenluxunJunlueAdd();
      return;
    }

    if (skillName === '义争') {
      if (activeSkill === '义争') {
        setActiveSkill(null);
        setSelectedTargetIds([]);
      } else {
        setActiveSkill('义争');
        setSelectedTargetIds([]);
      }
      return;
    }

    if (skillName === '慷忾') {
      if (activeSkill === '慷忾') {
        setActiveSkill(null);
        setSelectedTargetIds([]);
        moves.cancelKangkai();
      } else {
        setActiveSkill('慷忾');
        setSelectedTargetIds([]);
        moves.activateKangkai();
      }
      return;
    }

    if (skillName === '让节') {
      moves.useRangjie();
      return;
    }

    if (skillName === '从谏') {
      moves.useCongJian();
      return;
    }

    if (skillName === '密诏') {
      if ((G.hands[playerID] || []).length === 0) {
        alert("你必须有手牌才能发动");
        return;
      }
      setActiveSkill(null);
      setMizhaoStage('selectA');
      setMizhaoTargetA(null);
      setMizhaoTargetB(null);
      moves.startMizhao();
      return;
    }

    if (skillName === '摧克') {
      moves.shenluxunResetJunlue();
      return;
    }

    if (skillName === '绽火') {
      moves.shenluxunResetJunlue();
      return;
    }

    if (skillName === '灭计') {
      if (activeSkill === '灭计') {
        setActiveSkill(null);
        moves.miejiCancel();
      } else {
        setActiveSkill('灭计');
      }
      return;
    }

    if (skillName === '破军') {
      if (activeSkill === '破军') {
        setActiveSkill(null); // Toggle off
        setSelectedTargetIds([]);
      } else {
        setActiveSkill('破军');
        setSelectedTargetIds([]);
      }
      return;
    }

    if (skillName === '椎锋') {
      if (activeSkill === '椎锋') {
        setActiveSkill(null);
      } else {
        setActiveSkill('椎锋');
      }
      return;
    }

    if (skillName === '冲坚') {
      if (activeSkill === '冲坚') {
        setActiveSkill(null);
      } else {
        setActiveSkill('冲坚');
      }
      return;
    }

    if (skillName === '却敌') {
      if (window.confirm('是否确定减少一点体力上限？')) {
        moves.useQueDi();
      }
      return;
    }

    if (skillName === '仇决') {
      if (window.confirm('是否确定增加一点体力上限？')) {
        moves.useChouJue();
      }
      return;
    }

    if (skillName === '壮誓') {
      setShowZhuangShiModal(true);
      return;
    }

    if (skillName === '魄袭') {
      if (G.poxiSelect && G.poxiSelect.active) {
        moves.cancelPoxi();
      } else {
        moves.activatePoxi();
      }
      return;
    }

    if (skillName === '劫营') {
      if (G.jieyingSelect && G.jieyingSelect.active) {
        moves.cancelJieying();
      } else {
        moves.activateJieying();
      }
      return;
    }

    if (skillName === '权计') {
      moves.jiezhonghuiQuanJi();
      return;
    }

    if (skillName === '自立') {
      moves.jiezhonghuiZiLi();
      return;
    }

    if (skillName === '排异') {
      moves.jiezhonghuiPaiYi();
      return;
    }

    // Shi Taishi Ci Skills
    if (skillName.startsWith('战烈')) {
      setShowZhanLieModal(true);
      return;
    }

    if (skillName === '振锋') {
      setShowZhenFengModal(true);
      return;
    }

    // Jie Jushou Skills
    if (skillName === '渐营') {
        moves.activateJianying();
        return;
    }

    if (skillName === '侠行') {
        moves.youxushuXiaXing();
        return;
    }

    if (skillName === '龙魂') {
        moves.clickLongHun();
        return;
    }

    if (skillName === '筹策') {
        moves.clickChouce();
        return;
    }

    if (skillName === '立牧') {
        const player = G.players[playerID];
        if (player.judges.le) {
             alert('已经有乐，不能执行');
             return;
        }
        moves.liMuStart();
        return;
    }

    moves.useSkill(skillName);
  };

  // Render a player's hand area
  const renderPlayerArea = (id) => {
    const position = getPosition(id);
    const isMe = position === 'bottom';
    const hand = G.hands[id] || [];
    const isCurrentTurn = id === ctx.currentPlayer;
    const player = G.players[id];
    const general = player?.general;
    const role = player?.role || 'neutral';
    const equipments = player?.equipments || {};
    const judges = player?.judges || {};

    let displaySkills = general ? general.skills : ["Strike", "Dodge"];
    if (isMe && general) {
      if (general.name === '许攸') {
        const state = player.xuyouState || 'yang';
        displaySkills = general.skills.map(s => {
           if (s === '成略') {
             return state === 'yang' ? '成略(阳)' : '成略(阴)';
           }
           if (s === '恃才') {
             const count = player.shicai ? player.shicai.length : 0;
             return `恃才[${count}]`;
           }
           return s;
        });
        
        // Also show recorded suits
        if (player.chengLueSuits && player.chengLueSuits.length > 0) {
            displaySkills.push(`Recorded: ${player.chengLueSuits.join(',')}`);
        }
      }

      if (general.skills && general.skills.includes(caochunSkill.shanjia.name)) {
        displaySkills = general.skills.map(s => {
          if (s === caochunSkill.shanjia.name) {
            return caochunSkill.shanjia.getDisplayName(shanJiaState);
          }
          return s;
        });
      }
      
      if (general.name === '骆统') {
        displaySkills = general.skills.map(s => {
          if (s.startsWith('勤政')) {
            return `勤政${player.qz_cnt || 0}`;
          }
          return s;
        });
      }

      if (general.name === '杨彪') {
        displaySkills = general.skills.map(s => {
          if (s.startsWith('昭汉')) {
            return yangbiaoSkill.zhaohan.getDisplayName(player.zhaohanCount);
          }
          return s;
        });
      }

      if (general.name === '神陆逊') {
        displaySkills = general.skills.map(s => {
          if (s.startsWith('军略')) {
            return shenluxunSkill.junlue.getDisplayName(player.junlueCount);
          }
          return s;
        });
      }

      if (general.name === '势太史慈') {
        const hanZhanLabel = {
          hpMax: '体力上限',
          hp: '当前体力值',
          lostHp: '已损失体力值',
          aliveCount: '存活角色数'
        }[zhenFengHanZhan] || zhenFengHanZhan;

        const zhanLieLabel = {
          attackRange: '攻击范围',
          hp: '当前体力值',
          lostHp: '已损失体力值',
          aliveCount: '存活角色数'
        }[zhenFengZhanLie] || zhenFengZhanLie;

        displaySkills = general.skills.flatMap(s => {
          if (s === '战烈') {
            return [`战烈${zhanLieX}`];
          }
          if (s === '振锋') {
            return ['振锋', `酣战:${hanZhanLabel}`, `战烈:${zhanLieLabel}`];
          }
          return [s];
        });
      }
    }

    // Target Selection Logic
    const mizhaoSelecting = mizhaoStage === 'selectA' || mizhaoStage === 'selectB';
    const isSelectable = selectedCardIndices.length > 0 || mizhaoSelecting;
    const isSelected = selectedTargetIds.includes(id) || (mizhaoStage === 'selectA' && mizhaoTargetA === id) || (mizhaoStage === 'selectB' && (mizhaoTargetA === id || mizhaoTargetB === id));

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
                  onClick={() => {
                  const actionId = Date.now().toString();
                  handleSafeAction(() => moves.useLuckCard(actionId));
                }}
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
              {/* Shen Gan Ning Skills - Removed as they are now triggered via HeroArea */}
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
            zIndex: 50,
            pointerEvents: 'none'
          }}>
            <PlayerInfo />
            {/* Po Jun Return Buttons */}
            {isMe && G.players[id].pojun && Object.entries(G.players[id].pojun).map(([targetID, cards]) => {
                if (cards.length === 0) return null;
                const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
                return (
                    <button
                        key={targetID}
                        onClick={() => moves.returnPoJunCards(targetID)}
                        style={{
                            marginBottom: '5px',
                            padding: '5px 10px',
                            backgroundColor: '#8e44ad',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            pointerEvents: 'auto'
                        }}
                    >
                        归还 {targetName} ({cards.length})
                    </button>
                );
            })}
            {/* Quan Area for Jie Zhonghui */}
            {player.quan && player.quan.length > 0 && (
              <div 
                onClick={() => setQuanView({ active: true, cards: player.quan })}
                style={{
                  marginBottom: '5px',
                  backgroundColor: '#8e44ad',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
              }}>
                权 {player.quan.length}
              </div>
            )}
            <HeroArea 
              name={general ? general.name : "My Hero"} 
              hp={player?.hp ?? (general ? general.hp : 4)}
              hpMax={player?.hpMax ?? (general ? general.hpMax : 4)}
              armor={player?.armor || 0}
              skills={displaySkills}
              portrait={general ? (general.localPortrait || general.portrait) : null}
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
              kuangbaoCount={G.players[id].kuangbaoCount}
              onKuangbaoClick={onKuangbaoClick}
              qiHui={player.qiHui}
              onQiHuiClick={(btn) => moves.youxushuQiHuiClick(btn)}
            />
            <JianyingDisplay suit={G.players[id].jianying?.suit} rank={G.players[id].jianying?.rank} />
          </div>
        </React.Fragment>
      );
    }

    return (
      <div style={areaStyle}>
        {/* Hero Area for Left/Right players */}
        {!isMe && (
          <>
            <HeroArea 
              name={general ? general.name : `Player ${id}`}
              hp={player?.hp ?? (general ? general.hp : 4)}
              hpMax={player?.hpMax ?? (general ? general.hpMax : 4)}
              armor={player?.armor || 0}
              skills={general ? general.skills : ["Strike", "Dodge"]}
              portrait={general ? (general.localPortrait || general.portrait) : null}
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
              kuangbaoCount={G.players[id].kuangbaoCount}
              qiHui={player.qiHui}
              onQiHuiClick={(btn) => moves.youxushuQiHuiClick(btn)}
            />
            <JianyingDisplay suit={G.players[id].jianying?.suit} rank={G.players[id].jianying?.rank} />
          </>
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
      overflow: 'auto'
    }}>
      {/* Qi Hui Selection Modal */}
      {G.players[playerID] && G.players[playerID].qiHui && G.players[playerID].qiHui.stage === 'selecting_option' && (
         <QiHuiModal onSelect={(opt) => moves.youxushuQiHuiSelectOption(opt)} />
      )}

      {/* Xu You Shi Cai Modal */}
      {showShiCaiModal && (
        <ShiCaiModal
            cards={G.players[playerID].shicai || []}
            onMoveToTop={(index) => moves.xuyouShiCaiToTop(index)}
            onDiscardAll={() => moves.xuyouShiCaiToDiscard()}
            onClose={() => setShowShiCaiModal(false)}
        />
      )}

      {/* Mie Ji Card Selection (Li Ru) */}
      {G.miejiStage === 'selectCard' && playerID === ctx.currentPlayer && (
        <MieJiCardSelectionModal
          hand={G.hands[playerID]}
          onConfirm={(index) => moves.miejiSelectCard(index)}
          onCancel={() => moves.miejiCancel()}
        />
      )}

      {/* Mie Ji Target Respond (Target) */}
      {G.miejiStage === 'targetRespond' && playerID === G.miejiTargetId && (
        <MieJiTargetRespondModal
          hand={G.hands[playerID]}
          equipments={G.players[playerID].equipments}
          onGive={(items) => moves.miejiGive(items)}
          onDiscard={(items) => moves.miejiDiscard(items)}
        />
      )}
      
      {/* Xu You Cheng Lue Selection */}
      {G.xuyouChengLueSelect && G.xuyouChengLueSelect.active && G.xuyouChengLueSelect.playerID === playerID && (
         <CardSelectionModal
            targetPlayer={G.players[playerID]}
            targetHand={G.hands[playerID]}
            onConfirm={(items) => {
                const count = G.xuyouChengLueSelect.stage === 'discard_2_yang' ? 2 : 1;
                if (items.length !== count) {
                    alert(`请选择${count}张手牌弃置`);
                    return;
                }
                const realIndices = items.map(x => x.index);
                moves.xuyouChengLueDiscard(realIndices);
            }}
            onCancel={() => {
                 alert("必须弃牌");
            }}
            title={G.xuyouChengLueSelect.stage === 'discard_2_yang' ? "成略(阳): 弃置2张手牌" : "成略(阴): 弃置1张手牌"}
            singleSelection={false}
            revealHand={true}
         />
      )}

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
            {/* Control Top Button for Xu You */}
            {G.players[playerID].general && G.players[playerID].general.name === '许攸' && (
                <button
                    onClick={() => {
                        moves.xuyouEquipToTop(equipmentMenu.slot);
                        setEquipmentMenu(null);
                    }}
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
                    控顶
                </button>
            )}
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

      {/* Jie Jushou Jianying Modals */}
      {G.jianyingSelect && G.jianyingSelect.active && G.jianyingSelect.playerID === playerID && (
          <>
              {G.jianyingSelect.stage === 'card_selection' && (
                  <CardSelectionModal
                      targetPlayer={G.players[playerID]}
                      targetHand={G.hands[playerID]}
                      singleSelection={true}
                      title="渐营：请选择一张手牌或装备"
                      revealHand={true}
                      onConfirm={(selected) => {
                          if (selected && selected.length > 0 && (selected[0].type === 'hand' || selected[0].type === 'equip')) {
                              moves.selectJianyingCard(selected[0]);
                          } else {
                              alert("请选择一张手牌或装备");
                          }
                      }}
                      onCancel={() => moves.cancelJianying()}
                  />
              )}
              {G.jianyingSelect.stage === 'name_selection' && (
                  <JianyingNameModal
                      onConfirm={(name) => moves.selectJianyingName(name)}
                      onCancel={() => moves.cancelJianying()}
                  />
              )}
          </>
      )}

      {/* Liu Yan Li Mu Modal */}
      {G.liMuSelect && G.liMuSelect.active && G.liMuSelect.playerID === playerID && (
        <LiMuModal
          hand={G.hands[playerID]}
          onConfirm={(index) => moves.liMuConfirm(index)}
          onCancel={() => moves.liMuCancel()}
        />
      )}

      {/* LongHun Modals */}
      {G.longhunSelect && G.longhunSelect.active && G.longhunSelect.sourcePlayerID === playerID && (
          <>
              {G.longhunSelect.stage === 'target_selection' && G.longhunSelect.targetPlayerID && (
                  <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3000
                  }}>
                      <div style={{
                          backgroundColor: '#333',
                          padding: '20px',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                          color: 'white'
                      }}>
                          <h3>确认选择该目标？</h3>
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                              <button
                                  onClick={() => moves.confirmLongHunTarget()}
                                  style={{
                                      padding: '10px 20px',
                                      backgroundColor: '#2ecc71',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '5px',
                                      cursor: 'pointer'
                                  }}
                              >
                                  确定
                              </button>
                              <button
                                  onClick={() => moves.cancelLongHun()}
                                  style={{
                                      padding: '10px 20px',
                                      backgroundColor: '#e74c3c',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '5px',
                                      cursor: 'pointer'
                                  }}
                              >
                                  取消
                              </button>
                          </div>
                      </div>
                  </div>
              )}
              {G.longhunSelect.stage === 'card_selection' && (
                  <CardSelectionModal
                      targetPlayer={G.players[G.longhunSelect.targetPlayerID]}
                      targetHand={G.hands[G.longhunSelect.targetPlayerID]}
                      singleSelection={true}
                      title="龙魂：请选择一张牌弃置"
                      revealHand={false} // Blind selection
                      onConfirm={(selected) => {
                          if (selected && selected.length > 0) {
                              moves.selectLongHunCard(selected[0]);
                              moves.confirmLongHunCard();
                          } else {
                              alert("请选择一张牌");
                          }
                      }}
                      onCancel={() => moves.cancelLongHun()}
                  />
              )}
          </>
      )}

      {/* ChouCe Modals */}
      {G.chouceSelect && G.chouceSelect.active && G.chouceSelect.sourcePlayerID === playerID && (
          <>
              {G.chouceSelect.stage === 'target_selection' && G.chouceSelect.targetPlayerID && (
                  <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3000
                  }}>
                      <div style={{
                          backgroundColor: '#333',
                          padding: '20px',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                          color: 'white'
                      }}>
                          <h3>确认选择该目标？</h3>
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                              <button
                                  onClick={() => moves.confirmChouceTarget()}
                                  style={{
                                      padding: '10px 20px',
                                      backgroundColor: '#2ecc71',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '5px',
                                      cursor: 'pointer'
                                  }}
                              >
                                  确定
                              </button>
                              <button
                                  onClick={() => moves.cancelChouce()}
                                  style={{
                                      padding: '10px 20px',
                                      backgroundColor: '#e74c3c',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '5px',
                                      cursor: 'pointer'
                                  }}
                              >
                                  取消
                              </button>
                          </div>
                      </div>
                  </div>
              )}
              {G.chouceSelect.stage === 'card_selection' && (
                  <CardSelectionModal
                      targetPlayer={G.players[G.chouceSelect.targetPlayerID]}
                      targetHand={G.hands[G.chouceSelect.targetPlayerID]}
                      singleSelection={true}
                      title="筹策：请选择一张牌弃置"
                      revealHand={false} // Blind selection
                      onConfirm={(selected) => {
                          if (selected && selected.length > 0) {
                              moves.selectChouceCard(selected[0]);
                              moves.confirmChouceCard();
                          } else {
                              alert("请选择一张牌");
                          }
                      }}
                      onCancel={() => moves.cancelChouce()}
                  />
              )}
          </>
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

      {/* Ma Liang Cheering Area */}
      {G.maliang && G.maliang.cheeringPile.length > 0 && G.players[playerID].general && G.players[playerID].general.name === '马良' && (
        <MaLiangCheeringArea 
          cards={G.maliang.cheeringPile}
          onTransfer={() => moves.maliangTransferStart()}
          onDiscard={() => moves.maliangDiscardCheering()}
        />
      )}

      {/* General Selection Overlay */}
      {G.phase === 'selection' && G.generalOptions[playerID] && !G.players[playerID]?.general && (
        <GeneralSelection 
          options={G.generalOptions[playerID]} 
          onSelect={onSelectGeneral} 
          onChange={onChangeGeneral}
          changeUsed={G.generalChangeUsed[playerID] || [false, false, false]}
          onBid={onBid}
          landlord={G.landlord}
          debugInfo={G.debugInfo}
        />
      )}

      {G.rangjieSelect && G.rangjieSelect.active && G.rangjieSelect.playerID === playerID && G.rangjieSelect.stage === 'menu' && (
        <RangjieMenu onChoose={(option) => moves.rangjieChooseOption(option)} />
      )}

      {G.rangjieSelect && G.rangjieSelect.active && G.rangjieSelect.playerID === playerID && (G.rangjieSelect.stage === 'fetch' || G.rangjieSelect.stage === 'put') && (
        <RangjieMoveModal 
          G={G} 
          playerID={playerID} 
          onFetchConfirm={({ targetPlayerID, zone, slot }) => moves.rangjieFetchCard({ targetPlayerID, zone, slot })} 
          onPutConfirm={({ targetPlayerID, zone, slot }) => moves.rangjiePutCard({ targetPlayerID, zone, slot })} 
        />
      )}

      {/* Jie Zhonghui Quan Ji Selection */}
      {G.jiezhonghuiQuanJiSelect && G.jiezhonghuiQuanJiSelect.active && G.jiezhonghuiQuanJiSelect.playerID === playerID && (
        <QuanJiSelectionModal
          hand={G.hands[playerID]}
          onConfirm={(index) => moves.jiezhonghuiQuanJiConfirm(index)}
          onCancel={() => moves.jiezhonghuiQuanJiCancel()}
        />
      )}

      {/* Jie Zhonghui Pai Yi Selection */}
      {G.jiezhonghuiPaiYiSelect && G.jiezhonghuiPaiYiSelect.active && G.jiezhonghuiPaiYiSelect.playerID === playerID && (
        <PaiYiSelectionModal
          quan={G.players[playerID].quan || []}
          onConfirm={(index) => moves.jiezhonghuiPaiYiConfirm(index)}
          onCancel={() => moves.jiezhonghuiPaiYiCancel()}
        />
      )}

      {/* Quan View Modal */}
      {quanView.active && (
        <QuanViewModal
          cards={quanView.cards}
          onClose={() => setQuanView({ active: false, cards: [] })}
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

      {mizhaoStage && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{mizhaoStage === 'selectA' ? '请选择密诏的角色A' : '请选择密诏的角色B'}</span>
          <button
            onClick={() => {
              if (mizhaoStage === 'selectA') {
                if (!mizhaoTargetA) {
                  alert("请选择一名目标");
                  return;
                }
                moves.mizhaoConfirmTargetA(mizhaoTargetA);
                setMizhaoStage('selectB');
                setMizhaoTargetB(null);
                return;
              }
              if (!mizhaoTargetB) {
                alert("请选择一名目标");
                return;
              }
              moves.mizhaoConfirmTargetB({ targetAID: mizhaoTargetA, targetBID: mizhaoTargetB });
              setMizhaoStage(null);
              setMizhaoTargetA(null);
              setMizhaoTargetB(null);
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: (mizhaoStage === 'selectA' ? mizhaoTargetA : mizhaoTargetB) ? '#2ecc71' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (mizhaoStage === 'selectA' ? mizhaoTargetA : mizhaoTargetB) ? 'pointer' : 'not-allowed'
            }}
          >
            确定
          </button>
          <button
            onClick={() => {
              moves.cancelMizhao();
              setMizhaoStage(null);
              setMizhaoTargetA(null);
              setMizhaoTargetB(null);
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
        </div>
      )}

      {/* Skill Selection Overlay */}
      {activeSkill && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>请选择 {activeSkill} 的目标</span>
          {activeSkill === '缮甲' && (
            <button 
              onClick={() => {
                moves.confirmShanjia(shanJiaState);
                setActiveSkill(null);
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              确定 (弃{shanJiaState}张)
            </button>
          )}
          {activeSkill === '破军' && selectedTargetIds.length > 0 && (
            <button 
              onClick={() => {
                if (selectedTargetIds.length !== 1) {
                  alert("请选择一名目标");
                  return;
                }
                moves.usePoJun(selectedTargetIds[0]);
                setActiveSkill(null);
                setSelectedTargetIds([]);
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              确定
            </button>
          )}
          {activeSkill === '慷忾' && selectedTargetIds.length > 0 && (
            <button 
              onClick={() => {
                if (selectedTargetIds.length !== 1) {
                  alert("请选择一名目标");
                  return;
                }
                moves.confirmKangkaiTarget(selectedTargetIds[0]);
                setActiveSkill(null);
                setSelectedTargetIds([]);
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              确定
            </button>
          )}
          <button 
            onClick={() => {
              if (activeSkill === '慷忾') {
                moves.cancelKangkai();
              }
              setActiveSkill(null);
              setSelectedTargetIds([]);
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
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
          onClick={() => {
            const me = G.players[playerID];
            if (me.general && me.general.name === '戏志才') {
              moves.clickTiandu();
            } else {
              onPerformJudgment();
            }
          }}
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

        {/* Shuffle Button - Between Judge and Discard */}
        <div 
          onClick={() => moves.shuffleDeck()}
          style={{
            position: 'absolute',
            top: '0px',
            left: '-40px',
            width: '28px',
            height: '28px',
            backgroundColor: '#e67e22',
            borderRadius: '4px',
            border: '2px solid #d35400',
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
          title="洗牌"
        >
          洗
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
            maxHeight: '90px',
            backgroundColor: 'rgba(0,0,0,0.85)',
            border: '1px solid #7f8c8d',
            borderRadius: '6px',
            padding: '8px',
            color: '#ecf0f1',
            fontSize: '11px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            zIndex: 1000
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              弃牌堆 ({(G.discardPile || []).length})
            </div>
            <div style={{ maxHeight: '50px', overflowY: 'auto' }}>
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
          onCancel={() => moves.cancel_select_card()}
          title={G.selectCard.pendingCard ? `Select cards for ${G.selectCard.pendingCard.name}` : 'Select Cards'}
          singleSelection={['过河拆桥', '顺手牵羊', '借刀杀人'].includes(G.selectCard.pendingCard?.name)}
        />
      )}

      {/* Po Jun Selection Modal */}
      {G.pojunSelect && G.pojunSelect.active && G.pojunSelect.sourcePlayerID === playerID && (
        <CardSelectionModal
          targetPlayer={G.players[G.pojunSelect.targetPlayerID]}
          targetHand={G.hands[G.pojunSelect.targetPlayerID]}
          onConfirm={(selected) => moves.confirmPoJunSelection(selected)}
          onCancel={() => moves.cancelPoJunSelection()}
          title="Po Jun: Select cards to move"
          singleSelection={false}
        />
      )}

      {G.kangkaiSelect && G.kangkaiSelect.active && G.kangkaiSelect.stage === 'card_selection' && G.kangkaiSelect.sourcePlayerID === playerID && (
        <KangkaiCardModal
          hand={G.hands[playerID]}
          equipments={G.players[playerID].equipments}
          onConfirm={(selected) => moves.confirmKangkaiCard(selected)}
          onCancel={() => moves.cancelKangkai()}
        />
      )}

      {/* Fire Attack Show Card Modal */}
      {G.fireAttackShowCard && G.fireAttackShowCard.active && G.fireAttackShowCard.targetPlayerID === playerID && (
        <FireAttackShowCardModal
          hand={G.hands[playerID]}
          onConfirm={(index) => moves.confirmFireAttackShowCard(index)}
          onCancel={() => moves.cancelFireAttackShowCard()}
        />
      )}

      {/* Harvest Count Selector */}
      {G.harvestCountSelect && G.harvestCountSelect.active && G.harvestCountSelect.playerID === playerID && (
        <HarvestCountSelector
          onSelect={(count) => moves.selectHarvestCount(count)}
        />
      )}

      {/* Harvest Box */}
      {G.harvestCards && G.harvestCards.length > 0 && (
        <HarvestBox
          cards={G.harvestCards}
          onPick={(index) => moves.pickHarvestCard(index)}
          onClose={() => moves.endHarvest()}
        />
      )}

      {/* CongJian Modal */}
      {G.congjianSelect && G.congjianSelect.active && G.congjianSelect.stage === 'card_selection' && G.congjianSelect.sourcePlayerID === playerID && (
        <CongJianModal
          hand={G.hands[playerID]}
          equipments={G.players[playerID].equipments}
          selectedCard={G.congjianSelect.selectedCard}
          onSelect={(cardData) => moves.selectCongJianCard(cardData)}
          onConfirm={() => moves.confirmCongJianCard()}
          onCancel={() => moves.cancelCongJian()}
        />
      )}
      
      {/* CongJian Target Confirm */}
      {G.congjianSelect && G.congjianSelect.active && G.congjianSelect.stage === 'target_selection' && G.congjianSelect.sourcePlayerID === playerID && (
        <div style={{
          position: 'fixed',
          bottom: '250px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          zIndex: 2000
        }}>
           <button
             onClick={() => moves.confirmCongJianTarget()}
             disabled={!G.congjianSelect.targetPlayerID}
             style={{
               padding: '10px 30px',
               backgroundColor: G.congjianSelect.targetPlayerID ? '#4CAF50' : '#555',
               color: 'white',
               border: 'none',
               borderRadius: '5px',
               fontSize: '18px',
               cursor: G.congjianSelect.targetPlayerID ? 'pointer' : 'not-allowed',
               boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
             }}
           >
             确定目标
           </button>
           <button
             onClick={() => moves.cancelCongJian()}
             style={{
               padding: '10px 30px',
               backgroundColor: '#f44336',
               color: 'white',
               border: 'none',
               borderRadius: '5px',
               fontSize: '18px',
               cursor: 'pointer',
               boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
             }}
           >
             取消
           </button>
        </div>
      )}

      {/* Liyu Target Confirm */}
      {G.liyuTargeting && G.liyuTargeting.active && G.liyuTargeting.sourceID === playerID && (
        <div style={{
          position: 'fixed',
          bottom: '250px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          zIndex: 2000
        }}>
           <button
             onClick={() => moves.confirmLiyuTarget()}
             disabled={!G.liyuTargeting.selectedTargetID}
             style={{
               padding: '10px 30px',
               backgroundColor: G.liyuTargeting.selectedTargetID ? '#4CAF50' : '#555',
               color: 'white',
               border: 'none',
               borderRadius: '5px',
               fontSize: '18px',
               cursor: G.liyuTargeting.selectedTargetID ? 'pointer' : 'not-allowed',
               boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
             }}
           >
             确定目标
           </button>
           <button
             onClick={() => moves.cancelLiyuTarget()}
             style={{
               padding: '10px 30px',
               backgroundColor: '#f44336',
               color: 'white',
               border: 'none',
               borderRadius: '5px',
               fontSize: '18px',
               cursor: 'pointer',
               boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
             }}
           >
             取消
           </button>
        </div>
      )}

      {/* Liyu Card Selection Modal */}
      {G.liyuCardSelecting && G.liyuCardSelecting.active && G.liyuCardSelecting.sourceID === playerID && (
        <CardSelectionModal
          targetPlayer={G.players[G.liyuCardSelecting.targetID]}
          targetHand={G.hands[G.liyuCardSelecting.targetID]}
          onConfirm={(selected) => moves.liyuObtainCard(G.liyuCardSelecting.targetID, selected)}
          onCancel={() => moves.cancelLiyuTarget()}
          title="利驭: 请选择一张牌"
          singleSelection={true}
        />
      )}
      
      {/* Tiandu Modal */}
      {G.tianduSelect && G.tianduSelect.active && G.tianduSelect.playerID === playerID && (
        <TianduModal
            card={G.tianduSelect.card}
            onConfirm={() => moves.confirmTiandu()}
            onCancel={() => moves.cancelTiandu()}
        />
      )}

      {/* Poxi Modal */}
      {G.poxiSelect && G.poxiSelect.active && G.poxiSelect.stage === 'card_selection' && G.poxiSelect.sourcePlayerID === playerID && (
        <PoxiModal
          myHand={G.hands[playerID]}
          targetHand={G.hands[G.poxiSelect.targetPlayerID]}
          onConfirm={(myCards, targetCards) => moves.confirmPoxi(myCards, targetCards)}
          onCancel={() => moves.cancelPoxi()}
        />
      )}

      {/* ZhuangShi Modal */}
      {showZhuangShiModal && (
        <ZhuangShiModal 
          onConfirm={(x, y) => {
            moves.confirmZhuangShi(x, y);
            setShowZhuangShiModal(false);
          }}
          onCancel={() => setShowZhuangShiModal(false)}
        />
      )}

      {showPinDianModal && (
        <PinDianModal 
          hand={G.hands[playerID]} 
          title={pinDianTitle}
          onConfirm={(index) => moves.selectPinDianCard(index)}
        />
      )}
      {showMizhaoPinDianModal && (
        <MiZhaoPinDianModal 
          hand={G.hands[playerID]} 
          title={mizhaoPinDianTitle}
          onConfirm={(index) => moves.selectMizhaoPinDianCard(index)}
        />
      )}

      {/* Shi Taishi Ci Modals */}
      {showZhanLieModal && (
        <ZhanLieModal 
          currentX={zhanLieX}
          onConfirm={(newX) => {
            setZhanLieX(newX);
            setShowZhanLieModal(false);
          }}
          onCancel={() => setShowZhanLieModal(false)}
        />
      )}

      {showZhenFengModal && (
        <ZhenFengModal 
          onConfirm={(hanZhan, zhanLie) => {
            setZhenFengHanZhan(hanZhan);
            setZhenFengZhanLie(zhanLie);
            setShowZhenFengModal(false);
          }}
          onCancel={() => setShowZhenFengModal(false)}
        />
      )}

      {/* Shen Lubu Kuangbao Selector */}
      {showKuangbaoSelector && (
        <KuangbaoSelector
          onSelect={handleKuangbaoSelect}
          onCancel={() => setShowKuangbaoSelector(false)}
        />
      )}

      {/* Liu Zan Fen Yin Effect */}
      <FenYinEffect message={fenYinMessage} />
    </div>
  );
}
