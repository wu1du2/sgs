import { SGS_CARDS } from './sgs_data.js';
import generalsData from '../configs/generals.json' with { type: "json" };

// Filter enabled generals
const ENABLED_GENERALS = generalsData.filter(g => g.enable);

const TESTING_GENERAL_LIST = ['界徐盛', '文鸯'];

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
    if (pid === '0' && TESTING_GENERAL_LIST.length > 0) {
      // Ensure player 0 gets testing generals
      const testingGenerals = ENABLED_GENERALS.filter(g => TESTING_GENERAL_LIST.includes(g.name));
      const otherGenerals = shuffledGenerals.filter(g => !TESTING_GENERAL_LIST.includes(g.name));
      
      // Combine testing generals with random others to make 3 options
      const options = [...testingGenerals];
      while (options.length < 3 && otherGenerals.length > 0) {
        options.push(otherGenerals.pop());
      }
      generalOptions[pid] = options.slice(0, 3);
      
      // Adjust shuffledGenerals to remove used ones (though simple filtering above handles duplicates for p0, 
      // we need to ensure p1 and p2 don't get the same ones if we want strict uniqueness, 
      // but for testing it's fine if we just consume from the main shuffled list for others, 
      // skipping what p0 took if we want to be precise. 
      // Simpler approach: Just give p0 what they need, and let others take from the shuffled list, 
      // filtering out what p0 has to avoid duplicates if necessary.
      // Given the large pool, collision is rare, but let's be safe.)
      
      // Actually, let's just use the main loop but override for p0
    } else {
      // For other players, just take from the shuffled list, ensuring no overlap with p0 if we want to be strict
      // But the original logic just sliced. Let's keep it simple and robust.
      
      // To avoid duplicates with P0's forced selection:
      // We should probably filter out P0's cards from shuffledGenerals before assigning to others.
      // But since this is a quick testing hack, let's just assign.
      // If P0 took 'Jie Xu Sheng', and 'Jie Xu Sheng' is also at index 0 of shuffledGenerals, P1 might get it.
      // Let's do a proper filter.
    }
  });
  
  // Re-implementing to be cleaner
  const assignedGenerals = new Set();
  
  // Assign for Player 0 first
  const p0Options = [];
  const testingGenerals = ENABLED_GENERALS.filter(g => TESTING_GENERAL_LIST.includes(g.name));
  p0Options.push(...testingGenerals);
  
  // Fill P0 with randoms if needed
  let currentIndex = 0;
  while (p0Options.length < 3 && currentIndex < shuffledGenerals.length) {
    const gen = shuffledGenerals[currentIndex++];
    if (!p0Options.find(g => g.id === gen.id)) {
      p0Options.push(gen);
    }
  }
  generalOptions['0'] = p0Options;
  p0Options.forEach(g => assignedGenerals.add(g.id));
  generalChangeUsed['0'] = [false, false, false];

  // Assign for others
  ['1', '2'].forEach(pid => {
    const options = [];
    while (options.length < 3 && currentIndex < shuffledGenerals.length) {
      const gen = shuffledGenerals[currentIndex++];
      if (!assignedGenerals.has(gen.id)) {
        options.push(gen);
        assignedGenerals.add(gen.id);
      }
    }
    generalOptions[pid] = options;
    generalChangeUsed[pid] = [false, false, false];
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

import { jiexushengSkill } from './skills/jiexusheng.js';
import { wenyangSkill } from './skills/wenyang.js';

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
    pojunSelect: {
      active: false,
      sourcePlayerID: null,
      targetPlayerID: null,
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
        // Initialize HP on player object to avoid polluting the global config
        G.players[playerID].hp = selected.hp;
        G.players[playerID].hpMax = selected.hpMax;
        
        // Apply Landlord bonus if this player is the landlord
        if (G.players[playerID].role === 'landlord') {
           G.players[playerID].hpMax += 1;
           G.players[playerID].hp += 1;
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
            G.players[pid].hpMax += 1;
            G.players[pid].hp += 1;
          }
        } else {
          G.players[pid].role = 'peasant';
        }
      });
    },
    modifyHP: ({ G }, targetPlayerID, amount) => {
      const player = G.players[targetPlayerID];
      if (player && player.hp !== undefined) {
        if (amount > 0) {
           player.hp = Math.min(player.hp + amount, player.hpMax);
        } else {
           player.hp = Math.max(player.hp + amount, 0);
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
      
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const cardNames = cardsPlayed.map(c => `${c.suit}${c.rank} ${c.name}`).join(' ');
      
      let logEntry = `${playerName} played ${cardNames}`;
      if (targetIds && targetIds.length > 0) {
        const targetNames = targetIds.map(tid => G.players[tid].general ? G.players[tid].general.name : `Player ${tid}`).join(', ');
        logEntry += ` targeting ${targetNames}`;
      }
      G.actionLog.push(logEntry);
      
      // Iterate through played cards to handle destination (Discard vs Equip vs Judge)
      cardsPlayed.forEach(card => {
        // 1. Equipment
        if (['武器', '防具', '加一', '减一'].includes(card.type)) {
            const player = G.players[playerID];
            let slot = '';
            if (card.type === '武器') slot = 'weapon';
            else if (card.type === '防具') slot = 'armor';
            else if (card.type === '加一') slot = 'plusOne';
            else if (card.type === '减一') slot = 'minusOne';
            
            const oldCard = player.equipments[slot];
            if (oldCard) {
                addToDiscardPile(G, oldCard);
            }
            player.equipments[slot] = card;
            G.actionLog.push(`${playerName} equipped ${card.name}`);
        } 
        // 2. Delayed Scrolls (Judgments)
        else if (['乐', '兵', '电'].includes(card.type)) {
            let targetID = null;
            let judgeSlot = '';
            
            if (card.type === '电') { // Lightning
                targetID = playerID; // Lightning is put on self
                judgeSlot = 'dian';
            } else if (card.type === '乐') { // Indulgence
                targetID = targetIds && targetIds.length > 0 ? targetIds[0] : null;
                judgeSlot = 'le';
            } else if (card.type === '兵') { // Supply Shortage
                targetID = targetIds && targetIds.length > 0 ? targetIds[0] : null;
                judgeSlot = 'bing';
            }
            
            if (targetID !== null) {
                const targetPlayer = G.players[targetID];
                // Check if slot is empty
                if (targetPlayer.judges[judgeSlot]) {
                    addToDiscardPile(G, card);
                    G.actionLog.push(`Cannot play ${card.name}, judgment slot occupied. Card discarded.`);
                } else {
                    targetPlayer.judges[judgeSlot] = card;
                    const targetName = targetPlayer.general ? targetPlayer.general.name : `Player ${targetID}`;
                    G.actionLog.push(`${playerName} placed ${card.name} on ${targetName}'s judgment area`);
                }
            } else {
                addToDiscardPile(G, card);
                G.actionLog.push(`No target for ${card.name}, discarded.`);
            }
        }
        // 3. Regular Cards (Basic, Scroll)
        else {
            addToDiscardPile(G, card);
            
            // Handle Card Effects for Regular Cards
            if (card.name === '五谷丰登') {
               G.harvestCountSelect = {
                 active: true,
                 playerID: playerID
               };
               G.actionLog.push(`${playerName} played Harvest (五谷丰登), waiting for count selection`);
            } else if (['顺手牵羊', '过河拆桥', '火攻', '借刀杀人'].includes(card.name)) {
               if (targetIds && targetIds.length === 1) {
                  let actionType = '';
                  if (card.name === '顺手牵羊') actionType = 'steal';
                  else if (card.name === '过河拆桥') actionType = 'discard';
                  else if (card.name === '火攻') actionType = 'fire_attack';
                  else if (card.name === '借刀杀人') actionType = 'collateral';

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
      });
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
      } else if (actionType === 'collateral') {
         // For Collateral (借刀杀人), if the target doesn't slash, we steal their weapon.
         // Since we don't have the "Ask to Slash" UI yet, we default to the "Steal Weapon" penalty.
         // We reuse the 'steal' action type for the selection phase.
         G.selectCard = {
            active: true,
            sourcePlayerID,
            targetPlayerID,
            actionType: 'steal',
            pendingCard,
         };
         G.actionLog.push(`Collateral effective, proceeding to steal weapon`);
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
      
      const sourcePlayer = G.players[playerID];
      const sourcePlayerName = sourcePlayer.general ? sourcePlayer.general.name : `Player ${playerID}`;
      const targetPlayerName = targetPlayer.general ? targetPlayer.general.name : `Player ${targetPlayerID}`;

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
               G.actionLog.push(`${sourcePlayerName} discarded a card from ${targetPlayerName}'s hand`);
             } else if (actionType === 'steal') {
               targetHand.splice(item.index, 1);
               G.hands[playerID].push(card);
               G.actionLog.push(`${sourcePlayerName} stole a card from ${targetPlayerName}'s hand`);
             }
          }
        } else if (item.type === 'equip') {
          card = targetPlayer.equipments[item.slot];
          if (card) {
            targetPlayer.equipments[item.slot] = null;
            if (actionType === 'discard') {
              addToDiscardPile(G, card);
              G.actionLog.push(`${sourcePlayerName} discarded ${card.name} from ${targetPlayerName}'s equipment`);
            } else if (actionType === 'steal') {
              G.hands[playerID].push(card);
              G.actionLog.push(`${sourcePlayerName} stole ${card.name} from ${targetPlayerName}'s equipment`);
            }
          }
        } else if (item.type === 'judge') {
          card = targetPlayer.judges[item.slot];
          if (card) {
            targetPlayer.judges[item.slot] = null;
            if (actionType === 'discard') {
              addToDiscardPile(G, card);
              G.actionLog.push(`${sourcePlayerName} discarded ${card.name} from ${targetPlayerName}'s judgment area`);
            } else if (actionType === 'steal') {
              G.hands[playerID].push(card);
              G.actionLog.push(`${sourcePlayerName} stole ${card.name} from ${targetPlayerName}'s judgment area`);
            }
          }
        }
      });
      
      // Reset selection state
      G.selectCard = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        actionType: null,
        pendingCard: null,
      };
      
      // If there was a pending card (the Snatch/Dismantle itself), discard it now
      if (pendingCard) {
        addToDiscardPile(G, pendingCard);
      }
    },

    changeGeneral: ({ G, playerID }, generalId) => {
      const options = G.generalOptions[playerID];
      const index = options.findIndex(g => g.id === generalId);
      
      if (index === -1) {
        return;
      }

      // Check if change already used for this slot
      if (G.generalChangeUsed[playerID][index]) {
        return;
      }

      // Collect all currently used generals to avoid duplicates
      const usedGeneralIds = new Set();
      Object.values(G.generalOptions).forEach(playerOptions => {
        playerOptions.forEach(g => usedGeneralIds.add(g.id));
      });

      // Find available generals
      const availableGenerals = ENABLED_GENERALS.filter(g => !usedGeneralIds.has(g.id));

      if (availableGenerals.length === 0) {
        G.actionLog.push("No more generals available to change");
        return;
      }

      // Pick a random one
      const newGeneral = availableGenerals[Math.floor(Math.random() * availableGenerals.length)];

      // Update state
      G.generalOptions[playerID][index] = newGeneral;
      G.generalChangeUsed[playerID][index] = true;
      
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} changed a general option`);
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

    useQueDi: ({ G, playerID }) => {
      wenyangSkill.useQueDi({ G, playerID }, drawCards);
    },
    useChouJue: ({ G, playerID }) => {
      wenyangSkill.useChouJue({ G, playerID }, drawCards);
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
    },

    // Po Jun Skills
    usePoJun: ({ G, playerID }, targetID) => {
      G.pojunSelect = {
        active: true,
        sourcePlayerID: playerID,
        targetPlayerID: targetID,
      };
      const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
      const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
      G.actionLog.push(`${playerName} activated Po Jun on ${targetName}`);
    },

    confirmPoJunSelection: ({ G, ctx, playerID }, selectedItems) => {
      const { sourcePlayerID, targetPlayerID } = G.pojunSelect;
      
      if (!G.pojunSelect.active || sourcePlayerID !== playerID) return;

      // Convert selectedItems to the format expected by jiexushengSkill.pojun.action
      // selectedItems is [{ type: 'hand', index: 0 }, { type: 'equip', slot: 'weapon' }]
      const selectedCards = {
        hand: [],
        equipments: [],
        judges: []
      };

      selectedItems.forEach(item => {
        if (item.type === 'hand') {
          selectedCards.hand.push(item.index);
        } else if (item.type === 'equip') {
          selectedCards.equipments.push(item.slot);
        } else if (item.type === 'judge') {
          selectedCards.judges.push(item.slot);
        }
      });

      // Execute the skill action
      const cardsToMove = jiexushengSkill.pojun.action({ G, ctx }, playerID, targetPlayerID, selectedCards);

      // Store cards by targetID
      if (!G.players[playerID].pojun) {
          G.players[playerID].pojun = {};
      }
      if (!G.players[playerID].pojun[targetPlayerID]) {
          G.players[playerID].pojun[targetPlayerID] = [];
      }
      G.players[playerID].pojun[targetPlayerID].push(...cardsToMove);

      // Reset selection state
      G.pojunSelect = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
      };
    },

    returnPoJunCards: ({ G, playerID }, targetID) => {
      if (G.players[playerID].pojun && G.players[playerID].pojun[targetID]) {
          const cardsToReturn = G.players[playerID].pojun[targetID];
          G.hands[targetID].push(...cardsToReturn);
          delete G.players[playerID].pojun[targetID];
          
          const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
          const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
          G.actionLog.push(`${playerName} returned Po Jun cards to ${targetName}`);
      }
    }
  },

  endIf: ({ G }) => {
    if (G.deck.length === 0) {
      return { winner: 'Draw' }; // Just a placeholder
    }
  },
};