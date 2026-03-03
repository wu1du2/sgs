
import { Client } from 'boardgame.io/client';
import { CardGame } from './src/Game.js';
import { Local } from 'boardgame.io/multiplayer';
import { test, expect } from 'vitest';

test('Landlord gets 2 extra general options', () => {
  const game = { ...CardGame };

  // Create clients for 3 players
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
  expect(state.G.phase).toBe('selection');

  // Check initial general options count
  expect(state.G.generalOptions['0'].length).toBe(3);
  expect(state.G.generalOptions['1'].length).toBe(3);
  expect(state.G.generalOptions['2'].length).toBe(3);

  // Step 2: Bidding
  const bidder = state.G.bidTurn;
  
  // Let bidder bid 300 to become landlord immediately
  if (bidder === '0') client0.moves.claimLandlord(300);
  else if (bidder === '1') client1.moves.claimLandlord(300);
  else if (bidder === '2') client2.moves.claimLandlord(300);

  // Update state
  state = client0.store.getState();
  const landlordID = state.G.landlord;
  expect(landlordID).not.toBeNull();

  // Check general options for landlord
  const optionsCount = state.G.generalOptions[landlordID].length;
  console.log(`Landlord (${landlordID}) options count:`, optionsCount);

  expect(optionsCount).toBe(5);

  // Check other players still have 3
  ['0', '1', '2'].forEach(pid => {
    if (pid !== landlordID) {
        expect(state.G.generalOptions[pid].length).toBe(3);
    }
  });
});
