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
      // playerID here is the current turn player (Li Ru), but the move is triggered by Target?
      // No, moves are executed by the current player usually, unless we use `turn` stages or `activePlayers`.
      // But this game seems to be single-seat shared-state (hotseat or similar simplified model).
      // If I call the move, I can pass the targetID or infer it.
      // The `playerID` in context is the `ctx.currentPlayer`? Or the one who called it?
      // In `board.game` (bgio), `playerID` is the one who made the move.
      // But it's Li Ru's turn. The Target is responding.
      // If the game framework allows any player to make moves at any time (if configured), fine.
      // Otherwise, we might need to simulate it.
      // Assuming `playerID` in the move function is the one who called it.
      
      // But wait, the UI for Target will be shown. If Target clicks "Give", who calls the move?
      // The Target player.
      // So `playerID` will be `G.miejiTargetId`.
      
      const targetId = G.miejiTargetId;
      const liRuId = Object.keys(G.players).find(id => G.players[id].general && G.players[id].general.name === '界李儒'); // Or just use `ctx.currentPlayer` if it's Li Ru's turn.
      // Assuming it's Li Ru's turn.
      
      const target = G.players[targetId];
      const liRu = G.players[liRuId || playerID]; // Fallback to current player if Li Ru is current
      
      // selectedCards is array of { type: 'hand'|'equip', index|slot }
      // We need to process them.
      // Sort indices descending to avoid shift issues for hand cards.
      
      const handIndices = [];
      const equipSlots = [];
      
      selectedCards.forEach(s => {
          if (s.type === 'hand') handIndices.push(s.index);
          else equipSlots.push(s.slot);
      });
      
      handIndices.sort((a, b) => b - a);
      
      const cardsToGive = [];
      
      // Remove from hand
      const targetHand = G.hands[targetId];
      handIndices.forEach(idx => {
          cardsToGive.push(targetHand[idx]);
          targetHand.splice(idx, 1);
      });
      
      // Remove from equip
      equipSlots.forEach(slot => {
          cardsToGive.push(target.equipments[slot]);
          target.equipments[slot] = null;
      });
      
      // Give to Li Ru
      const liRuHand = G.hands[liRuId || playerID];
      liRuHand.push(...cardsToGive);
      
      G.actionLog.push(`${target.general.name} 交给了 ${liRu.general.name} ${cardsToGive.length} 张牌`);
      
      // Cleanup
      delete G.miejiTargetId;
      delete G.miejiStage;
      delete G.players[liRuId || playerID].isMieJiTargeting;
    },

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
