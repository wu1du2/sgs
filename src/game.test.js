import { describe, it, expect } from 'vitest';
import { CardGame } from './Game';
import { createTestG, createTestCtx, mockRandom } from './test/utils';

describe('Game Logic Regression Tests', () => {
    it('should setup initial game state correctly', () => {
        const ctx = createTestCtx();
        const setupG = CardGame.setup(ctx);

        expect(setupG.deck).toBeDefined();
        expect(setupG.players).toBeDefined();
        expect(Object.keys(setupG.players).length).toBe(3);
        expect(setupG.hands['0']).toEqual([]);
    });

    it('should have drawCard move', () => {
        // Debugging: check if moves exist
        console.log('Available moves:', Object.keys(CardGame.moves || {}));
        expect(CardGame.moves.drawCard).toBeDefined();
        // Moves are wrapped in objects with client: false in Game.js
        const drawCardMove = CardGame.moves.drawCard;
        const isFunction = typeof drawCardMove === 'function';
        const isObjectWithMove = typeof drawCardMove === 'object' && typeof drawCardMove.move === 'function';
        expect(isFunction || isObjectWithMove).toBe(true);
    });

    it('should draw cards correctly', () => {
        const G = createTestG();
        const ctx = createTestCtx();
        const playerID = '0';
        const initialDeckSize = 10;
        
        // Setup deck
        G.deck = Array(initialDeckSize).fill({ suit: '♠', rank: 'A', name: '杀' });
        
        const drawCardMove = CardGame.moves.drawCard;
        const moveFn = typeof drawCardMove === 'function' ? drawCardMove : drawCardMove.move;
        
        if (moveFn) {
            moveFn({ G, ctx, playerID, random: mockRandom });
            
            expect(G.hands[playerID].length).toBe(1);
            expect(G.deck.length).toBe(initialDeckSize - 1);
            expect(G.actionLog).toContain(`Player ${playerID} 摸牌`); 
        }
    });

    it('should handle turn structure', () => {
        expect(CardGame.turn).toBeDefined();
        expect(CardGame.turn.activePlayers).toEqual({ all: 'play' });
    });
});
