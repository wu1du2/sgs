
import { Client } from 'boardgame.io/client';
import { CardGame } from './src/Game.js';
import { Local } from 'boardgame.io/multiplayer';

const game = { ...CardGame };

// Mock random
const seed = 'test_seed_123';

const client = Client({
  game: game,
  numPlayers: 3,
  multiplayer: Local(),
  debug: false,
});

client.start();

// Helper to make a move for a specific player
const makeMove = (playerID, moveName, ...args) => {
    client.overrideGameState(null); // Reset override
    // Hack: we need to act as the player. 
    // In local multiplayer, client.playerID is set when created if passed, 
    // but here we are using a single client for all (Local multiplayer simulates this but usually requires separate clients).
    // Actually, for boardgame.io/client with Local, we need separate clients or use the 'playerID' option if not using Local?
    // Let's just use the `client.moves[moveName](...args)` but that uses the current playerID of the client.
    
    // Better way: Create 3 clients.
};

// Re-setup with 3 clients
const client0 = Client({ game, numPlayers: 3, playerID: '0', multiplayer: Local() });
const client1 = Client({ game, numPlayers: 3, playerID: '1', multiplayer: Local() });
const client2 = Client({ game, numPlayers: 3, playerID: '2', multiplayer: Local() });

client0.start();
client1.start();
client2.start();

// Step 1: Players ready
client0.moves.playerReady();
client1.moves.playerReady();
client2.moves.playerReady();

// Check if phase is selection
let state = client0.store.getState();
console.log('Phase:', state.G.phase); // Should be 'selection'

// Check initial general options count
console.log('Initial options for P0:', state.G.generalOptions['0'].length);
console.log('Initial options for P1:', state.G.generalOptions['1'].length);
console.log('Initial options for P2:', state.G.generalOptions['2'].length);

if (state.G.generalOptions['0'].length !== 3) {
    console.error('FAIL: P0 should have 3 options initially');
    process.exit(1);
}

// Step 2: Bidding
// Check whose turn it is
console.log('Bid Turn:', state.G.bidTurn);
const bidder = state.G.bidTurn;

// Let bidder bid 300 to become landlord immediately
if (bidder === '0') client0.moves.claimLandlord(300);
else if (bidder === '1') client1.moves.claimLandlord(300);
else if (bidder === '2') client2.moves.claimLandlord(300);

// Update state
state = client0.store.getState();
console.log('Landlord:', state.G.landlord);

// Check general options for landlord
const landlordID = state.G.landlord;
const optionsCount = state.G.generalOptions[landlordID].length;
console.log(`Landlord (${landlordID}) options count:`, optionsCount);

if (optionsCount === 5) {
    console.log('SUCCESS: Landlord has 5 options');
} else {
    console.error(`FAIL: Landlord should have 5 options, but has ${optionsCount}`);
    process.exit(1);
}

// Check other players still have 3
['0', '1', '2'].forEach(pid => {
    if (pid !== landlordID) {
        if (state.G.generalOptions[pid].length !== 3) {
            console.error(`FAIL: Peasant ${pid} should have 3 options`);
        } else {
            console.log(`Peasant ${pid} has 3 options`);
        }
    }
});
