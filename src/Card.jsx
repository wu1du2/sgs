import React from 'react';

export const getCardInfo = (card) => {
  if (typeof card === 'object' && card !== null) {
    const { suit, rank, name, type } = card;
    const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
    return { suit, rank, color, name, type };
  }
  // Fallback for legacy number index
  const SUITS = ['♠', '♥', '♣', '♦'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suit = SUITS[Math.floor(card / 13)];
  const rank = RANKS[card % 13];
  const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
  return { suit, rank, color, name: '', type: '' };
};

export const Card = ({ card, cardIndex, onClick, isHidden = false, isSelected = false }) => {
  if (isHidden) {
    return (
      <div 
        style={{
          width: '60px',
          height: '90px',
          backgroundColor: '#1a4c8c',
          border: '2px solid white',
          borderRadius: '8px',
          backgroundImage: 'repeating-linear-gradient(45deg, #1a4c8c 0, #1a4c8c 10px, #143a6b 10px, #143a6b 20px)',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          margin: '0 2px'
        }}
      />
    );
  }

  const { suit, rank, color, name } = getCardInfo(card || cardIndex);

  return (
    <div 
      onClick={onClick}
      style={{
        width: '60px',
        height: '90px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '5px',
        color: color,
        cursor: onClick ? 'pointer' : 'default',
        transform: isSelected ? 'translateY(-30px)' : 'none',
        transition: 'transform 0.2s',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
        userSelect: 'none',
        margin: '0 2px',
        position: 'relative'
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'left', lineHeight: '1' }}>
        {rank}<br/>
        <span style={{ fontSize: '12px' }}>{suit}</span>
      </div>
      
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        fontSize: '16px', 
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
        wordBreak: 'break-all'
      }}>
        {name}
      </div>

      <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'right', transform: 'rotate(180deg)', lineHeight: '1' }}>
        {rank}<br/>
        <span style={{ fontSize: '12px' }}>{suit}</span>
      </div>
    </div>
  );
};