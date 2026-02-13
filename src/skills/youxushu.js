
// Helper to add to discard pile
const addToDiscardPile = (G, cards) => {
  if (!cards) return;
  const toAdd = Array.isArray(cards) ? cards : [cards];
  const validCards = toAdd.filter(Boolean);
  
  // Restore original names/types/suits if needed
  validCards.forEach(c => {
      if (c._originalName) { c.name = c._originalName; delete c._originalName; }
      if (c._originalType) { c.type = c._originalType; delete c._originalType; }
      if (c._originalSuit) { c.suit = c._originalSuit; delete c._originalSuit; }
  });

  if (validCards.length > 0) {
    G.discardPile.push(...validCards);
  }
};

export const youxushuSkill = {
    moves: {
        youxushuXiaXing: ({ G, playerID }) => {
            const player = G.players[playerID];
            
            // Search for "玄剑" (Xuan Jian) in discard pile
            const xuanJianIndex = G.discardPile.findIndex(c => c.name === '玄剑');
            let xuanJianCard;

            if (xuanJianIndex !== -1) {
                // Found in discard pile
                xuanJianCard = G.discardPile[xuanJianIndex];
                G.discardPile.splice(xuanJianIndex, 1);
            } else {
                // Not found, generate it
                // "玄剑黑桃A"
                xuanJianCard = {
                    suit: '♠',
                    rank: 'A',
                    name: '玄剑',
                    type: '武器',
                    id: `generated-xuanjian-${Date.now()}`
                };
            }

            // Put into weapon slot
            const oldWeapon = player.equipments.weapon;
            if (oldWeapon) {
                addToDiscardPile(G, [oldWeapon]);
            }
            player.equipments.weapon = xuanJianCard;
            
            const playerName = player.general ? player.general.name : `Player ${playerID}`;
            G.actionLog.push(`${playerName} 触发侠行，装备了玄剑`);
        },

        youxushuQiHuiClick: ({ G, playerID }, button) => {
            const player = G.players[playerID];
            
            // Initialize state if not exists
            if (!player.qiHui) {
                player.qiHui = {
                    litButtons: [],
                    stage: 'lighting', // 'lighting', 'selecting_option', 'dimming'
                    selectedOption: null
                };
            }

            const { qiHui } = player;

            if (qiHui.stage === 'lighting') {
                if (!qiHui.litButtons.includes(button)) {
                    qiHui.litButtons.push(button);
                    
                    // Check if all 3 are lit
                    const allButtons = ['基本', '锦囊', '装备'];
                    const allLit = allButtons.every(b => qiHui.litButtons.includes(b));
                    
                    if (allLit) {
                        qiHui.stage = 'selecting_option';
                    }
                }
            } else if (qiHui.stage === 'dimming') {
                if (qiHui.litButtons.includes(button)) {
                    // Remove button (dim it)
                    qiHui.litButtons = qiHui.litButtons.filter(b => b !== button);
                    
                    // Check if 2 buttons dimmed (meaning 1 left)
                    // Wait, logic says "Dim 2 buttons". Initially 3 lit. So 3 - 2 = 1 left.
                    if (qiHui.litButtons.length === 1) {
                        // Execute option
                        const option = qiHui.selectedOption;
                        const playerName = player.general ? player.general.name : `Player ${playerID}`;

                        if (option === 1) {
                            // Recover 1 HP
                            if (player.hp < player.hpMax) {
                                player.hp++;
                                G.actionLog.push(`${playerName} 通过启诲回复了1点体力`);
                            } else {
                                G.actionLog.push(`${playerName} 通过启诲试图回复体力，但体力已满`);
                            }
                        } else if (option === 2) {
                            // Draw 2 cards
                            // Helper draw logic
                            for (let i = 0; i < 2; i++) {
                                if (G.deck.length === 0) {
                                    if (G.discardPile.length > 0) {
                                        // Simple shuffle
                                        let currentIndex = G.discardPile.length, randomIndex;
                                        const newArray = [...G.discardPile];
                                        while (currentIndex != 0) {
                                            randomIndex = Math.floor(Math.random() * currentIndex);
                                            currentIndex--;
                                            [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
                                        }
                                        G.deck = newArray;
                                        G.discardPile = [];
                                    } else {
                                        break;
                                    }
                                }
                                const card = G.deck.shift();
                                if (card) G.hands[playerID].push(card);
                            }
                            G.actionLog.push(`${playerName} 通过启诲摸了两张牌`);
                        } else if (option === 3) {
                            // Log action
                            G.actionLog.push(`${playerName} 选择：使用的下一张牌不计入使用次数且无次数限制`);
                        }

                        // Reset state
                        qiHui.litButtons = [];
                        qiHui.stage = 'lighting';
                        qiHui.selectedOption = null;
                    }
                }
            }
        },

        youxushuQiHuiSelectOption: ({ G, playerID }, option) => {
            const player = G.players[playerID];
            if (player.qiHui && player.qiHui.stage === 'selecting_option') {
                player.qiHui.selectedOption = option;
                player.qiHui.stage = 'dimming';
            }
        }
    }
};
