import { addCardsToDiscard, addCardsToHand } from './cardUtils.js';

const shuffle = (array, rng) => {
  if (!rng || typeof rng.Number !== 'function') {
    throw new Error('random is required');
  }
  let currentIndex = array.length;
  let randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(rng.Number() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
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
            G.actionLog.push(`Player ${playerID} 发动了魄袭，正在选择目标...`);
        },

        selectTarget: ({ G, playerID }, targetID) => {
            if (G.poxiSelect.active && G.poxiSelect.sourcePlayerID === playerID && G.poxiSelect.stage === 'target_selection') {
                if (targetID === playerID) return; // Cannot select self
                G.poxiSelect.targetPlayerID = targetID;
                G.poxiSelect.stage = 'card_selection';
                G.actionLog.push(`Player ${playerID} 为魄袭选择了 Player ${targetID}`);
            }
        },

        confirm: ({ G, playerID, random }, myCardIndices, targetCardIndices) => {
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
            addCardsToDiscard(G, discardedCards);

            const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
            const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
            
            const totalDiscarded = discardedCards.length;
            const selfDiscardedCount = myCardIndices.length;
            G.actionLog.push(`${playerName} 对 ${targetName} 使用了魄袭，弃置了 ${totalDiscarded} 张牌（其中 ${selfDiscardedCount} 张来自自身）`);

            // Apply effects based on number of discarded cards from SELF
            if (selfDiscardedCount === 0) {
                G.actionLog.push(`${playerName} 自身未弃牌：体力上限-1`);
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
                    G.actionLog.push(`${playerName} 回复了1点体力。当前体力：${G.players[playerID].hp}`);
                } else {
                    G.actionLog.push(`${playerName} 体力已满，无法回复体力。`);
                }
            } else if (selfDiscardedCount === 4) {
                G.actionLog.push(`${playerName} 自身弃置了4张牌：摸4张牌`);
                const deck = G.deck;
                for (let i = 0; i < 4; i++) {
                    if (deck.length === 0) {
                        // Reshuffle discard pile if deck is empty
                        if (G.discardPile.length > 0) {
                            G.deck = shuffle(G.discardPile, random);
                            G.discardPile = [];
                        }
                    }
                    
                    if (deck.length > 0) {
                        addCardsToHand(G, playerID, deck.pop());
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
                G.actionLog.push(`Player ${playerID} 取消了魄袭`);
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
            G.actionLog.push(`Player ${playerID} 发动了劫营，正在选择目标...`);
        },

        selectTarget: ({ G, playerID }, targetID) => {
            if (G.jieyingSelect.active && G.jieyingSelect.sourcePlayerID === playerID && G.jieyingSelect.stage === 'target_selection') {
                if (targetID === playerID) return; // Cannot select self
                
                const targetHand = G.hands[targetID];
                const count = targetHand.length;
                
                // Move all cards from target hand to source hand
                addCardsToHand(G, playerID, targetHand);
                G.hands[targetID] = [];
                
                const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
                const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
                
                G.actionLog.push(`${playerName} 对 ${targetName} 使用了劫营，获得了 ${count} 张牌`);
                
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
                G.actionLog.push(`Player ${playerID} 取消了劫营`);
            }
        }
    }
};
