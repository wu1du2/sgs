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
  is_linked: false,
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
    fireAttackShowCard: {
      active: false,
      sourcePlayerID: null,
      targetPlayerID: null,
    },
    harvestCards: [], // Cards for "Harvest" (五谷丰登)
    harvestCountSelect: { // New state for selecting harvest count
      active: false,
      playerID: null,
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
    toggleLinked: ({ G }, playerID) => {
      const player = G.players[playerID];
      player.is_linked = !player.is_linked;
    },
    playerReady: ({ G, playerID }) => {
      if (!G.readyPlayers.includes(playerID)) {
        G.readyPlayers.push(playerID);
      }
      if (G.readyPlayers.length === 3 && G.phase === 'lobby') {
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
      
      // If everyone has lightning (unlikely but possible with multiple decks), discard it
      if (G.players[nextPlayerID].judges.dian) {
        addToDiscardPile(G, card);
        G.actionLog.push(`Lightning ${card.name} discarded (no valid target)`);
      } else {
        G.players[nextPlayerID].judges.dian = card;
        G.actionLog.push(`Lightning moved to Player ${nextPlayerID}`);
      }
    },
    playCards: ({ G, playerID }, cardIndices, targetIds) => {
      const hand = G.hands[playerID];
      const cardsPlayed = cardIndices.map(i => hand[i]);
      
      // Remove cards from hand
      // Sort indices descending to remove correctly
      [...cardIndices].sort((a, b) => b - a).forEach(index => {
        hand.splice(index, 1);
      });
      
      // Add to discard pile
      addToDiscardPile(G, cardsPlayed);
      
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const cardNames = cardsPlayed.map(c => `${c.suit}${c.rank} ${c.name}`).join(' ');
      
      let logEntry = `${playerName} played ${cardNames}`;
      if (targetIds && targetIds.length > 0) {
        const targetNames = targetIds.map(tid => G.players[tid].general ? G.players[tid].general.name : `Player ${tid}`).join(', ');
        logEntry += ` targeting ${targetNames}`;
      }
      G.actionLog.push(logEntry);
      
      // Handle Card Effects
      if (cardsPlayed.length === 1) {
        const card = cardsPlayed[0];
        if (card.name === '五谷丰登') {
           G.harvestCountSelect = {
             active: true,
             playerID: playerID
           };
           G.actionLog.push(`${playerName} played Harvest (五谷丰登), waiting for count selection`);
        } else if (['顺手牵羊', '过河拆桥', '火攻'].includes(card.name)) {
           if (targetIds && targetIds.length === 1) {
              let actionType = '';
              if (card.name === '顺手牵羊') actionType = 'steal';
              else if (card.name === '过河拆桥') actionType = 'discard';
              else if (card.name === '火攻') actionType = 'fire_attack';

              G.pendingEffect = {
                 active: true,
                 sourcePlayerID: playerID,
                 targetPlayerID: targetIds[0],
                 actionType: actionType,
                 pendingCard: card
              };
              G.actionLog.push(`${playerName} played ${card.name}, waiting for effect confirmation`);
           }
        }
      }
    },

    selectHarvestCount: ({ G, playerID }, count) => {
      if (!G.harvestCountSelect.active || G.harvestCountSelect.playerID !== playerID) return;
      
      const numCards = count;
      const cards = drawCards(G, playerID, numCards);
      
      // Revert the draw to hand (pop from hand)
      if (cards.length > 0) {
        G.hands[playerID].splice(G.hands[playerID].length - cards.length, cards.length);
      }
      G.harvestCards = cards;
      
      G.harvestCountSelect = { active: false, playerID: null };
      
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} selected ${count} cards for Harvest`);
    },

    equipCard: ({ G, playerID }, cardIndex) => {
      const hand = G.hands[playerID];
      const card = hand[cardIndex];
      
      // Remove from hand
      hand.splice(cardIndex, 1);
      
      // Equip
      const player = G.players[playerID];
      let oldCard = null;
      
      if (card.type === '武器') {
        oldCard = player.equipments.weapon;
        player.equipments.weapon = card;
      } else if (card.type === '防具') {
        oldCard = player.equipments.armor;
        player.equipments.armor = card;
      } else if (card.type === '加一') {
        oldCard = player.equipments.plusOne;
        player.equipments.plusOne = card;
      } else if (card.type === '减一') {
        oldCard = player.equipments.minusOne;
        player.equipments.minusOne = card;
      }
      
      // Discard old equipment if any
      if (oldCard) {
        addToDiscardPile(G, oldCard);
      }
      
      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} equipped ${card.name}`);
    },

    triggerHarvest: ({ G, playerID }) => {
      // Draw X cards where X is number of players (3)
      const numPlayers = 3;
      const cards = drawCards(G, playerID, numPlayers); // Temporarily draw to player to get cards, but we need to move them to harvestCards
      
      // Revert the draw to hand (pop from hand)
      // Use cards.length in case fewer cards were drawn
      if (cards.length > 0) {
        G.hands[playerID].splice(G.hands[playerID].length - cards.length, cards.length);
      }
      
      // Put them in harvestCards
      G.harvestCards = cards;
      
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} triggered Harvest (五谷丰登)`);
    },
    pickHarvestCard: ({ G, playerID }, cardIndex) => {
      if (G.harvestCards[cardIndex]) {
        const card = G.harvestCards[cardIndex];
        G.harvestCards.splice(cardIndex, 1);
        G.hands[playerID].push(card);
        
        const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
        G.actionLog.push(`${playerName} picked ${card.name} from Harvest`);
      }
    },
    endHarvest: ({ G }) => {
      if (G.harvestCards.length > 0) {
        addToDiscardPile(G, G.harvestCards);
        G.actionLog.push(`${G.harvestCards.length} cards from Harvest discarded`);
        G.harvestCards = [];
      }
    },

    confirmEffect: ({ G, playerID }) => {
      if (!G.pendingEffect || !G.pendingEffect.active || G.pendingEffect.sourcePlayerID !== playerID) return;
      
      const { actionType, sourcePlayerID, targetPlayerID, pendingCard } = G.pendingEffect;

      if (actionType === 'fire_attack') {
         G.fireAttackShowCard = {
            active: true,
            sourcePlayerID,
            targetPlayerID
         };
         const targetName = G.players[targetPlayerID].general ? G.players[targetPlayerID].general.name : `Player ${targetPlayerID}`;
         G.actionLog.push(`Fire Attack effective, ${targetName} must show a card`);
      } else {
        // Transfer pending effect to selectCard to start the interaction
        G.selectCard = {
          active: true,
          sourcePlayerID,
          targetPlayerID,
          actionType,
          pendingCard,
        };
      }
      
      G.pendingEffect = null;
    },
    cancelEffect: ({ G, playerID }) => {
      if (!G.pendingEffect || !G.pendingEffect.active || G.pendingEffect.sourcePlayerID !== playerID) return;
      
      // Just clear the pending effect
      G.pendingEffect = null;
    },
    confirmFireAttackShowCard: ({ G, playerID }, cardIndex) => {
       if (!G.fireAttackShowCard.active || G.fireAttackShowCard.targetPlayerID !== playerID) return;
       
       const hand = G.hands[playerID];
       const card = hand[cardIndex];
       
       const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
       G.actionLog.push(`${playerName} 展示了一张 ${card.suit}${card.rank} ${card.name}`);
       
       // Reset state
       G.fireAttackShowCard = {
          active: false,
          sourcePlayerID: null,
          targetPlayerID: null
       };
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
    
    discardEquipment: ({ G, playerID }, slot) => {
      const player = G.players[playerID];
      const card = player.equipments[slot];
      if (card) {
        player.equipments[slot] = null;
        addToDiscardPile(G, card);
        const playerName = player.general ? player.general.name : `Player ${playerID}`;
        G.actionLog.push(`${playerName} discarded ${card.name} from ${slot}`);
      }
    },

    confirm_select_card: ({ G, playerID }, selectedItems) => {
      const { sourcePlayerID, targetPlayerID, actionType, pendingCard } = G.selectCard;
      
      if (!G.selectCard.active) return;
      
      const targetPlayer = G.players[targetPlayerID];
      const targetHand = G.hands[targetPlayerID];
      
      // Process each selected item
      selectedItems.forEach(item => {
        let card = null;
        
        if (item.type === 'hand') {
          // For hand cards, we need to be careful about indices shifting if we remove multiple.
          // But usually Dismantlement/Snatch is 1 card.
          // If multiple, we should sort indices descending.
          // But here we iterate.
          // Actually, if we remove one, the index of others might change.
          // But let's assume single selection for now as per 'singleSelection' prop in Board.jsx.
          // Board.jsx sets singleSelection={['过河拆桥', '顺手牵羊'].includes(...)}
          // So it is single selection.
          
          card = targetHand[item.index];
          if (card) {
             if (actionType === 'discard') {
               targetHand.splice(item.index, 1);
               addToDiscardPile(G, card);
               G.actionLog.push(`Player ${playerID} discarded a card from Player ${targetPlayerID}'s hand`);
             } else if (actionType === 'steal') {
               targetHand.splice(item.index, 1);
               G.hands[playerID].push(card);
               G.actionLog.push(`Player ${playerID} stole a card from Player ${targetPlayerID}'s hand`);
             }
          }
        } else if (item.type === 'equip') {
          card = targetPlayer.equipments[item.slot];
          if (card) {
            targetPlayer.equipments[item.slot] = null;
            if (actionType === 'discard') {
              addToDiscardPile(G, card);
              G.actionLog.push(`Player ${playerID} discarded ${card.name} from Player ${targetPlayerID}'s equipment`);
            } else if (actionType === 'steal') {
              G.hands[playerID].push(card);
              G.actionLog.push(`Player ${playerID} stole ${card.name} from Player ${targetPlayerID}'s equipment`);
            }
          }
        } else if (item.type === 'judge') {
          card = targetPlayer.judges[item.slot];
          if (card) {
            targetPlayer.judges[item.slot] = null;
            if (actionType === 'discard') {
              addToDiscardPile(G, card);
              G.actionLog.push(`Player ${playerID} discarded ${card.name} from Player ${targetPlayerID}'s judgment area`);
            } else if (actionType === 'steal') {
              G.hands[playerID].push(card);
              G.actionLog.push(`Player ${playerID} stole ${card.name} from Player ${targetPlayerID}'s judgment area`);
            }
          }
        }
      });
      
      // Reset selectCard state
      G.selectCard = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        actionType: null,
        pendingCard: null,
      };
    },

    changeGeneral: ({ G, playerID }, generalId) => {
      G.actionLog.push(`Player ${playerID} tried to change general (not fully implemented)`);
    },

    resolveGame: ({ G }, winnerRole) => {
      const scoreChanges = {};
      const baseScore = G.bidAmount || 1; // Default to 1 if no bid
      
      // Calculate score changes
      ['0', '1', '2'].forEach(pid => {
        const player = G.players[pid];
        const isWinner = player.role === winnerRole;
        
        if (isWinner) {
          // Winner gets points
          if (player.role === 'landlord') {
            scoreChanges[pid] = 2 * baseScore;
          } else {
            scoreChanges[pid] = 1 * baseScore;
          }
        } else {
          // Loser loses points
          if (player.role === 'landlord') {
             scoreChanges[pid] = -2 * baseScore;
          } else {
             scoreChanges[pid] = -1 * baseScore;
          }
        }
        
        // Update player score
        player.score += scoreChanges[pid];
      });

      G.gameResult = { 
        winner: winnerRole,
        scoreChanges
      };
      G.phase = 'gameover';
    },

    voteRematch: ({ G, playerID }) => {
      if (!G.rematchVotes.includes(playerID)) {
        G.rematchVotes.push(playerID);
      }
      if (G.rematchVotes.length === 3) {
        G.actionLog.push(`All players voted for rematch`);
        
        // Reset Game State for new round
        
        // 1. Shuffle deck
        G.deck = shuffle(SGS_CARDS.map((c, i) => ({ ...c, id: `card-${i}` })));
        G.discardPile = [];
        
        // 2. Reset hands
        G.hands = { '0': [], '1': [], '2': [] };
        
        // 3. Reset players (keep scores)
        ['0', '1', '2'].forEach(pid => {
          const currentScore = G.players[pid].score;
          G.players[pid] = createPlayerState();
          G.players[pid].score = currentScore;
        });
        
        // 4. Reset other game state
        G.generalOptions = { '0': [], '1': [], '2': [] };
        G.generalChangeUsed = { '0': [false, false, false], '1': [false, false, false], '2': [false, false, false] };
        
        // Since all players voted for rematch, we can skip the lobby wait and go directly to selection
        G.readyPlayers = ['0', '1', '2'];
        G.phase = 'selection';
        
        // Distribute generals immediately
        const { generalOptions, generalChangeUsed } = distributeGenerals();
        G.generalOptions = generalOptions;
        G.generalChangeUsed = generalChangeUsed;

        G.landlord = null;
        G.bidAmount = 0;
        G.gameResult = null;
        G.rematchVotes = [];
        G.lastAction = null;
        G.actionLog = [];
        G.pendingEffect = null;
        G.selectCard = {
          active: false,
          sourcePlayerID: null,
          targetPlayerID: null,
          actionType: null,
          pendingCard: null,
        };
        G.harvestCards = [];
      }
    },

    useSkill: ({ G, playerID }, skillName) => {
      G.actionLog.push(`Player ${playerID} used skill ${skillName} (not implemented)`);
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