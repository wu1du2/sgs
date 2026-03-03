
import { describe, it, expect, vi } from 'vitest';
import { CardGame } from '../Game';
import { createTestG } from './utils';

// Mock random
const mockRandom = {
  Number: () => 0.5,
  Shuffle: (arr) => arr,
};

describe('Du Yu Skill: Wuku', () => {
  it('should gain Wuku mark when any player plays an equipment card', () => {
    // Setup
    const G = createTestG();
    const duyuID = '0';
    const otherID = '1';

    // Player 0 is Du Yu
    G.players[duyuID].general = { name: '杜预', skills: ['武库'] };
    G.players[duyuID].duyuWuku = 0;

    // Player 1 plays a weapon
    const weaponCard = { type: '武器', name: '诸葛连弩' };
    
    // We need to simulate playCardsInternal or call the trigger directly.
    // Since duyuGainWukuIfPossible is not exported directly, we test via playCards move 
    // BUT playCards is complex. 
    // Let's check if we can import the internal function? No, usually not.
    // So we use the move 'playCards' if possible, or we manually trigger the logic if we can't easily mock everything for playCards.
    
    // However, looking at Game.js, playCards calls playCardsInternal.
    // A simpler way is to simulate the effect of duyuGainWukuIfPossible by recreating the condition
    // OR ideally, use the actual move.
    
    // Let's try using the actual move `playCards`
    // We need to setup hand for player 1
    G.hands[otherID] = [weaponCard];
    
    // Mock actionLog
    G.actionLog = [];

    // Execute move
    const playCardsMove = CardGame.moves.playCards.move || CardGame.moves.playCards;
    
    // We need to be careful about `playCards` signature. It takes (G, ctx, cardIndices, targetIds)
    // But in boardgame.io moves wrapper, it might be different. 
    // In `src/Game.js`, `playCards` is defined as:
    // playCards: ({ G, playerID, random }, cardIndices, targetIds) => { ... }
    
    playCardsMove({ G, playerID: otherID, random: mockRandom }, [0], []);

    // Verify
    expect(G.players[duyuID].duyuWuku).toBe(1);
    expect(G.actionLog).toContainEqual(expect.stringContaining('杜预 因 玩家 1 使用装备牌获得1个“武库”'));
  });

  it('should not gain mark if already at max (3)', () => {
    const G = createTestG();
    const duyuID = '0';
    G.players[duyuID].general = { name: '杜预', skills: ['武库'] };
    G.players[duyuID].duyuWuku = 3;

    const weaponCard = { type: '武器', name: '青釭剑' };
    G.hands[duyuID] = [weaponCard];

    const playCardsMove = CardGame.moves.playCards.move || CardGame.moves.playCards;
    playCardsMove({ G, playerID: duyuID, random: mockRandom }, [0], []);

    expect(G.players[duyuID].duyuWuku).toBe(3);
  });
});

describe('Mou Ma Chao Skill: Tie Qi', () => {
  it('should trigger Mouyi start when Tie Qi is activated', () => {
    const G = createTestG();
    const mmcID = '0';
    const targetID = '1';

    G.players[mmcID].general = { name: '谋马超', skills: ['铁骑'] };
    G.players[targetID].general = { name: '标马超', skills: ['马术'] };

    // Test the start move
    const startMouyiMove = CardGame.moves.moumachaoStartMouyi.move || CardGame.moves.moumachaoStartMouyi;
    startMouyiMove({ G, playerID: mmcID }, targetID);

    expect(G.mouyi.active).toBe(true);
    expect(G.mouyi.sourcePlayerID).toBe(mmcID);
    expect(G.mouyi.targetPlayerID).toBe(targetID);
    expect(G.actionLog).toContainEqual(expect.stringContaining('谋马超 发动铁骑，与你进行谋弈'));
  });

  it('should resolve Mouyi: Draw 2 when source chooses Draw and target chooses Steal', () => {
    const G = createTestG();
    const mmcID = '0';
    const targetID = '1';

    // Setup Mouyi state
    G.mouyi = {
        active: true,
        sourcePlayerID: mmcID,
        targetPlayerID: targetID,
        sourceChoice: null,
        targetChoice: null,
    };
    
    G.players[mmcID].general = { name: '谋马超' };
    G.players[targetID].general = { name: '标马超' };
    G.deck = [{name: 'Card1'}, {name: 'Card2'}]; // Setup deck for drawing
    G.hands[mmcID] = [];

    const chooseMove = CardGame.moves.moumachaoChooseMouyi.move || CardGame.moves.moumachaoChooseMouyi;

    // Source chooses Draw
    chooseMove({ G, playerID: mmcID, random: mockRandom }, 'draw');
    expect(G.mouyi.sourceChoice).toBe('draw');
    
    // Target chooses Steal
    chooseMove({ G, playerID: targetID, random: mockRandom }, 'steal');
    
    // Should resolve immediately after both chosen
    expect(G.mouyi.active).toBe(false);
    expect(G.hands[mmcID].length).toBe(2); // Drew 2 cards
    expect(G.actionLog).toContainEqual(expect.stringContaining('谋弈胜出：扰阵疲敌，摸两张牌'));
  });

  it('should resolve Mouyi: Tie (No effect) when both choose same', () => {
    const G = createTestG();
    const mmcID = '0';
    const targetID = '1';

    G.mouyi = {
        active: true,
        sourcePlayerID: mmcID,
        targetPlayerID: targetID,
        sourceChoice: null,
        targetChoice: null,
    };
    
    G.players[mmcID].general = { name: '谋马超' };
    G.players[targetID].general = { name: '标马超' };

    const chooseMove = CardGame.moves.moumachaoChooseMouyi.move || CardGame.moves.moumachaoChooseMouyi;

    chooseMove({ G, playerID: mmcID, random: mockRandom }, 'steal');
    chooseMove({ G, playerID: targetID, random: mockRandom }, 'steal');

    expect(G.mouyi.active).toBe(false);
    expect(G.actionLog).toContainEqual(expect.stringContaining('谋弈选择相同，铁骑不执行效果'));
  });
});
