import { SGS_CARDS } from './sgs_data.js';

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
    readyPlayers: [],
    isGameStarted: false,
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
        G.isGameStarted = true;
      }
    },
    addMockPlayers: ({ G }) => {
      ['0', '1', '2'].forEach(id => {
        if (!G.readyPlayers.includes(id)) {
          G.readyPlayers.push(id);
        }
      });
      if (G.readyPlayers.length === 3) {
        G.isGameStarted = true;
      }
    },
    drawCard: ({ G, playerID }) => {
      if (!G.isGameStarted) return;
      const card = G.deck.pop();
      if (card !== undefined) {
        G.hands[playerID].push(card);
      }
    },
    playCard: ({ G, playerID }, cardIndex) => {
      if (!G.isGameStarted) return;
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