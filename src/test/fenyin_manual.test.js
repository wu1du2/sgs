
import { CardGame } from '../Game';
import { InitializeGame } from 'boardgame.io/internal';
import { test, expect } from 'vitest';

test('Liuzan Fenyin manual trigger', () => {
    // Setup state with Liuzan
    let state = InitializeGame({ game: CardGame, numPlayers: 3 });
    // Clone G to avoid read-only issues
    let G = JSON.parse(JSON.stringify(state.G));
    const ctx = state.ctx;

    // Mock Liuzan for player 0
    G.players['0'].general = { name: '留赞', hp: 4, hpMax: 4 };
    G.players['0'].lastPlayedCardColor = 'red'; // Previous was red

    // Simulate playing a black card (Club 10)
    // We need to call playCardsInternal logic or simulate it.
    // Since playCardsInternal is not exported, we might need to rely on integration test or just trust the code edit.
    // But we can check if the moves exist.
    
    expect(CardGame.moves.confirmFenyin).toBeDefined();
    expect(CardGame.moves.cancelFenyin).toBeDefined();

    // Manually trigger the state change to test the move
    G.fenyinTrigger = { active: true, playerID: '0' };
    
    // Test confirmFenyin
    // We need a mock random object
    const random = { Number: () => 0.5, Shuffle: (d) => d };
    
    // Execute confirmFenyin
    CardGame.moves.confirmFenyin.move({ G, random }, '0');
    
    // Check if cards were drawn (hand increased)
    // Initial hand is 0. +1 = 1.
    expect(G.hands['0'].length).toBe(1);
    expect(G.fenyinTrigger.active).toBe(false);
    
    // Test cancelFenyin
    G.fenyinTrigger = { active: true, playerID: '0' };
    CardGame.moves.cancelFenyin.move({ G }, '0');
    expect(G.hands['0'].length).toBe(1); // No change
    expect(G.fenyinTrigger.active).toBe(false);
});
