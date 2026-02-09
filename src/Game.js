import { SGS_CARDS } from './sgs_data.js';
import generalsData from '../configs/generals.json' with { type: "json" };

// Filter enabled generals
const ENABLED_GENERALS = generalsData.filter(g => g.enable);

// Fisher-Yates shuffle
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  const newArray = [...array];

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

const distributeGenerals = () => {
  const shuffledGenerals = shuffle(ENABLED_GENERALS);
  const generalOptions = {};
  const generalChangeUsed = {};
  let genIndex = 0;
  ['0', '1', '2'].forEach(pid => {
    generalOptions[pid] = shuffledGenerals.slice(genIndex, genIndex + 3);
    generalChangeUsed[pid] = [false, false, false];
    genIndex += 3;
  });
  return { generalOptions, generalChangeUsed };
};

export const CardGame = {
  setup: () => ({
    deck: shuffle(SGS_CARDS),
    hands: {
      '0': [],
      '1': [],
      '2': [],
    },
    players: {
      '0': { general: null, role: 'neutral', score: 0 },
      '1': { general: null, role: 'neutral', score: 0 },
      '2': { general: null, role: 'neutral', score: 0 },
    },
    generalOptions: {
      '0': [],
      '1': [],
      '2': [],
    },
    generalChangeUsed: {
      '0': [false, false, false],
      '1': [false, false, false],
      '2': [false, false, false],
    },
    readyPlayers: [],
    landlord: null,
    bidAmount: 0,
    phase: 'lobby', // lobby -> selection -> playing
    gameResult: null, // { winnerRole: string, scoreChanges: object }
    rematchVotes: [],
    lastAction: null,
    actionLog: [],
  }),

  turn: {
    activePlayers: {
      all: 'play',
    },
  },

  moves: {
    playerReady: ({ G, playerID }) => {
      if (!G.readyPlayers.includes(playerID)) {
        G.readyPlayers.push(playerID);
      }
      if (G.readyPlayers.length === 3) {
        // Start selection phase
        G.phase = 'selection';
        // Distribute 3 random generals to each player
        const { generalOptions, generalChangeUsed } = distributeGenerals();
        G.generalOptions = generalOptions;
        G.generalChangeUsed = generalChangeUsed;
      }
    },
    selectGeneral: ({ G, playerID }, generalId) => {
      const options = G.generalOptions[playerID];
      const selected = options.find(g => g.id === generalId);
      if (selected) {
        G.players[playerID].general = selected;
      }
      
      // Check if all players have selected
      const allSelected = ['0', '1', '2'].every(pid => G.players[pid].general);
      if (allSelected) {
        G.phase = 'playing';
      }
    },
    claimLandlord: ({ G, playerID }, amount) => {
      if (G.landlord !== null) return; // Already claimed

      G.landlord = playerID;
      G.bidAmount = amount;
      
      // Set roles
      ['0', '1', '2'].forEach(pid => {
        if (pid === playerID) {
          G.players[pid].role = 'landlord';
        } else {
          G.players[pid].role = 'peasant';
        }
      });
    },
    resolveGame: ({ G }, winnerRole) => {
      const bid = G.bidAmount;
      const landlordID = G.landlord;
      
      if (!landlordID) return; // No landlord yet

      const scoreChanges = {};

      if (winnerRole === 'landlord') {
        // Landlord wins
        ['0', '1', '2'].forEach(pid => {
          if (pid === landlordID) {
            scoreChanges[pid] = 2 * bid;
            G.players[pid].score += 2 * bid;
          } else {
            scoreChanges[pid] = -bid;
            G.players[pid].score -= bid;
          }
        });
      } else {
        // Peasants win
        ['0', '1', '2'].forEach(pid => {
          if (pid === landlordID) {
            scoreChanges[pid] = -2 * bid;
            G.players[pid].score -= 2 * bid;
          } else {
            scoreChanges[pid] = bid;
            G.players[pid].score += bid;
          }
        });
      }

      G.gameResult = {
        winnerRole,
        scoreChanges
      };
    },
    voteRematch: ({ G, playerID }) => {
      if (!G.rematchVotes.includes(playerID)) {
        G.rematchVotes.push(playerID);
      }

      if (G.rematchVotes.length === 3) {
        // Reset game state but keep scores and players
        G.deck = shuffle(SGS_CARDS);
        G.hands = { '0': [], '1': [], '2': [] };
        
        // Reset player roles and generals
        ['0', '1', '2'].forEach(pid => {
          G.players[pid].general = null;
          G.players[pid].role = 'neutral';
        });

        // Distribute new generals
        const { generalOptions, generalChangeUsed } = distributeGenerals();
        G.generalOptions = generalOptions;
        G.generalChangeUsed = generalChangeUsed;

        G.landlord = null;
        G.bidAmount = 0;
        G.phase = 'selection';
        G.gameResult = null;
        G.rematchVotes = [];
      }
    },
    changeGeneral: ({ G, playerID }, generalIdToReplace) => {
      const options = G.generalOptions[playerID];
      const index = options.findIndex(g => g.id === generalIdToReplace);
      
      if (index === -1) return;
      if (G.generalChangeUsed[playerID][index]) return;

      // Find all currently used generals to avoid duplicates
      const usedGenerals = new Set();
      Object.values(G.generalOptions).forEach(options => {
        options.forEach(g => usedGenerals.add(g.id));
      });
      Object.values(G.players).forEach(p => {
        if (p.general) usedGenerals.add(p.general.id);
      });

      // Find available generals
      const available = ENABLED_GENERALS.filter(g => !usedGenerals.has(g.id));
      
      if (available.length === 0) return;

      // Pick a random one
      const randomIndex = Math.floor(Math.random() * available.length);
      const newGeneral = available[randomIndex];

      // Replace
      options[index] = newGeneral;
      G.generalChangeUsed[playerID][index] = true;
    },
    drawCard: ({ G, playerID }) => {
      if (G.phase !== 'playing') return;
      const card = G.deck.pop();
      if (card !== undefined) {
        G.hands[playerID].push(card);
      }
    },
    playCards: ({ G, playerID }, cardIndices, targetIDs) => {
      if (G.phase !== 'playing') return;
      
      const hand = G.hands[playerID];
      // Store cards before removing
      const cardsPlayed = cardIndices.map(i => hand[i]);
      
      // Remove cards from hand
      const newHand = hand.filter((_, index) => !cardIndices.includes(index));
      G.hands[playerID] = newHand;

      G.lastAction = {
        type: 'play',
        playerID,
        cards: cardsPlayed,
        targetIDs
      };

      // Add to action log
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const cardNames = cardsPlayed.map(c => c.name).join(' ');
      let logEntry = '';
      if (targetIDs && targetIDs.length > 0) {
        const targets = targetIDs.map(tid => G.players[tid].general ? G.players[tid].general.name : `Player ${tid}`).join(', ');
        logEntry = `${playerName} 对 ${targets} 出牌 [${cardNames}]`;
      } else {
        logEntry = `${playerName} 出牌 [${cardNames}]`;
      }
      G.actionLog.push(logEntry);
    },
    discardCards: ({ G, playerID }, cardIndices) => {
      if (G.phase !== 'playing') return;
      
      const hand = G.hands[playerID];
      const cardsDiscarded = cardIndices.map(i => hand[i]);
      
      const newHand = hand.filter((_, index) => !cardIndices.includes(index));
      G.hands[playerID] = newHand;
      
      G.lastAction = {
        type: 'discard',
        playerID,
        cards: cardsDiscarded
      };

      // Add to action log
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const cardNames = cardsDiscarded.map(c => c.name).join(' ');
      const logEntry = `${playerName} 弃牌 [${cardNames}]`;
      G.actionLog.push(logEntry);
    }
  },

  endIf: ({ G }) => {
    if (G.deck.length === 0) {
      return { winner: 'Draw' }; // Just a placeholder
    }
  },
};