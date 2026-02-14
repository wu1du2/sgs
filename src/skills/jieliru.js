import { SGS_CARDS } from '../sgs_data.js';

// Helper to add to discard pile
const addToDiscardPile = (G, cards) => {
  if (!cards) return;
  const toAdd = Array.isArray(cards) ? cards : [cards];
  const validCards = toAdd.filter(Boolean);
  
  if (validCards.length > 0) {
    G.discardPile.push(...validCards);
  }
};

export const jieliruSkill = {
  moves: {
    miejiTarget: ({ G, playerID }, targetId) => {
      // Validate target
      if (targetId === playerID) return;
      const target = G.players[targetId];
      // Target must have cards (hand or equip? Description says "select a character with cards").
      // Description: "select a character with cards" (implied "hand cards"? or "cards on field"?).
      // JSON description says "one other character with cards".
      // User description: "select one other character". Doesn't specify "with cards".
      // But later: "Target enters selection dialog... shows all hand and equip".
      // So probably any other character is valid, but usually needs cards to be meaningful.
      // I'll allow any other character.
      
      G.miejiTargetId = targetId;
      G.miejiStage = 'selectCard'; // Li Ru selects card to put on deck
      
      // Log
      const player = G.players[playerID];
      const targetPlayer = G.players[targetId];
      G.actionLog.push(`${player.general.name} 对 ${targetPlayer.general.name} 发动了 灭计`);
    },

    miejiSelectCard: ({ G, playerID }, cardIndex) => {
      const player = G.players[playerID];
      const hand = G.hands[playerID];
      const card = hand[cardIndex];
      
      // Remove from hand
      hand.splice(cardIndex, 1);
      
      // Put on top of deck (array start)
      G.deck.unshift(card);
      
      G.actionLog.push(`${player.general.name} 将一张${card.suit}${card.rank}【${card.name}】置于牌堆顶`);
      
      G.miejiStage = 'targetRespond';
    },
    
    miejiCancel: ({ G, playerID }) => {
        // Cancel the skill
        delete G.miejiTargetId;
        delete G.miejiStage;
        delete G.players[playerID].isMieJiTargeting;
    },

    miejiGive: ({ G, playerID }, selectedCards) => {
      // User requested: Target chooses any card to give to Li Ru.
      // selectedCards: Array of { type: 'hand'|'equip', index|slot }
      
      const targetId = G.miejiTargetId;
      const liRuId = Object.keys(G.players).find(id => G.players[id].general && G.players[id].general.name === '界李儒');
      
      const target = G.players[targetId];
      const liRu = G.players[liRuId];
      
      const selection = selectedCards[0]; // Should be only 1
      
      let card;
      if (selection.type === 'hand') {
          card = G.hands[targetId][selection.index];
          G.hands[targetId].splice(selection.index, 1);
      } else {
          card = target.equipments[selection.slot];
          target.equipments[selection.slot] = null;
      }
      
      // Give to Li Ru
      G.hands[liRuId].push(card);
      
      G.actionLog.push(`${target.general.name} 将一张【${card.name}】交给了 ${liRu.general.name}`);
      
      // Cleanup
      delete G.miejiTargetId;
      delete G.miejiStage;
      delete G.players[liRuId].isMieJiTargeting;
    },
    
    // Removed miejiOption1 and miejiLiRuTake as requested by user to revert flow

    miejiDiscard: ({ G, playerID }, selectedCards) => {
        const targetId = G.miejiTargetId;
        const target = G.players[targetId];
        
        const handIndices = [];
        const equipSlots = [];
        
        selectedCards.forEach(s => {
            if (s.type === 'hand') handIndices.push(s.index);
            else equipSlots.push(s.slot);
        });
        
        handIndices.sort((a, b) => b - a);
        
        const cardsToDiscard = [];
        
        const targetHand = G.hands[targetId];
        handIndices.forEach(idx => {
            cardsToDiscard.push(targetHand[idx]);
            targetHand.splice(idx, 1);
        });
        
        equipSlots.forEach(slot => {
            cardsToDiscard.push(target.equipments[slot]);
            target.equipments[slot] = null;
        });
        
        // Add to discard pile
        addToDiscardPile(G, cardsToDiscard);
        
        G.actionLog.push(`${target.general.name} 弃置了 ${cardsToDiscard.length} 张牌`);
        
        // Cleanup
        delete G.miejiTargetId;
        delete G.miejiStage;
        // Assuming Li Ru is current player
        const liRuId = Object.keys(G.players).find(id => G.players[id].general.id === '界李儒');
        if (liRuId) {
            delete G.players[liRuId].isMieJiTargeting;
        }
    }
  }
};
