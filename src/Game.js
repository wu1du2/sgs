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

const createEmptyZones = () => ({
  equipments: { weapon: null, armor: null, plusOne: null, minusOne: null },
  judges: { bing: null, le: null, dian: null }
});

const createPlayerState = () => ({
  general: null,
  role: 'neutral',
  score: 0,
  luckCardCount: 10,
  luckCardConfirmed: false,
  ...createEmptyZones()
});

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

export const calculateDistance = (G, sourceID, targetID) => {
  // In 3 player game, everyone is adjacent (distance 1)
  let dist = 1;
  
  const source = G.players[sourceID];
  const target = G.players[targetID];
  
  // Source -1 mount (reduces distance to others)
  if (source.equipments.minusOne) {
    dist -= 1;
  }
  
  // Target +1 mount (increases distance from others)
  if (target.equipments.plusOne) {
    dist += 1;
  }
  
  return dist;
};

const addToDiscardPile = (G, cards) => {
  if (!cards) return;
  const toAdd = Array.isArray(cards) ? cards : [cards];
  const validCards = toAdd.filter(Boolean);
  if (validCards.length > 0) {
    G.discardPile.push(...validCards);
  }
};

const drawCards = (G, playerID, count) => {
  const cardsToDraw = [];
  for (let i = 0; i < count; i++) {
    if (G.deck.length === 0) {
      if (G.discardPile.length > 0) {
        G.deck = shuffle(G.discardPile);
        G.discardPile = [];
      } else {
        break; // No more cards
      }
    }
    cardsToDraw.push(G.deck.shift());
  }
  G.hands[playerID].push(...cardsToDraw);
  return cardsToDraw;
};

export const CardGame = {
  setup: () => ({
    deck: shuffle(SGS_CARDS.map((c, i) => ({ ...c, id: `card-${i}` }))),
    discardPile: [],
    hands: {
      '0': [],
      '1': [],
      '2': [],
    },
    players: {
      '0': createPlayerState(),
      '1': createPlayerState(),
      '2': createPlayerState(),
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
    pendingEffect: null, // { active: boolean, sourcePlayerID, targetPlayerID, actionType, pendingCard }
    selectCard: {
      active: false,
      sourcePlayerID: null,
      targetPlayerID: null,
      actionType: null, // 'discard', 'steal'
      pendingCard: null,
    },
  }),

  turn: {
    activePlayers: {
      all: 'play',
    },
  },

  moves: {
    drawCard: ({ G, playerID }) => {
      const cards = drawCards(G, playerID, 1);
      if (cards.length > 0) {
        const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
        G.actionLog.push(`${playerName} 摸牌`);
      }
    },
    useLuckCard: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (player.luckCardCount > 0 && !player.luckCardConfirmed) {
        // Return current hand to deck
        const currentHand = G.hands[playerID];
        G.deck.push(...currentHand);
        G.hands[playerID] = [];

        // Shuffle deck
        G.deck = shuffle(G.deck);

        // Draw 4 new cards
        drawCards(G, playerID, 4);

        // Decrement count
        player.luckCardCount--;
        
        const playerName = player.general ? player.general.name : `Player ${playerID}`;
        G.actionLog.push(`${playerName} used Luck Card (${player.luckCardCount} remaining)`);
      }
    },
    confirmLuckCard: ({ G, playerID }) => {
      G.players[playerID].luckCardConfirmed = true;
    },
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
        // Deal 4 cards to each player
        ['0', '1', '2'].forEach(pid => {
          drawCards(G, pid, 4);
        });
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
    playCardToJudgment: ({ G, playerID }, { card, targetPlayerID, type }) => {
      // Remove card from hand
      const hand = G.hands[playerID];
      const cardIndex = hand.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        hand.splice(cardIndex, 1);
      }

      // Add to target's judgment area
      // type should be 'bing', 'le', or 'dian'
      if (G.players[targetPlayerID]) {
        G.players[targetPlayerID].judges[type] = card;
        
        const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
        const targetName = G.players[targetPlayerID].general ? G.players[targetPlayerID].general.name : `Player ${targetPlayerID}`;
        G.actionLog.push(`${playerName} used ${card.name} on ${targetName}`);
      }
    },
    discardJudgmentCard: ({ G, playerID }, type) => {
      const player = G.players[playerID];
      if (player && player.judges[type]) {
        const card = player.judges[type];
        player.judges[type] = null;
        addToDiscardPile(G, card);
        
        const playerName = player.general ? player.general.name : `Player ${playerID}`;
        G.actionLog.push(`${playerName} discarded ${card.name} from judgment area`);
      }
    },
    moveLightning: ({ G, playerID }) => {
      const player = G.players[playerID];
      const card = player.judges.dian;
      
      if (!card) return;

      // Remove from current player
      player.judges.dian = null;

      // Find next player (counter-clockwise: 0 -> 1 -> 2 -> 0)
      // Assuming playerIDs are '0', '1', '2'
      let nextPlayerID = String((parseInt(playerID) + 1) % 3);
      
      // Check if next player already has lightning
      // If so, skip to the next one
      let attempts = 0;
      while (G.players[nextPlayerID].judges.dian && attempts < 3) {
        nextPlayerID = String((parseInt(nextPlayerID) + 1) % 3);
        attempts++;
      }

      // If everyone has lightning (unlikely with 1 deck but possible in theory if multiple decks), 
      // we might need a rule. But standard rules say it just moves to next available.
      // If we looped back to original player, it stays (or is discarded? Rules say it moves to next player. 
      // If next player has one, skip. If all have one, it probably shouldn't happen in standard play).
      // For now, if we found a spot, place it.
      
      if (!G.players[nextPlayerID].judges.dian) {
        G.players[nextPlayerID].judges.dian = card;
        const playerName = player.general ? player.general.name : `Player ${playerID}`;
        const targetName = G.players[nextPlayerID].general ? G.players[nextPlayerID].general.name : `Player ${nextPlayerID}`;
        G.actionLog.push(`${playerName} moved Lightning to ${targetName}`);
      } else {
        // Fallback: discard if no one can take it (shouldn't happen in 3 player with 1 lightning)
        addToDiscardPile(G, card);
      }
    },
    toggleJudgment: ({ G }, playerID, type) => {
      const player = G.players[playerID];
      if (player && player.judges && player.judges.hasOwnProperty(type)) {
        player.judges[type] = !player.judges[type];
      }
    },
    confirm_select_card: ({ G, playerID }, selectedCards) => {
      const { active, sourcePlayerID, targetPlayerID, actionType, pendingCard } = G.selectCard;
      
      if (!active || playerID !== sourcePlayerID) return;
      
      const targetPlayer = G.players[targetPlayerID];
      const sourcePlayer = G.players[sourcePlayerID];
      
      if (!targetPlayer || !sourcePlayer) return;

      const cardsToProcess = [];

      // Process each selected card
      selectedCards.forEach(selection => {
        // selection: { type: 'hand'|'equip'|'judge', index: number, slot: string, card: object }
        if (selection.type === 'hand') {
          // For hand cards, we need to find the card by index or ID. 
          // Since hand is an array, index is risky if hand changes, but here it's synchronous.
          // However, the UI should pass the card object or index.
          // Let's assume selection has index for hand.
          const card = G.hands[targetPlayerID][selection.index];
          if (card) {
            cardsToProcess.push(card);
            // Remove from hand (we'll do batch removal later to avoid index shift issues if multiple)
            // Actually, let's mark for removal or handle one by one carefully.
            // Since we usually select 1 card for these skills, it's fine.
            // If multiple, we should sort indices descending.
          }
        } else if (selection.type === 'equip') {
          const card = targetPlayer.equipments[selection.slot];
          if (card) {
            cardsToProcess.push(card);
            targetPlayer.equipments[selection.slot] = null;
          }
        } else if (selection.type === 'judge') {
          const card = targetPlayer.judges[selection.slot];
          if (card) {
            cardsToProcess.push(card);
            targetPlayer.judges[selection.slot] = null;
          }
        }
      });

      // Remove hand cards
      // We need to handle indices carefully.
      const handIndicesToRemove = selectedCards
        .filter(s => s.type === 'hand')
        .map(s => s.index)
        .sort((a, b) => b - a); // Descending order
      
      handIndicesToRemove.forEach(index => {
        G.hands[targetPlayerID].splice(index, 1);
      });

      // Perform Action
      if (actionType === 'discard') {
        addToDiscardPile(G, cardsToProcess);
        const cardNames = cardsToProcess.map(c => c.name).join(', ');
        const sourceName = sourcePlayer.general ? sourcePlayer.general.name : `Player ${sourcePlayerID}`;
        const targetName = targetPlayer.general ? targetPlayer.general.name : `Player ${targetPlayerID}`;
        G.actionLog.push(`${sourceName} 弃置了 ${targetName} 的 ${cardNames}`);
      } else if (actionType === 'steal') {
        G.hands[sourcePlayerID].push(...cardsToProcess);
        // Masked log for Snatch
        const sourceName = sourcePlayer.general ? sourcePlayer.general.name : `Player ${sourcePlayerID}`;
        const targetName = targetPlayer.general ? targetPlayer.general.name : `Player ${targetPlayerID}`;
        G.actionLog.push(`${sourceName} 获得了 ${targetName} 的一张牌`);
      }

      // Reset state
      G.selectCard = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        actionType: null,
        pendingCard: null,
      };
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
          G.players[pid].equipments = createEmptyZones().equipments;
          G.players[pid].judges = createEmptyZones().judges;
          G.players[pid].luckCardCount = 10;
          G.players[pid].luckCardConfirmed = false;
        });

        // Distribute new generals
        const { generalOptions, generalChangeUsed } = distributeGenerals();
        G.generalOptions = generalOptions;
        G.generalChangeUsed = generalChangeUsed;

        G.landlord = null;
        G.bidAmount = 0;
        G.discardPile = [];
        G.phase = 'selection';
        G.gameResult = null;
        G.rematchVotes = [];
        G.actionLog = [];
      }
    },
    useSkill: ({ G, playerID }, skillName) => {
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const logEntry = `${playerName} 发动了 ${skillName}`;
      G.actionLog.push(logEntry);
      
      G.lastAction = {
        type: 'useSkill',
        playerID,
        skillName
      };
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
        const logEntry = `${playerName} 弃置了 ${currentEquip.suit}${currentEquip.rank} ${currentEquip.name}`;
        G.actionLog.push(logEntry);
        addToDiscardPile(G, currentEquip);
      }

      // Equip new card
      G.players[playerID].equipments[slot] = card;

      const logEntry = `${playerName} 装备了 ${card.suit}${card.rank} ${card.name}`;
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
      addToDiscardPile(G, equipment);

      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const logEntry = `${playerName} 弃置了 ${equipment.suit}${equipment.rank} ${equipment.name}`;
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
      
      // Check for special cards validation BEFORE removing
      if (cardsPlayed.length === 1 && targetIDs && targetIDs.length === 1) {
        const card = cardsPlayed[0];
        const targetID = targetIDs[0];
        
        // Distance check for Snatch removed as per user request
      }

      // Remove cards from hand
      const newHand = hand.filter((_, index) => !cardIndices.includes(index));
      G.hands[playerID] = newHand;
      addToDiscardPile(G, cardsPlayed);

      G.lastAction = {
        type: 'play',
        playerID,
        cards: cardsPlayed,
        targetIDs
      };

      // Add to action log
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const cardNames = cardsPlayed.map(c => `${c.suit}${c.rank} ${c.name}`).join(' ');
      let logEntry = '';
      if (targetIDs && targetIDs.length > 0) {
        const targets = targetIDs.map(tid => G.players[tid].general ? G.players[tid].general.name : `Player ${tid}`).join(', ');
        logEntry = `${playerName} 对 ${targets} 出牌 ${cardNames}`;
      } else {
        logEntry = `${playerName} 出牌 ${cardNames}`;
      }
      G.actionLog.push(logEntry);

      // Check for special cards
      if (cardsPlayed.length === 1 && targetIDs && targetIDs.length === 1) {
        const card = cardsPlayed[0];
        const targetID = targetIDs[0];
        
        if (card.name === '过河拆桥') {
          G.pendingEffect = {
            active: true,
            sourcePlayerID: playerID,
            targetPlayerID: targetID,
            actionType: 'discard',
            pendingCard: card,
          };
        } else if (card.name === '顺手牵羊') {
          G.pendingEffect = {
            active: true,
            sourcePlayerID: playerID,
            targetPlayerID: targetID,
            actionType: 'steal',
            pendingCard: card,
          };
        }
      }
    },
    confirmEffect: ({ G, playerID }) => {
      if (!G.pendingEffect || !G.pendingEffect.active || G.pendingEffect.sourcePlayerID !== playerID) return;
      
      // Transfer pending effect to selectCard to start the interaction
      G.selectCard = {
        active: true,
        sourcePlayerID: G.pendingEffect.sourcePlayerID,
        targetPlayerID: G.pendingEffect.targetPlayerID,
        actionType: G.pendingEffect.actionType,
        pendingCard: G.pendingEffect.pendingCard,
      };
      
      G.pendingEffect = null;
    },
    cancelEffect: ({ G, playerID }) => {
      if (!G.pendingEffect || !G.pendingEffect.active || G.pendingEffect.sourcePlayerID !== playerID) return;
      
      // Just clear the pending effect
      G.pendingEffect = null;
    },
    discardCards: ({ G, playerID }, cardIndices) => {
      if (G.phase !== 'playing') return;
      
      const hand = G.hands[playerID];
      const cardsDiscarded = cardIndices.map(i => hand[i]);
      
      const newHand = hand.filter((_, index) => !cardIndices.includes(index));
      G.hands[playerID] = newHand;
      addToDiscardPile(G, cardsDiscarded);
      
      G.lastAction = {
        type: 'discard',
        playerID,
        cards: cardsDiscarded
      };

      // Add to action log
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const cardNames = cardsDiscarded.map(c => `${c.suit}${c.rank} ${c.name}`).join(' ');
      const logEntry = `${playerName} 弃牌 ${cardNames}`;
      G.actionLog.push(logEntry);
    },
    performJudgment: ({ G, playerID }) => {
      if (G.phase !== 'playing') return;
      
      const card = G.deck.pop();
      if (!card) return; // Deck empty

      addToDiscardPile(G, card);

      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const logEntry = `${playerName} 进行了一次判定 ${card.suit}${card.rank} ${card.name}`;
      G.actionLog.push(logEntry);
      
      G.lastAction = {
        type: 'judgment',
        playerID,
        card
      };
    }
  },

  endIf: ({ G }) => {
    if (G.deck.length === 0) {
      return { winner: 'Draw' }; // Just a placeholder
    }
  },
};