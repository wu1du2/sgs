export const jiexushengSkill = {
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
        action: ({ G, ctx }, playerID, targetID, selectedCards = { hand: [], equipments: [] }) => {
            const target = G.players[targetID];
            const targetHand = G.hands[targetID];
            
            // Initialize pojunCards array if it doesn't exist
            if (!target.pojunCards) {
                target.pojunCards = [];
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

            console.log(`Player ${playerID} used Po Jun on Player ${targetID}. Moved ${cardsToMove.length} cards.`);
            
            return cardsToMove;
        },
        
        /**
         * Helper to return cards at end of turn
         * Should be called at turn end
         */
        returnCards: ({ G }, targetID) => {
            // Logic moved to Game.js to handle storage structure
        }
    }
};