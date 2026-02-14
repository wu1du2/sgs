import { SGS_CARDS } from './sgs_data';

export const getCardInfo = (card) => {
  if (typeof card === 'object' && card !== null) {
    const { suit, rank, name, type, card_picture } = card;
    const color = '#2d3436'; // Black (Dark Grey) -统一为黑桃颜色
    
    return { suit, rank, color, name, type, card_picture };
  }
  // Fallback for legacy number index
  // Try to find it in SGS_CARDS if it's an index
  if (typeof card === 'number' && SGS_CARDS[card]) {
      const info = SGS_CARDS[card];
      return getCardInfo(info);
  }

  const SUITS = ['♠', '♥', '♣', '♦'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suit = SUITS[Math.floor(card / 13)];
  const rank = RANKS[card % 13];
  
  const color = '#2d3436'; // Black (Dark Grey) -统一为黑桃颜色

  return { suit, rank, color, name: '', type: '', card_picture: '' };
};

export const Card = ({ card, cardIndex, onClick, isHidden = false, isSelected = false, width = 60, height = 90, style }) => {
  const borderRadius = Math.max(4, Math.round(width * 0.133));
  const padding = Math.max(3, Math.round(width * 0.083));
  const selectedLift = -Math.round(height * 0.333);

  if (isHidden) {
    return (
      <div 
        onClick={onClick}
        style={{
          width,
          height,
          backgroundColor: '#1a4c8c',
          border: '2px solid white',
          borderRadius,
          backgroundImage: 'repeating-linear-gradient(45deg, #1a4c8c 0, #1a4c8c 10px, #143a6b 10px, #143a6b 20px)',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          margin: '0 2px',
          cursor: onClick ? 'pointer' : 'default',
          transform: isSelected ? `translateY(${selectedLift}px)` : 'none',
          transition: 'transform 0.2s',
          userSelect: 'none',
          ...style
        }}
      />
    );
  }

  const { suit, rank, color, name, card_picture } = getCardInfo(card || cardIndex);

  return (
    <div 
      onClick={onClick}
      style={{
        width,
        height,
        backgroundColor: '#f5e6cb',
        border: '1px solid #8b4513',
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding,
        color: color,
        cursor: onClick ? 'pointer' : 'default',
        transform: isSelected ? `translateY(${selectedLift}px)` : 'none',
        transition: 'transform 0.2s',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
        userSelect: 'none',
        margin: '0 2px',
        position: 'relative',
        backgroundImage: card_picture ? `url(${card_picture})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...style
      }}
    >
      <div style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        textAlign: 'left', 
        lineHeight: '1',
        textShadow: '0 0 2px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.8)' 
      }}>
        {rank}<br/>
        <span style={{ fontSize: '12px' }}>{suit}</span>
      </div>

      <div style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        textAlign: 'right', 
        transform: 'rotate(180deg)', 
        lineHeight: '1',
        textShadow: '0 0 2px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.8)' 
      }}>
        {rank}<br/>
        <span style={{ fontSize: '12px' }}>{suit}</span>
      </div>
    </div>
  );
};
