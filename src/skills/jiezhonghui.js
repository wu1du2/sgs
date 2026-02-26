import { addCardsToDiscard, addCardsToHand } from './cardUtils.js';

export const jiezhonghuiSkill = {
    quanji: {
        name: "权计",
        description: "出牌阶段结束时，若你的手牌数大于体力值，或当你受到1点伤害后，你可以摸一张牌并将一张手牌置于你的武将牌上，称为“权”（你的手牌上限增加“权”的数量）。",
        
        // Helper to draw a card
        drawCard: (G, playerID, rng) => {
            if (G.deck.length === 0) {
                if (G.discardPile.length > 0) {
                    if (!rng || typeof rng.Number !== 'function') {
                        throw new Error('random is required');
                    }
                    let currentIndex = G.discardPile.length;
                    let randomIndex;
                    const newArray = [...G.discardPile];
                    while (currentIndex !== 0) {
                        randomIndex = Math.floor(rng.Number() * currentIndex);
                        currentIndex--;
                        [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
                    }
                    G.deck = newArray;
                    G.discardPile = [];
                } else {
                    return null; // No cards
                }
            }
            const card = G.deck.shift();
            addCardsToHand(G, playerID, card);
            return card;
        },

        // Move card from hand to Quan
        addToQuan: (G, playerID, cardIndex) => {
            const player = G.players[playerID];
            const hand = G.hands[playerID];
            
            if (cardIndex >= 0 && cardIndex < hand.length) {
                const card = hand.splice(cardIndex, 1)[0];
                if (!player.quan) {
                    player.quan = [];
                }
                player.quan.push(card);
                
                // Update max hand card limit logic is usually dynamic based on quan.length
                // We don't need to set a variable, just ensure the limit check uses quan.length
                
                return card;
            }
            return null;
        }
    },
    
    zili: {
        name: "自立",
        description: "觉醒技，准备阶段，若“权”的数量达到3或更多，你减1点体力上限，然后获得“排异”。",
        action: (G, playerID) => {
            const player = G.players[playerID];
            if (player.hpMax > 0) {
                player.hpMax -= 1;
                if (player.hp > player.hpMax) {
                    player.hp = player.hpMax;
                }
                // Usually grants "Pai Yi", but we'll assume Pai Yi is available but maybe disabled until awakened?
                // The user just said "Clicking after, max HP -1".
                player.isAwakened = true; // Mark as awakened if needed
            }
        }
    },
    
    paiyi: {
        name: "排异",
        description: "出牌阶段限一次，你可以将一张“权”置入弃牌堆，令一名角色摸两张牌，然后若其手牌数大于你，你对其造成1点伤害。",
        // The user simplified it: "Choose a card to discard into discard pile, or cancel."
        // I will implement the discard logic.
        
        discardFromQuan: (G, playerID, cardIndexInQuan) => {
            const player = G.players[playerID];
            if (player.quan && cardIndexInQuan >= 0 && cardIndexInQuan < player.quan.length) {
                const card = player.quan.splice(cardIndexInQuan, 1)[0];
                addCardsToDiscard(G, card);
                return card;
            }
            return null;
        }
    }
};
