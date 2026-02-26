export const jiexushengSkill = {
    usePoJun: ({ G, playerID }, targetID) => {
        const target = G.players[targetID];
        const hp = target.hp;
        
        G.pojunSelect = {
            active: true,
            sourcePlayerID: playerID,
            targetPlayerID: targetID,
            limit: hp
        };
        
        G.actionLog.push(`Player ${playerID} 对 Player ${targetID} 使用了破军`);
    },
    pojun: {
        name: "破军",
        description: "当你使用【杀】指定一名角色为目标后，你可以将该角色的至多X张牌置于其武将牌上（X为该角色的体力值），然后当前回合结束时，其获得武将牌上的牌。",
        /**
         * Po Jun Action
         * @param {object} G - Game state
         * @param {object} ctx - Game context
         * @param {string} playerID - ID of the player using the skill
         * @param {string} targetID - ID of the target player
         * @param {object} selectedCards - Cards to move { hand: [indices], equipments: [slots] }
         */
        action: ({ G }, playerID, targetID, selectedCards = { hand: [], equipments: [] }) => {
            const target = G.players[targetID];
            const targetHand = G.hands[targetID];
            const source = G.players[playerID];
            
            // Initialize pojun object on source player if it doesn't exist
            if (!source.pojun) {
                source.pojun = {};
            }
            // Initialize array for this target if it doesn't exist
            if (!source.pojun[targetID]) {
                source.pojun[targetID] = [];
            }

            const cardsToMove = [];

            // Handle hand cards
            // Sort indices in descending order to avoid shifting issues when removing
            const handIndices = (selectedCards.hand || []).sort((a, b) => b - a);
            handIndices.forEach(index => {
                if (index >= 0 && index < targetHand.length) {
                    const card = targetHand[index];
                    cardsToMove.push({ ...card, originalType: 'hand' });
                    targetHand.splice(index, 1);
                }
            });

            // Handle equipment cards
            const equipSlots = selectedCards.equipments || [];
            equipSlots.forEach(slot => {
                if (target.equipments[slot]) {
                    const card = target.equipments[slot];
                    cardsToMove.push({ ...card, originalType: 'equipment', originalSlot: slot });
                    target.equipments[slot] = null;
                }
            });

            // Move judgment cards
            if (selectedCards.judges) {
                selectedCards.judges.forEach(slot => {
                    const card = target.judges[slot];
                    if (card) {
                        cardsToMove.push(card);
                        delete target.judges[slot];
                    }
                });
            }

            // Add cards to source's pojun area for this target
            source.pojun[targetID].push(...cardsToMove);

            console.log(`Player ${playerID} used Po Jun on Player ${targetID}. Moved ${cardsToMove.length} cards.`);
            
            return cardsToMove;
        },
        
        /**
         * Helper to return cards at end of turn
         * Should be called at turn end or manually
         */
        returnCards: ({ G, playerID }, targetID) => {
            const source = G.players[playerID];
            if (!source || !source.pojun || !source.pojun[targetID]) return;

            const cards = source.pojun[targetID];
            if (cards.length === 0) return;

            const targetHand = G.hands[targetID];
            
            // Return all cards to hand
            cards.forEach(card => {
                // Remove extra properties
                const { originalType: _originalType, originalSlot: _originalSlot, ...cleanCard } = card;
                targetHand.push(cleanCard);
            });

            // Clear cards for this target
            delete source.pojun[targetID];
            
            G.actionLog.push(`Player ${targetID} 从破军中取回了牌。`);
        }
    }
};
