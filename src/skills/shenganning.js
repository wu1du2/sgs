const addToDiscardPile = (G, cards) => {
  if (!cards) return;
  const toAdd = Array.isArray(cards) ? cards : [cards];
  const validCards = toAdd.filter(Boolean);
  if (validCards.length > 0) {
    G.discardPile.push(...validCards);
  }
};

export const shenganningSkill = {
    poxi: {
        name: "魄袭",
        description: "出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以弃置你和该角色手里共计四张牌（没牌的不能弃置）。若如此做，根据弃置牌的数量执行以下效果：\n1张：你结束出牌阶段；\n3张：你回复1点体力；\n4张：你摸四张牌。",
        
        activate: ({ G, playerID }) => {
            G.poxiSelect = {
                active: true,
                sourcePlayerID: playerID,
                targetPlayerID: null,
                stage: 'target_selection',
            };
            G.actionLog.push(`Player ${playerID} activated Poxi (魄袭), selecting target...`);
        },

        selectTarget: ({ G, playerID }, targetID) => {
            if (G.poxiSelect.active && G.poxiSelect.sourcePlayerID === playerID && G.poxiSelect.stage === 'target_selection') {
                if (targetID === playerID) return; // Cannot select self
                G.poxiSelect.targetPlayerID = targetID;
                G.poxiSelect.stage = 'card_selection';
                G.actionLog.push(`Player ${playerID} selected Player ${targetID} for Poxi`);
            }
        },

        confirm: ({ G, playerID }, myCardIndices, targetCardIndices) => {
            if (!G.poxiSelect.active || G.poxiSelect.sourcePlayerID !== playerID) return;

            const targetID = G.poxiSelect.targetPlayerID;
            const targetHand = G.hands[targetID];
            const selfHand = G.hands[playerID];

            // Sort indices descending to remove correctly
            const sortedTargetIndices = [...targetCardIndices].sort((a, b) => b - a);
            const sortedSelfIndices = [...myCardIndices].sort((a, b) => b - a);

            const discardedCards = [];

            // Remove from target hand
            sortedTargetIndices.forEach(index => {
                if (targetHand[index]) {
                    discardedCards.push(targetHand[index]);
                    targetHand.splice(index, 1);
                }
            });

            // Remove from self hand
            sortedSelfIndices.forEach(index => {
                if (selfHand[index]) {
                    discardedCards.push(selfHand[index]);
                    selfHand.splice(index, 1);
                }
            });

            // Add to discard pile
            addToDiscardPile(G, discardedCards);

            const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
            const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
            
            const totalDiscarded = discardedCards.length;
            const selfDiscardedCount = myCardIndices.length;
            G.actionLog.push(`${playerName} used Poxi on ${targetName}, discarding ${totalDiscarded} cards (${selfDiscardedCount} from self)`);

            // Apply effects based on number of discarded cards from SELF
            if (selfDiscardedCount === 0) {
                G.actionLog.push(`${playerName} discarded 0 cards from self: Max HP - 1`);
                if (G.players[playerID].hpMax > 0) {
                    G.players[playerID].hpMax -= 1;
                    // Clamp HP to new Max HP
                    if (G.players[playerID].hp > G.players[playerID].hpMax) {
                        G.players[playerID].hp = G.players[playerID].hpMax;
                    }
                }
            } else if (selfDiscardedCount === 3) {
                const currentHp = G.players[playerID].hp;
                const maxHp = G.players[playerID].hpMax;
                
                if (currentHp < maxHp) {
                    G.players[playerID].hp += 1;
                    G.actionLog.push(`${playerName} recovered 1 HP. New HP: ${G.players[playerID].hp}`);
                } else {
                    G.actionLog.push(`${playerName} is at full health, cannot recover HP.`);
                }
            } else if (selfDiscardedCount === 4) {
                G.actionLog.push(`${playerName} discarded 4 cards from self: Drawing 4 cards`);
                const deck = G.deck;
                const hand = G.hands[playerID];
                for (let i = 0; i < 4; i++) {
                    if (deck.length === 0) {
                        // Reshuffle discard pile if deck is empty
                        if (G.discardPile.length > 0) {
                            G.deck = [...G.discardPile]; // Simple shuffle for now, ideally use shuffle function
                            // Fisher-Yates shuffle
                            for (let j = G.deck.length - 1; j > 0; j--) {
                                const k = Math.floor(Math.random() * (j + 1));
                                [G.deck[j], G.deck[k]] = [G.deck[k], G.deck[j]];
                            }
                            G.discardPile = [];
                        }
                    }
                    
                    if (deck.length > 0) {
                        hand.push(deck.pop());
                    }
                }
            }

            // Reset Poxi state
            G.poxiSelect = {
                active: false,
                sourcePlayerID: null,
                targetPlayerID: null,
                stage: null,
            };
        },

        cancel: ({ G, playerID }) => {
            if (G.poxiSelect.active && G.poxiSelect.sourcePlayerID === playerID) {
                G.poxiSelect = {
                    active: false,
                    sourcePlayerID: null,
                    targetPlayerID: null,
                    stage: null,
                };
                G.actionLog.push(`Player ${playerID} cancelled Poxi`);
            }
        }
    },

    jieying: {
        name: "劫营",
        description: "回合开始时，若你的手牌数最多（或之一），你可以获得一名其他角色的所有手牌。回合结束时，你将手牌补至或弃置至体力上限。",
        
        activate: ({ G, playerID }) => {
            G.jieyingSelect = {
                active: true,
                sourcePlayerID: playerID,
                targetPlayerID: null,
                stage: 'target_selection',
            };
            G.actionLog.push(`Player ${playerID} activated Jieying (劫营), selecting target...`);
        },

        selectTarget: ({ G, playerID }, targetID) => {
            if (G.jieyingSelect.active && G.jieyingSelect.sourcePlayerID === playerID && G.jieyingSelect.stage === 'target_selection') {
                if (targetID === playerID) return; // Cannot select self
                
                const targetHand = G.hands[targetID];
                const count = targetHand.length;
                
                // Move all cards from target hand to source hand
                G.hands[playerID].push(...targetHand);
                G.hands[targetID] = [];
                
                const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
                const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
                
                G.actionLog.push(`${playerName} used Jieying on ${targetName}, obtaining ${count} cards`);
                
                // Reset Jieying state
                G.jieyingSelect = {
                    active: false,
                    sourcePlayerID: null,
                    targetPlayerID: null,
                    stage: null,
                };
            }
        },

        cancel: ({ G, playerID }) => {
            if (G.jieyingSelect.active && G.jieyingSelect.sourcePlayerID === playerID) {
                G.jieyingSelect = {
                    active: false,
                    sourcePlayerID: null,
                    targetPlayerID: null,
                    stage: null,
                };
                G.actionLog.push(`Player ${playerID} cancelled Jieying`);
            }
        }
    }
};