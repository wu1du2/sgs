
import { xuyouSkill } from './src/skills/xuyou.js';

// Mock G and playerID
const G = {
    players: {
        '0': {
            xuyouState: 'yang',
            chengLueSuits: ['spades', 'hearts'] // Should be cleared
        }
    },
    hands: {
        '0': []
    },
    deck: [{suit: 'clubs', rank: 'A'}, {suit: 'diamonds', rank: 'K'}, {suit: 'hearts', rank: 'Q'}], // Stack: Top -> Q, K, A -> Bottom (pop draws A)
    discardPile: [],
    actionLog: []
};

const playerID = '0';
const random = { Number: () => 0.5 };

console.log('--- Test Start ---');
console.log('Initial State:', JSON.stringify(G.players[playerID]));
console.log('Initial Hand:', G.hands[playerID].length);

// 1. Click Cheng Lue (Yang)
// Expected: Clear suits, Draw 1 (Yang), Open Discard 2
console.log('\n--- Clicking Cheng Lue (Yang) ---');
xuyouSkill.moves.xuyouChengLue({ G, playerID, random });

console.log('State after click:', JSON.stringify(G.players[playerID]));
console.log('Suits cleared?', G.players[playerID].chengLueSuits.length === 0);
console.log('Hand size (Yang draws 1):', G.hands[playerID].length);
console.log('Select Active?', G.xuyouChengLueSelect && G.xuyouChengLueSelect.active);
console.log('Select Stage:', G.xuyouChengLueSelect ? G.xuyouChengLueSelect.stage : 'None');

if (G.hands[playerID].length !== 1) console.error('FAIL: Should draw 1 card in Yang');
if (G.xuyouChengLueSelect.stage !== 'discard_2_yang') console.error('FAIL: Should be discard_2_yang');

// 2. Discard (Trigger State Change)
// Mock discard 2 cards (but we only have 1 in hand, let's just mock indices)
// We need to add more cards to hand to discard 2
G.hands[playerID].push({suit: 'spades', rank: '2'});
console.log('\n--- Discarding 2 cards ---');
xuyouSkill.moves.xuyouChengLueDiscard({ G, playerID }, [0, 1]);

console.log('State after discard:', JSON.stringify(G.players[playerID]));
console.log('Suits recorded?', G.players[playerID].chengLueSuits.length > 0);
console.log('New State (Should be Yin):', G.players[playerID].xuyouState);

if (G.players[playerID].xuyouState !== 'yin') console.error('FAIL: Should switch to Yin');


// 3. Click Cheng Lue (Yin)
// Expected: Clear suits, Draw 2 (Yin), Open Discard 1
console.log('\n--- Clicking Cheng Lue (Yin) ---');
// Add suits to clear
G.players[playerID].chengLueSuits = ['clubs'];
xuyouSkill.moves.xuyouChengLue({ G, playerID, random });

console.log('Suits cleared?', G.players[playerID].chengLueSuits.length === 0);
console.log('Hand size (Yin draws 2):', G.hands[playerID].length); // Was 0 after discard, now +2 = 2
console.log('Select Stage:', G.xuyouChengLueSelect ? G.xuyouChengLueSelect.stage : 'None');

if (G.hands[playerID].length !== 2) console.error('FAIL: Should draw 2 cards in Yin'); // 0 + 2
if (G.xuyouChengLueSelect.stage !== 'discard_1_yin') console.error('FAIL: Should be discard_1_yin');

console.log('\nTest Complete');
