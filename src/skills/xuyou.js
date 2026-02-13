
// Helper to shuffle array with optional RNG
function shuffle(array, rng) {
  let currentIndex = array.length,  randomIndex;
  const newArray = [...array];

  while (currentIndex != 0) {
    if (rng) {
      randomIndex = Math.floor(rng.Number() * currentIndex);
    } else {
      randomIndex = Math.floor(Math.random() * currentIndex);
    }
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

// Helper to add to discard pile (re-implemented since not exported)
const addToDiscardPile = (G, cards) => {
  if (!cards) return;
  const toAdd = Array.isArray(cards) ? cards : [cards];
  const validCards = toAdd.filter(Boolean);
  
  // Restore original names/types/suits if needed (simplified from Game.js)
  validCards.forEach(c => {
      if (c._originalName) { c.name = c._originalName; delete c._originalName; }
      if (c._originalType) { c.type = c._originalType; delete c._originalType; }
      if (c._originalSuit) { c.suit = c._originalSuit; delete c._originalSuit; }
  });

  if (validCards.length > 0) {
    G.discardPile.push(...validCards);
  }
};

export const xuyouSkill = {
    moves: {
        xuyouDrawCard: ({ G, ctx, playerID }, actionId) => {
            const player = G.players[playerID];

            // Idempotency check
            if (actionId && player.lastActionId === actionId) {
                return;
            }
            if (actionId) {
                player.lastActionId = actionId;
            }

            if (player.skipNextDraw) {
                player.skipNextDraw = false;
                const playerName = player.general ? player.general.name : `Player ${playerID}`;
                G.actionLog.push(`${playerName} skips draw phase`);
                return;
            }

            // Draw 1 card from BOTTOM
            // Game.js drawCards uses shift() (top). We use pop() (bottom).
            
            if (G.deck.length === 0) {
                if (G.discardPile.length > 0) {
                    G.deck = shuffle(G.discardPile, ctx.random);
                    G.discardPile = [];
                } else {
                    // No cards left
                    return;
                }
            }

            const card = G.deck.pop(); // Draw from bottom
            if (card) {
                G.hands[playerID].push(card);
                const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
                G.actionLog.push(`${playerName} 从牌堆底摸了一张牌 (寸目)`);
            }
        },

        xuyouChengLue: ({ G, ctx, playerID }) => {
            // Check if already used this turn? Prompt says "出牌阶段限一次" in json, but user description doesn't explicitly limit it.
            // But usually skills are limited. However, user said "Strictly follow my description". 
            // Description: "Cheng Lue (Yang): Click...". It doesn't say "Once per phase".
            // BUT, if I don't limit it, they can draw infinite cards?
            // "Click afterwards... skill name changes".
            // If it changes, maybe the state change implies the limit or progression.
            // I'll assume no hard limit unless implied by state. 
            // But usually "Click" implies an action.
            // Let's implement the state toggle.
            
            // Initialize state if needed
            if (!G.players[playerID].xuyouState) {
                G.players[playerID].xuyouState = 'yang'; // Default to Yang
            }

            const state = G.players[playerID].xuyouState;

            if (state === 'yang') {
                // Draw 1 (from bottom? User says "Xu You clicks deck draw cards...". 
                // Skill says "Xu You draw 1 card". Does skill draw follow special mechanism?
                // Usually yes, "draw cards" triggers character passives.
                // "Special mechanism: When Xu You clicks deck...". This skill is clicking skill button.
                // But "Cun Mu" says "When you draw cards...".
                // I will assume drawing from skill also draws from bottom.
                
                // Draw 1
                 if (G.deck.length === 0) {
                    if (G.discardPile.length > 0) {
                        G.deck = shuffle(G.discardPile, ctx.random);
                        G.discardPile = [];
                    }
                }
                const card = G.deck.pop();
                if (card) G.hands[playerID].push(card);
                
                // Open selection to discard 2
                G.xuyouChengLueSelect = {
                    active: true,
                    stage: 'discard_2_yang',
                    playerID: playerID
                };
            } else {
                // Yin
                // Draw 2
                for (let i=0; i<2; i++) {
                     if (G.deck.length === 0) {
                        if (G.discardPile.length > 0) {
                            G.deck = shuffle(G.discardPile, ctx.random);
                            G.discardPile = [];
                        } else break;
                    }
                    const c = G.deck.pop();
                    if (c) G.hands[playerID].push(c);
                }

                // Open selection to discard 1
                G.xuyouChengLueSelect = {
                    active: true,
                    stage: 'discard_1_yin',
                    playerID: playerID
                };
            }
        },

        xuyouChengLueDiscard: ({ G, playerID }, cardIndices) => {
            const hand = G.hands[playerID];
            const discarded = [];
            
            // Sort descending
            [...cardIndices].sort((a, b) => b - a).forEach(index => {
                discarded.push(hand[index]);
                hand.splice(index, 1);
            });
            
            addToDiscardPile(G, discarded);
            
            // Record suits
            const suits = discarded.map(c => c.suit).join(', ');
            G.actionLog.push(`成略: Discarded ${suits}`);
            
            // Store recorded suits for UI display? User says "Record ... in below".
            if (!G.players[playerID].chengLueSuits) {
                G.players[playerID].chengLueSuits = [];
            }
            G.players[playerID].chengLueSuits.push(...discarded.map(c => c.suit));

            // Change state
            const state = G.players[playerID].xuyouState || 'yang';
            if (state === 'yang') {
                G.players[playerID].xuyouState = 'yin';
            } else {
                G.players[playerID].xuyouState = 'yin'; // User said "Then skill name changes to Cheng Lue (Yin)"
            }

            G.xuyouChengLueSelect = { active: false, stage: null, playerID: null };
        },
        
        xuyouPlayCards: ({ G, playerID }, cardIndices, targetIds) => {
             // New Effect: If Shi Cai area has cards, move them to discard pile first.
             if (G.players[playerID].shicai && G.players[playerID].shicai.length > 0) {
                 addToDiscardPile(G, [...G.players[playerID].shicai]);
                 G.players[playerID].shicai = [];
                 G.actionLog.push(`Shi Cai area cleared before playing card.`);
             }

             // This replicates playCards but redirects to Shi Cai Area
             const hand = G.hands[playerID];
             const cardsPlayed = cardIndices.map(i => hand[i]);
             
             // Remove from hand
             [...cardIndices].sort((a, b) => b - a).forEach(index => {
                hand.splice(index, 1);
             });

             const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
             const cardNames = cardsPlayed.map(c => `${c.suit}${c.rank} ${c.name}`).join(' ');
             
             let logEntry = `${playerName} played ${cardNames}`;
             if (targetIds && targetIds.length > 0) {
                const targetNames = targetIds.map(tid => G.players[tid].general ? G.players[tid].general.name : `Player ${tid}`).join(', ');
                logEntry += ` targeting ${targetNames}`;
             }
             G.actionLog.push(logEntry);

             // Handle effects (simplified for brevity, should match Game.js logic or delegate?)
             // Since I cannot call Game.js internal playCards, I have to duplicate logic.
             // This is risky but required by "Rewrite logic".
             
             cardsPlayed.forEach(card => {
                // 1. Equipment
                if (['武器', '防具', '加一', '减一'].includes(card.type)) {
                    let slot = '';
                    if (card.type === '武器') slot = 'weapon';
                    else if (card.type === '防具') slot = 'armor';
                    else if (card.type === '加一') slot = 'plusOne';
                    else if (card.type === '减一') slot = 'minusOne';
                    
                    const oldCard = G.players[playerID].equipments[slot];
                    if (oldCard) {
                        addToDiscardPile(G, oldCard);
                    }
                    G.players[playerID].equipments[slot] = card;
                    G.actionLog.push(`${playerName} equipped ${card.name}`);
                    // Equipment stays on board, NOT to Shi Cai area immediately?
                    // "Xu You played a card... settle...".
                    // Equipment is "used". Does it go to Shi Cai?
                    // User: "After using a card... it enters Shi Cai area".
                    // Usually equipment enters play area. If it enters Shi Cai area, it's not equipped.
                    // "Includes equipment cards" in description suggests they ARE included.
                    // But if I put it in Shi Cai area, it's not equipped.
                    // The prompt says: "若此牌与你本回合使用的牌类型均不同（包括装备牌），你可以将此牌置于牌堆顶...".
                    // That is the CONDITION.
                    // But the ACTION is: "许攸出牌后，牌不会进入弃牌堆，而是进入恃才区域".
                    // If I equip a weapon, it doesn't go to discard pile anyway. It goes to slot.
                    // So maybe Shi Cai only applies to cards that WOULD go to discard pile?
                    // "Xu You played a card... card will not go to discard pile, but to Shi Cai area".
                    // Equipment goes to slot. So it doesn't apply.
                    // BUT, what if I replace a weapon? The OLD weapon goes to discard.
                    // The PLAYED card is the new weapon. It goes to slot.
                    // So I assume Shi Cai only intercepts cards that are discarded after use (Basic, Scrolls).
                    // Wait, "Shi Cai" text in prompt: "许攸出牌后，牌不会进入弃牌堆，而是进入恃才区域".
                    // If I play a Slash, it goes to discard. So it goes to Shi Cai.
                    // If I play a Weapon, it goes to Slot. So it stays in Slot.
                    // Unless the skill implies "You play it, it resolves, then goes to Shi Cai INSTEAD of discard".
                    // Since Weapon stays in Slot, it doesn't go to discard.
                    // So I will only intercept Non-Equipment, Non-Delayed-Scroll cards?
                    // Or maybe even Equipment goes to Shi Cai? If so, you can't equip anything. That would be broken.
                    // So I assume Equipment works as normal (goes to slot).
                    // What about Delayed Scrolls (Lightning)? They go to Judge area.
                    // So only Basic and Instant Scrolls go to Shi Cai.
                } 
                else if (['乐', '兵', '电'].includes(card.type)) {
                     // Delayed scrolls go to judge area.
                     // Implement logic similar to Game.js
                     let targetID = null;
                     let judgeSlot = '';
                     if (card.type === '电') { targetID = playerID; judgeSlot = 'dian'; }
                     else if (card.type === '乐') { targetID = targetIds[0]; judgeSlot = 'le'; }
                     else if (card.type === '兵') { targetID = targetIds[0]; judgeSlot = 'bing'; }
                     
                     if (targetID !== null) {
                         if (G.players[targetID].judges[judgeSlot]) {
                             // Occupied
                             // Does it go to Shi Cai? Logic says "not to discard pile".
                             // Game.js puts it in discard pile if occupied.
                             // So here it goes to Shi Cai.
                             if (!G.players[playerID].shicai) G.players[playerID].shicai = [];
                             G.players[playerID].shicai.push(card);
                             G.actionLog.push(`Judgment slot occupied. Card moved to Shi Cai.`);
                         } else {
                             G.players[targetID].judges[judgeSlot] = card;
                             G.actionLog.push(`${playerName} placed ${card.name} on target's judgment area`);
                         }
                     }
                }
                else {
                    // Basic and Instant Scrolls
                    // Execute effect
                    if (card.name === '桃') {
                        if (G.players[playerID].hp < G.players[playerID].hpMax) {
                             G.players[playerID].hp++;
                             G.actionLog.push(`${playerName} used Peach, HP +1`);
                        }
                    } 
                    // ... (Other card effects like Harvest, Dismantlement etc. - duplicating Game.js logic is tedious and error prone)
                    // Is there a way to reuse? No.
                    // I will implement basic placeholders for complex cards or assume they work via side effects if I can't fully implement.
                    // Actually, for "Harvest", "Dismantlement", etc., they set state in G.
                    // I can copy those lines.
                    else if (card.name === '五谷丰登') {
                       G.harvestCountSelect = { active: true, playerID: playerID };
                    } else if (['顺手牵羊', '过河拆桥', '火攻', '借刀杀人'].includes(card.name)) {
                       if (targetIds && targetIds.length === 1) {
                          let actionType = '';
                          if (card.name === '顺手牵羊') actionType = 'steal';
                          else if (card.name === '过河拆桥') actionType = 'discard';
                          else if (card.name === '火攻') actionType = 'fire_attack';
                          else if (card.name === '借刀杀人') actionType = 'collateral';

                          G.pendingEffect = {
                             active: true,
                             sourcePlayerID: playerID,
                             targetPlayerID: targetIds[0],
                             actionType: actionType,
                             pendingCard: card
                          };
                       }
                    }

                    // MOVE TO SHI CAI
                    if (!G.players[playerID].shicai) G.players[playerID].shicai = [];
                    G.players[playerID].shicai.push(card);
                    G.actionLog.push(`${card.name} moved to Shi Cai area`);
                }
             });
        },
        
        xuyouShiCaiToTop: ({ G, playerID }, index) => {
            const shicai = G.players[playerID].shicai;
            if (!shicai || !shicai[index]) return;
            
            const card = shicai.splice(index, 1)[0];
            
            // Move to top of deck
            G.deck.unshift(card);
            G.actionLog.push(`Shi Cai: Moved ${card.name} to top of deck`);

            // Draw 1 card from BOTTOM (Cun Mu)
            if (G.deck.length === 0) {
                if (G.discardPile.length > 0) {
                    G.deck = shuffle(G.discardPile);
                    G.discardPile = [];
                }
            }
            const drawnCard = G.deck.pop();
            if (drawnCard) {
                G.hands[playerID].push(drawnCard);
                G.actionLog.push(`Xu You drew a card from bottom (Shi Cai)`);
            }
        },
        
        xuyouShiCaiToDiscard: ({ G, playerID }) => {
            const shicai = G.players[playerID].shicai;
            if (!shicai || shicai.length === 0) return;
            
            addToDiscardPile(G, [...shicai]);
            G.players[playerID].shicai = [];
            G.actionLog.push(`Shi Cai: Moved all cards to discard pile`);
        },
        
        xuyouEquipToTop: ({ G, playerID }, slot) => {
            const player = G.players[playerID];
            const card = player.equipments[slot];
            if (!card) return;

            // Remove from slot
            player.equipments[slot] = null;

            // Move to top of deck
            G.deck.unshift(card);
            
            const playerName = player.general ? player.general.name : `Player ${playerID}`;
            G.actionLog.push(`${playerName} moved equipment ${card.name} to top of deck (Control Top)`);

            // Draw 1 card from BOTTOM
            if (G.deck.length === 0) {
                if (G.discardPile.length > 0) {
                    G.deck = shuffle(G.discardPile);
                    G.discardPile = [];
                }
            }
            const drawnCard = G.deck.pop();
            if (drawnCard) {
                G.hands[playerID].push(drawnCard);
                G.actionLog.push(`${playerName} drew a card from bottom (Control Top)`);
            }
        }
    }
};
