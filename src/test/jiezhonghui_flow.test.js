
import { describe, it, expect } from 'vitest';
import { CardGame } from '../Game';
import { createTestG, mockRandom } from './utils';

describe('Jie Zhonghui Quanji Flow', () => {
    it('should handle full Quanji flow: AutoStart -> Draw -> Select -> Confirm -> Add to Quan', () => {
        // 1. Setup G
        const G = createTestG();
        const playerID = '0';
        
        // Setup player as Jie Zhonghui
        G.players[playerID].general = {
            name: '界钟会',
            skills: ['权计']
        };
        
        // Setup initial hand
        const initialCard = { suit: '♠', rank: 'A', name: 'Slash' };
        G.hands[playerID] = [initialCard];
        
        // Setup deck for drawing
        const deckCard = { suit: '♥', rank: 'K', name: 'Dodge' };
        G.deck = [deckCard];
        
        // 2. Simulate clicking "Quanji" -> triggers jiezhonghuiQuanJiAutoStart
        // Access the move function from the wrapped object
        const autoStartMove = CardGame.moves.jiezhonghuiQuanJiAutoStart.move;
        
        autoStartMove({ G, playerID, random: mockRandom });
        
        // 3. Verify AutoStart effects
        // Should draw 1 card
        expect(G.hands[playerID].length).toBe(2); 
        expect(G.hands[playerID]).toContainEqual(deckCard);
        
        // Should set selection state
        expect(G.jiezhonghuiQuanJiSelect).toEqual({
            active: true,
            playerID: playerID
        });
        
        // Should log action
        expect(G.actionLog[0]).toContain('发动权计，摸一张牌');
        
        // 4. Simulate confirming selection -> triggers jiezhonghuiQuanJiConfirm
        // Let's select the newly drawn card (index 1) to put into Quan
        const cardIndexToSelect = 1; 
        const confirmMove = CardGame.moves.jiezhonghuiQuanJiConfirm.move;
        
        confirmMove({ G, playerID }, cardIndexToSelect);
        
        // 5. Verify Confirm effects
        // Hand should decrease by 1
        expect(G.hands[playerID].length).toBe(1);
        expect(G.hands[playerID][0]).toEqual(initialCard); // Original card remains
        
        // Quan should have the selected card
        expect(G.players[playerID].quan).toBeDefined();
        expect(G.players[playerID].quan.length).toBe(1);
        expect(G.players[playerID].quan[0]).toEqual(deckCard);
        
        // Selection state should be reset
        expect(G.jiezhonghuiQuanJiSelect).toEqual({
            active: false,
            playerID: null
        });
        
        // Should log action
        expect(G.actionLog[1]).toContain('置于权');
    });
});
