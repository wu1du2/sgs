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

export const CardGame = {
  setup: () => ({
    deck: shuffle(SGS_CARDS),
    hands: {
      '0': [],
      '1': [],
      '2': [],
    },
    players: {
      '0': { general: null },
      '1': { general: null },
      '2': { general: null },
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
    phase: 'lobby', // lobby -> selection -> playing
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
        const shuffledGenerals = shuffle(ENABLED_GENERALS);
        let genIndex = 0;
        ['0', '1', '2'].forEach(pid => {
          G.generalOptions[pid] = shuffledGenerals.slice(genIndex, genIndex + 3);
          G.generalChangeUsed[pid] = [false, false, false];
          genIndex += 3;
        });
      }
    },
    addMockPlayers: ({ G }) => {
      ['0', '1', '2'].forEach(id => {
        if (!G.readyPlayers.includes(id)) {
          G.readyPlayers.push(id);
        }
      });
      if (G.readyPlayers.length === 3) {
        // Start selection phase
        G.phase = 'selection';
        // Distribute 3 random generals to each player
        const shuffledGenerals = shuffle(ENABLED_GENERALS);
        let genIndex = 0;
        ['0', '1', '2'].forEach(pid => {
          G.generalOptions[pid] = shuffledGenerals.slice(genIndex, genIndex + 3);
          G.generalChangeUsed[pid] = [false, false, false];
          genIndex += 3;
        });
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
    playCard: ({ G, playerID }, cardIndex) => {
      if (G.phase !== 'playing') return;
      // Simple play logic: remove from hand
      G.hands[playerID].splice(cardIndex, 1);
    }
  },

  endIf: ({ G }) => {
    if (G.deck.length === 0) {
      return { winner: 'Draw' }; // Just a placeholder
    }
  },
};