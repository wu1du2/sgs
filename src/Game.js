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
      '0': { general: null, role: 'neutral', score: 0, equipments: { weapon: null, armor: null, plusOne: null, minusOne: null }, judgments: { le: false, bing: false, dian: false } },
      '1': { general: null, role: 'neutral', score: 0, equipments: { weapon: null, armor: null, plusOne: null, minusOne: null }, judgments: { le: false, bing: false, dian: false } },
      '2': { general: null, role: 'neutral', score: 0, equipments: { weapon: null, armor: null, plusOne: null, minusOne: null }, judgments: { le: false, bing: false, dian: false } },
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
        
        // Apply Landlord bonus if this player is the landlord
        if (G.players[playerID].role === 'landlord') {
           G.players[playerID].general.hpMax += 1;
           G.players[playerID].general.hp += 1;
        }
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
          // Landlord gets +1 HP and +1 Max HP
          if (G.players[pid].general) {
            G.players[pid].general.hpMax += 1;
            G.players[pid].general.hp += 1;
          }
        } else {
          G.players[pid].role = 'peasant';
        }
      });
    },
    modifyHP: ({ G }, targetPlayerID, amount) => {
      const general = G.players[targetPlayerID]?.general;
      if (general) {
        const newHP = general.hp + amount;
        // Ensure HP doesn't exceed Max HP or drop below 0 (optional, but good practice)
        // User didn't specify limits, but usually HP <= hpMax.
        // However, some games allow overheal. Standard SGS rules: HP <= MaxHP.
        // I'll clamp it to MaxHP for addition, but allow subtraction to 0 or below (dying).
        // Actually, let's just apply the change. The user said "Click ... adds one / subtracts one".
        // I will clamp to maxHP just in case, as is standard.
        
        if (amount > 0) {
           general.hp = Math.min(general.hp + amount, general.hpMax);
        } else {
           general.hp = Math.max(general.hp + amount, 0);
        }
      }
    },
    toggleJudgment: ({ G }, playerID, type) => {
      const player = G.players[playerID];
      if (player && player.judgments && player.judgments.hasOwnProperty(type)) {
        player.judgments[type] = !player.judgments[type];
      }
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
    equipCard: ({ G, playerID }, cardIndex) => {
      if (G.phase !== 'playing') return;
      
      const hand = G.hands[playerID];
      const card = hand[cardIndex];
      
      if (!card) return;

      let slot = null;
      if (card.type === '武器') slot = 'weapon';
      else if (card.type === '防具') slot = 'armor';
      else if (card.type === '加一') slot = 'plusOne';
      else if (card.type === '减一') slot = 'minusOne'; // Note: In data it might be '减一' or '减一马' etc. based on user changes. User said '减一'.

      if (!slot) return;

      // Remove card from hand
      const newHand = hand.filter((_, index) => index !== cardIndex);
      G.hands[playerID] = newHand;

      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const currentEquip = G.players[playerID].equipments[slot];

      // Discard existing equipment if any
      if (currentEquip) {
        // Add to discard pile (not explicitly tracked in this simple version, but we log it)
        // In a full game, we'd have a discard pile array.
        const logEntry = `${playerName} 弃置了 ${currentEquip.name}`;
        G.actionLog.push(logEntry);
      }

      // Equip new card
      G.players[playerID].equipments[slot] = card;

      const logEntry = `${playerName} 装备了 ${card.name}`;
      G.actionLog.push(logEntry);
      
      G.lastAction = {
        type: 'equip',
        playerID,
        card
      };
    },
    discardEquipment: ({ G, playerID }, slot) => {
      if (G.phase !== 'playing') return;
      
      const equipment = G.players[playerID].equipments[slot];
      if (!equipment) return;

      G.players[playerID].equipments[slot] = null;

      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const logEntry = `${playerName} 弃置了 ${equipment.name}`;
      G.actionLog.push(logEntry);

      G.lastAction = {
        type: 'discardEquip',
        playerID,
        card: equipment
      };
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