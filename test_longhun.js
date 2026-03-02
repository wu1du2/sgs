
import { CardGame } from './src/Game.js';

// Helper to unwrap move
const getMove = (name) => {
    const move = CardGame.moves[name];
    if (typeof move === 'function') return move;
    if (move && typeof move.move === 'function') return move.move;
    throw new Error(`Move ${name} not found`);
};

const confirmLongHunCard = getMove('confirmLongHunCard');

// Mock G
const G = {
    players: {
        '0': { general: { name: '神赵云' } },
        '1': { general: { name: 'Target' }, equipments: { weapon: { name: 'WeaponCard', slot: 'weapon' } } }
    },
    hands: {
        '0': [],
        '1': [{ name: 'HandCard1', suit: 'hearts', rank: 'A' }, { name: 'HandCard2', suit: 'spades', rank: 'K' }]
    },
    discardPile: [],
    actionLog: [],
    longhunSelect: {
        active: true,
        stage: 'card_selection',
        sourcePlayerID: '0',
        targetPlayerID: '1',
        selectedCard: null
    },
    caomaoJuejinAuraActive: false
};

// Test 1: Discard Hand Card
console.log('--- Test 1: Discard Hand Card ---');
G.longhunSelect.selectedCard = { type: 'hand', index: 1 }; // HandCard2
confirmLongHunCard({ G });

console.log('Discard Pile:', G.discardPile.length);
if (G.discardPile.length !== 1) console.error('FAIL: Discard pile should have 1 card');
if (G.discardPile[0].name !== 'HandCard2') console.error('FAIL: Wrong card discarded');
if (G.hands['1'].length !== 1) console.error('FAIL: Hand should have 1 card');
if (G.hands['1'][0].name !== 'HandCard1') console.error('FAIL: Wrong card remaining');

// Test 2: Discard Equipment
console.log('--- Test 2: Discard Equipment ---');
// Reset state
G.longhunSelect = {
    active: true,
    stage: 'card_selection',
    sourcePlayerID: '0',
    targetPlayerID: '1',
    selectedCard: { type: 'equip', slot: 'weapon' }
};

confirmLongHunCard({ G });

console.log('Discard Pile:', G.discardPile.length);
if (G.discardPile.length !== 2) console.error('FAIL: Discard pile should have 2 cards');
if (G.discardPile[1].name !== 'WeaponCard') console.error('FAIL: Wrong card discarded');
if (G.players['1'].equipments.weapon !== null) console.error('FAIL: Equipment should be null');

console.log('Test Complete');
