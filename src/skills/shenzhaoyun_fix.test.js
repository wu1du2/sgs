
import { describe, it, expect } from 'vitest';
import { CardGame } from '../Game';

describe('Shen Zhao Yun Long Hun Fix', () => {
    it('should discard correct card by ID if provided', () => {
        const G = {
            players: {
                '0': { general: { name: '神赵云' } },
                '1': { 
                    general: { name: '曹操' },
                    equipments: { weapon: null, armor: null, plusOne: null, minusOne: null }
                }
            },
            hands: {
                '0': [],
                '1': [
                    { id: 'card-1', name: '杀', suit: '♠', rank: '7' },
                    { id: 'card-2', name: '闪', suit: '♥', rank: '2' }
                ]
            },
            longhunSelect: {
                active: true,
                sourcePlayerID: '0',
                targetPlayerID: '1',
                selectedCard: null
            },
            actionLog: [],
            discardPile: []
        };
        
        // Simulate confirming card with ID 'card-2' (index 1)
        // Even if we say index 0, if ID is 'card-2', it should find 'card-2'
        // But wait, my logic prioritizes ID but falls back to index if ID not found?
        // No:
        // if (id) {
        //     const foundIndex = targetHand.findIndex(c => c.id === id);
        //     if (foundIndex !== -1) { ... }
        // } else if (index >= 0 ...)
        
        // So if I provide ID, index is ignored.
        
        CardGame.moves.confirmLongHunCard.move({ G }, { type: 'hand', index: 0, id: 'card-2' });
        
        // Should have discarded card-2
        expect(G.hands['1'].length).toBe(1);
        expect(G.hands['1'][0].id).toBe('card-1');
        expect(G.discardPile.length).toBe(1);
        expect(G.discardPile[0].id).toBe('card-2');
    });

    it('should fall back to index if ID is missing (backward compatibility)', () => {
        const G = {
            players: {
                '0': { general: { name: '神赵云' } },
                '1': { general: { name: '曹操' }, equipments: {} }
            },
            hands: {
                '0': [],
                '1': [
                    { id: 'card-1', name: '杀' },
                    { id: 'card-2', name: '闪' }
                ]
            },
            longhunSelect: { active: true, sourcePlayerID: '0', targetPlayerID: '1' },
            actionLog: [],
            discardPile: []
        };
        
        // No ID provided, index 1
        CardGame.moves.confirmLongHunCard.move({ G }, { type: 'hand', index: 1 });
        
        expect(G.hands['1'].length).toBe(1);
        expect(G.hands['1'][0].id).toBe('card-1');
        expect(G.discardPile[0].id).toBe('card-2');
    });
});
