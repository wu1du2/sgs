
import { xuyouSkill } from './src/skills/xuyou.js';

const G = {
    players: {
        '0': {
            xuyouState: 'yang',
            chengLueSuits: []
        }
    },
    hands: { '0': [] },
    discardPile: [],
    actionLog: [],
    deck: [{suit:'hearts', rank:'A'}, {suit:'spades', rank:'2'}, {suit:'clubs', rank:'3'}, {suit:'diamonds', rank:'4'}]
};
const playerID = '0';
const random = { Number: () => 0.5 };

// Helper to mock discard
const discard = (count) => {
    const indices = [];
    for(let i=0; i<count; i++) indices.push(i);
    // Add dummy cards to hand to discard
    for(let i=0; i<count; i++) G.hands[playerID].push({suit:'hearts', rank:'K'});
    xuyouSkill.moves.xuyouChengLueDiscard({G, playerID}, indices);
};

console.log('Initial State:', G.players[playerID].xuyouState);

// 1. Yang -> Yin
console.log('--- Activate Yang ---');
xuyouSkill.moves.xuyouChengLue({G, playerID, random});
discard(2);
console.log('After 1st use (should be yin):', G.players[playerID].xuyouState);

if (G.players[playerID].xuyouState !== 'yin') console.error('FAIL: Expected yin');

// 2. Yin -> Yang
console.log('--- Activate Yin ---');
xuyouSkill.moves.xuyouChengLue({G, playerID, random});
discard(1);
console.log('After 2nd use (should be yang):', G.players[playerID].xuyouState);

if (G.players[playerID].xuyouState !== 'yang') console.error('FAIL: Expected yang');

// 3. Yang -> Yin
console.log('--- Activate Yang again ---');
xuyouSkill.moves.xuyouChengLue({G, playerID, random});
discard(2);
console.log('After 3rd use (should be yin):', G.players[playerID].xuyouState);

if (G.players[playerID].xuyouState !== 'yin') console.error('FAIL: Expected yin');

console.log('Test Complete');
