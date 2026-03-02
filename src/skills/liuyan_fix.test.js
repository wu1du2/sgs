
import { describe, it, expect } from 'vitest';
import { CardGame } from '../Game';
import { liuyanSkill } from './liuyan';

describe('Li Yan Fix Verification', () => {
    it('should allow Diamond card for Li Mu', () => {
        const G = {
            players: {
                '0': { 
                    general: { name: '刘焉' }, 
                    hp: 1, 
                    hpMax: 3,
                    judges: { le: null },
                    equipments: { weapon: null, armor: null, plusOne: null, minusOne: null }
                }
            },
            hands: {
                '0': [{ suit: '♦', rank: 'K', name: '闪', type: '基本' }]
            },
            liuyanLimuSelect: { active: true, stage: 'select_card', playerID: '0' },
            actionLog: []
        };
        const ctx = { random: { Number: () => 0.5 } };
        const playerID = '0';

        // Call confirm directly with selection (mimicking Board.jsx)
        liuyanSkill.moves.liuyanLimuConfirm({ G, playerID }, { type: 'hand', index: 0 });

        // Should succeed
        expect(G.players['0'].judges.le).toBeDefined();
        expect(G.players['0'].judges.le.suit).toBe('♦');
        expect(G.players['0'].hp).toBe(2);
    });

    it('should REJECT non-Diamond card for Li Mu', () => {
        const G = {
            players: {
                '0': { 
                    general: { name: '刘焉' }, 
                    hp: 1, 
                    hpMax: 3,
                    judges: { le: null },
                    equipments: { weapon: null, armor: null, plusOne: null, minusOne: null }
                }
            },
            hands: {
                '0': [{ suit: '♠', rank: 'K', name: '杀', type: '基本' }]
            },
            liuyanLimuSelect: { active: true, stage: 'select_card', playerID: '0' },
            actionLog: []
        };
        const ctx = { random: { Number: () => 0.5 } };
        const playerID = '0';

        // Call confirm directly with selection
        liuyanSkill.moves.liuyanLimuConfirm({ G, playerID }, { type: 'hand', index: 0 });

        // Should fail
        expect(G.players['0'].judges.le).toBeNull();
        expect(G.actionLog).toContain('请选择方块牌');
    });
});
