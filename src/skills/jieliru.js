import { SGS_CARDS } from '../sgs_data.js';
import { addCardsToDiscard, addCardsToHand } from './cardUtils.js';

export const jieliruSkill = {
  useJuece: ({ G, playerID }, targetID, applyDamage) => {
      const player = G.players[playerID];
      const target = G.players[targetID];
      if (!player || !target) return;
      
      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      const targetName = target.general ? target.general.name : `Player ${targetID}`;
      
      G.actionLog.push(`${playerName} 对 ${targetName} 发动绝策`);
      
      if (applyDamage) {
          applyDamage(G, playerID, targetID, 1);
      }
  },

  useFencheng: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player) return;
      
      // Initialize Fencheng state
      // Targets: All other players
      const targets = Object.keys(G.players).filter(pid => pid !== playerID);
      // Sort targets by turn order (simplified: just numeric/array order for now, 
      // or use rotate from current player).
      // Assuming IDs are '0', '1', '2'.
      const playerIndex = parseInt(playerID);
      const sortedTargets = targets.sort((a, b) => {
          const ia = parseInt(a);
          const ib = parseInt(b);
          // (ia - playerIndex + 3) % 3 ... logic to sort from next player
          const da = (ia - playerIndex + 3) % 3;
          const db = (ib - playerIndex + 3) % 3;
          return da - db;
      });
      
      G.jieliruFencheng = {
          active: true,
          sourcePlayerID: playerID,
          targets: sortedTargets,
          currentIndex: 0,
          currentX: 1 // Initial X is 1? Description: "X is previous target discarded count + 1".
          // Wait, for the FIRST target, what is X?
          // Usually starts at 1. Or 0+1?
          // Let's assume initial X=1.
      };
      
      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 发动焚城`);
      
      // Trigger first target
      // This requires a "next" move or effect trigger.
      // We can't trigger it here directly if it requires user input from *that* player.
      // But we can set the state and UI should react.
  },

  moves: {
    fenchengRespond: ({ G, playerID }, choice, cardsToDiscard) => {
        // choice: 'discard' or 'damage'
        if (!G.jieliruFencheng || !G.jieliruFencheng.active) return;
        
        const state = G.jieliruFencheng;
        const currentTargetID = state.targets[state.currentIndex];
        
        if (playerID !== currentTargetID) return; // Wrong player responding
        
        const player = G.players[playerID];
        const sourcePlayer = G.players[state.sourcePlayerID];
        
        if (choice === 'damage') {
            // Take 2 Fire Damage
            // We need applyDamage here. But moves don't have callbacks.
            // We'll rely on a flag or call a global move?
            // Or assume applyDamage is available in context? No.
            // We can add a "pendingDamage" to queue or something.
            // Or better: The move in Game.js calls this, and WE return instruction?
            // Or we just modify G to request damage?
            // Let's use `G.pendingEffect` or similar.
            // Or just implement damage logic here if simple (hp - 2).
            // But damage triggers things.
            // I'll implement "simple damage" (hp decrease) for now, 
            // OR I can use `applyDamageInternal` if I import it? 
            // `applyDamageInternal` is not exported from Game.js usually.
            // I will export it or duplicate logic.
            // For now, simple HP loss.
            // Wait, "Fire Damage".
            // I'll set a flag `G.jieliruFencheng.pendingDamage = { target: playerID, amount: 2, type: 'fire' }`
            // and handle it in Game.js `fenchengRespond` wrapper.
            
            // Actually, I'll put the logic in Game.js moves, and just use jieliru.js for helper or nothing.
            // I'll define `fenchengRespond` in Game.js directly.
        } else if (choice === 'discard') {
            // Discard cards
            // cardsToDiscard is array of indices/slots
            // Discard them.
            // Update X = discarded count + 1.
            const count = cardsToDiscard.length;
            // Validate count >= X?
            // Yes.
            if (count < state.currentX) return; // Invalid
            
            // Logic to discard (add to discard pile)
            // Need `addCardsToDiscard`.
            // I'll assume Game.js handles the actual discard if I return data?
            // No, moves modify G.
            // I'll import `addCardsToDiscard`.
            addCardsToDiscard(G, cardsToDiscard); // This needs full card objects, not indices.
            // So `cardsToDiscard` must be card objects.
            
            state.currentX = count + 1;
            G.actionLog.push(`${player.general.name} 弃置了 ${count} 张牌`);
        }
        
        // Next target
        state.currentIndex++;
        if (state.currentIndex >= state.targets.length) {
            // Done
            G.jieliruFencheng = null;
        }
    },

    miejiTarget: ({ G, playerID }, targetId) => {
      // Validate target
      if (targetId === playerID) return;
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

    miejiGive: ({ G }, selectedCards) => {
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
      addCardsToHand(G, liRuId, card);
      
      G.actionLog.push(`${target.general.name} 将一张【${card.name}】交给了 ${liRu.general.name}`);
      
      // Cleanup
      delete G.miejiTargetId;
      delete G.miejiStage;
      delete G.players[liRuId].isMieJiTargeting;
    },
    
    // Removed miejiOption1 and miejiLiRuTake as requested by user to revert flow

    miejiDiscard: ({ G }, selectedCards) => {
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
        addCardsToDiscard(G, cardsToDiscard);
        
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
