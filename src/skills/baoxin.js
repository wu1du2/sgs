const shuffleArray = (array, rng) => {
  let currentIndex = array.length;
  let randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor((rng ? rng.Number() : Math.random()) * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const getPlayerName = (G, playerID) => {
  const player = G.players[playerID];
  return player && player.general ? player.general.name : `Player ${playerID}`;
};

const isShaCard = (card) => {
  return card && (card.name === '杀' || card.name === '火杀' || card.name === '雷杀');
};

const drawOneCardInline = (G, playerID, rng) => {
  if (G.deck.length === 0) {
    if (G.discardPile.length > 0) {
      G.deck = shuffleArray(G.discardPile, rng);
      G.discardPile = [];
    } else {
      return null;
    }
  }
  const card = G.deck.shift();
  if (card) {
    G.hands[playerID].push(card);
  }
  return card;
};

export const baoxinSkill = {
  mutao: {
    name: '募讨',
    action: ({ G, ctx, playerID }, targetID) => {
      const self = G.players[playerID];
      if (!self || !self.general || self.general.name !== '鲍信') return;
      if (!G.players[targetID]) return;

      const targetHand = G.hands[targetID] || [];
      const shaCards = [];
      for (let i = targetHand.length - 1; i >= 0; i -= 1) {
        const card = targetHand[i];
        if (isShaCard(card)) {
          shaCards.push(card);
          targetHand.splice(i, 1);
        }
      }

      const sourceName = getPlayerName(G, playerID);
      const targetName = getPlayerName(G, targetID);
      if (shaCards.length === 0) {
        G.actionLog.push(`${sourceName} 对 ${targetName} 使用了募讨，但其没有【杀】`);
        return;
      }

      const playerCount = Object.keys(G.players).length;
      const order = [];
      let current = String((parseInt(targetID) + 1) % playerCount);
      for (let i = 0; i < playerCount; i += 1) {
        order.push(current);
        current = String((parseInt(current) + 1) % playerCount);
      }

      let lastRecipient = null;
      let giveIndex = 0;
      const remaining = [...shaCards];
      while (remaining.length > 0) {
        const recipientID = order[giveIndex % order.length];
        const rand = ctx.random ? ctx.random.Number() : Math.random();
        const pickIndex = Math.floor(rand * remaining.length);
        const card = remaining.splice(pickIndex, 1)[0];
        G.hands[recipientID].push(card);
        lastRecipient = recipientID;
        giveIndex += 1;
      }

      if (lastRecipient === null) return;

      const lastHand = G.hands[lastRecipient] || [];
      const shaCount = lastHand.filter(c => isShaCard(c)).length;
      const damage = Math.min(shaCount, 2);
      const lastPlayer = G.players[lastRecipient];
      const lastName = getPlayerName(G, lastRecipient);

      if (damage > 0 && lastPlayer) {
        let dmg = damage;
        if (lastPlayer.armor > 0) {
          if (lastPlayer.armor >= dmg) {
            lastPlayer.armor -= dmg;
            dmg = 0;
          } else {
            dmg -= lastPlayer.armor;
            lastPlayer.armor = 0;
          }
        }
        if (dmg > 0) {
          lastPlayer.hp = Math.max(lastPlayer.hp - dmg, 0);
        }
      }

      G.actionLog.push(`${sourceName} 对 ${targetName} 使用了募讨，最终对 ${lastName} 造成 ${damage} 点伤害`);
    }
  },
  yimou: {
    name: '毅谋',
    optionOne: ({ G, ctx, playerID }, targetID) => {
      const self = G.players[playerID];
      if (!self || !self.general || self.general.name !== '鲍信') return;
      if (!G.players[targetID]) return;

      if (G.deck.length === 0 && G.discardPile.length > 0) {
        G.deck = shuffleArray(G.discardPile, ctx.random);
        G.discardPile = [];
      }

      const cardIndex = G.deck.findIndex(c => isShaCard(c));
      const sourceName = getPlayerName(G, playerID);
      const targetName = getPlayerName(G, targetID);

      if (cardIndex === -1) {
        G.actionLog.push(`${sourceName} 对 ${targetName} 使用毅谋，但牌堆没有【杀】`);
        return;
      }

      const card = G.deck.splice(cardIndex, 1)[0];
      G.hands[targetID].push(card);
      G.actionLog.push(`${sourceName} 令 ${targetName} 获得一张【杀】`);
    },
    optionTwo: ({ G, playerID }, targetID) => {
      const self = G.players[playerID];
      if (!self || !self.general || self.general.name !== '鲍信') return;
      if (!G.players[targetID]) return;

      G.yimouSelect = {
        active: true,
        sourcePlayerID: playerID,
        targetPlayerID: targetID,
        recipientPlayerID: null,
        stage: 'select_recipient'
      };
      const sourceName = getPlayerName(G, playerID);
      const targetName = getPlayerName(G, targetID);
      G.actionLog.push(`${sourceName} 对 ${targetName} 使用毅谋：选择交牌目标`);
    },
    selectRecipient: ({ G, playerID }, recipientID) => {
      if (!G.yimouSelect || !G.yimouSelect.active) return;
      if (G.yimouSelect.targetPlayerID !== playerID) return;
      if (!G.players[recipientID]) return;
      if (recipientID === playerID) return;
      G.yimouSelect.recipientPlayerID = recipientID;
      G.yimouSelect.stage = 'card_selection';
    },
    confirmCard: ({ G, ctx, playerID }, selected) => {
      if (!G.yimouSelect || !G.yimouSelect.active) return;
      if (G.yimouSelect.targetPlayerID !== playerID) return;
      if (G.yimouSelect.stage !== 'card_selection') return;
      const recipientID = G.yimouSelect.recipientPlayerID;
      if (!recipientID || !G.players[recipientID]) return;

      const pick = Array.isArray(selected) && selected.length > 0 ? selected[0] : null;
      if (!pick || pick.type !== 'hand') return;

      const hand = G.hands[playerID] || [];
      const card = hand.splice(pick.index, 1)[0];
      if (!card) return;
      G.hands[recipientID].push(card);

      const drawn = drawOneCardInline(G, playerID, ctx.random);
      const targetName = getPlayerName(G, playerID);
      const recipientName = getPlayerName(G, recipientID);
      if (drawn) {
        G.actionLog.push(`${targetName} 交给 ${recipientName} 1 张牌并摸 1 张牌`);
      } else {
        G.actionLog.push(`${targetName} 交给 ${recipientName} 1 张牌，但牌堆为空未摸牌`);
      }

      G.yimouSelect = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        recipientPlayerID: null,
        stage: null
      };
    },
    cancel: ({ G, playerID }) => {
      if (!G.yimouSelect || !G.yimouSelect.active) return;
      if (G.yimouSelect.sourcePlayerID !== playerID && G.yimouSelect.targetPlayerID !== playerID) return;
      G.yimouSelect = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        recipientPlayerID: null,
        stage: null
      };
    }
  }
};
