
import { xuyouSkill } from './src/skills/xuyou.js';

// Mock G and playerID
const G = {
    players: {
        '0': {
            xuyouState: 'yang',
            chengLueSuits: ['spades', 'hearts']
        }
    },
    actionLog: []
};

const playerID = '0';
const random = { Number: () => 0.5 };

console.log('Initial State:', JSON.stringify(G.players[playerID]));

// First Click: Yang -> Yin
console.log('--- Clicking Cheng Lue (Expected: Clear suits, Toggle to Yin) ---');
xuyouSkill.moves.xuyouChengLue({ G, playerID, random });
console.log('State after 1st click:', JSON.stringify(G.players[playerID]));

if (G.players[playerID].xuyouState !== 'yin') console.error('FAIL: State should be yin');
if (G.players[playerID].chengLueSuits.length !== 0) console.error('FAIL: Suits should be cleared');

// Second Click: Yin -> Yang
// Add some suits to verify clearing again
G.players[playerID].chengLueSuits = ['diamonds'];
console.log('--- Clicking Cheng Lue (Expected: Clear suits, Toggle to Yang) ---');
xuyouSkill.moves.xuyouChengLue({ G, playerID, random });
console.log('State after 2nd click:', JSON.stringify(G.players[playerID]));

if (G.players[playerID].xuyouState !== 'yang') console.error('FAIL: State should be yang');
if (G.players[playerID].chengLueSuits.length !== 0) console.error('FAIL: Suits should be cleared');

console.log('Test Complete');
