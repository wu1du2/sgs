import { isJuejinForbiddenCard, pushToExiled } from './cardUtils.js';

const shuffle = (array, rng) => {
  const newArray = [...array];
  let currentIndex = newArray.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(rng.Number() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export const caocongSkill = {
  moves: {
    caocongChengxiangStart: ({ G, playerID, random }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹冲') return;
      if (G.caocongChengxiang && G.caocongChengxiang.active) return;
      if (G.pendingEffect && G.pendingEffect.active) return;
      if (G.selectCard && G.selectCard.active) return;
      if (G.fireAttackShowCard && G.fireAttackShowCard.active) return;
      if (G.harvestCountSelect && G.harvestCountSelect.active) return;
      if (Array.isArray(G.harvestCards) && G.harvestCards.length > 0) return;
      if (!random || typeof random.Number !== 'function') return;

      const revealedCards = [];
      for (let i = 0; i < 5; i++) {
        if (G.deck.length === 0) {
          if (G.discardPile.length > 0) {
            G.deck = shuffle(G.discardPile, random);
            G.discardPile = [];
          } else {
            break;
          }
        }
        const card = G.deck.shift();
        if (G.caomaoJuejinAuraActive && isJuejinForbiddenCard(card)) {
          pushToExiled(G, card);
          i -= 1;
          continue;
        }
        if (card) revealedCards.push(card);
      }

      if (revealedCards.length === 0) return;

      G.caocongChengxiang = {
        active: true,
        sourcePlayerID: playerID,
        revealedCards,
        selectedIds: [],
        sum: 0
      };
      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 发动称象，亮出牌堆顶${revealedCards.length}张牌`);
    },

    caocongChengxiangToggle: ({ G, playerID }, cardId) => {
      const s = G.caocongChengxiang;
      if (!s || !s.active || s.sourcePlayerID !== playerID) return;
      if (!Array.isArray(s.revealedCards) || s.revealedCards.length === 0) return;
      const id = String(cardId);
      const cardExists = s.revealedCards.some(c => c && String(c.id) === id);
      if (!cardExists) return;
      if (!Array.isArray(s.selectedIds)) s.selectedIds = [];
      if (s.selectedIds.includes(id)) {
        s.selectedIds = s.selectedIds.filter(x => x !== id);
      } else {
        s.selectedIds = [...s.selectedIds, id];
      }
      let sum = 0;
      s.revealedCards.forEach(c => {
        if (!c) return;
        const cid = String(c.id);
        if (!s.selectedIds.includes(cid)) return;
        if (c.rank === 'A') sum += 1;
        else if (c.rank === 'J') sum += 11;
        else if (c.rank === 'Q') sum += 12;
        else if (c.rank === 'K') sum += 13;
        else sum += parseInt(c.rank, 10);
      });
      s.sum = sum;
    },

    caocongChengxiangConfirm: ({ G, playerID }) => {
      const s = G.caocongChengxiang;
      if (!s || !s.active || s.sourcePlayerID !== playerID) return;
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹冲') return;
      if (!Array.isArray(s.revealedCards) || s.revealedCards.length === 0) return;
      if (!Array.isArray(s.selectedIds) || s.selectedIds.length === 0) return;
      if (typeof s.sum !== 'number' || s.sum > 13) return;

      const selected = [];
      const remaining = [];
      s.revealedCards.forEach(c => {
        if (!c) return;
        const cid = String(c.id);
        if (s.selectedIds.includes(cid)) selected.push(c);
        else remaining.push(c);
      });

      if (!G.hands[playerID]) G.hands[playerID] = [];
      G.hands[playerID].push(...selected);
      if (!Array.isArray(G.discardPile)) G.discardPile = [];
      G.discardPile.push(...remaining);

      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 称象获得${selected.length}张牌（点数和${s.sum}）`);
      if (remaining.length > 0) {
        G.actionLog.push(`称象剩余${remaining.length}张牌进入弃牌堆`);
      }
      G.caocongChengxiang = null;
    },

    caocongChengxiangCancel: ({ G, playerID }) => {
      const s = G.caocongChengxiang;
      if (!s || !s.active || s.sourcePlayerID !== playerID) return;
      if (Array.isArray(s.revealedCards) && s.revealedCards.length > 0) {
        if (!Array.isArray(G.discardPile)) G.discardPile = [];
        G.discardPile.push(...s.revealedCards);
      }
      const player = G.players[playerID];
      const playerName = player && player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 取消了称象`);
      G.caocongChengxiang = null;
    },

    caocongRenxinFlip: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹冲') return;
      player.is_turned_over = !player.is_turned_over;
      const playerName = player.general.name;
      if (player.is_turned_over) {
        G.actionLog.push(`${playerName} 发动仁心，翻面`);
      } else {
        G.actionLog.push(`${playerName} 发动仁心，翻回正面`);
      }
    }
  }
};
