import { addCardsToDiscard, addCardsToHand, clampArmor } from './cardUtils.js';
import { caomaoInternal } from './caomao.js';

const getRng = (random) => {
  if (random && typeof random.Number === 'function') return random;
  throw new Error('random is required');
};

const shuffle = (array, rng) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng.Number() * (i + 1));
    const tmp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = tmp;
  }
  return newArray;
};

const ensureDeckNotEmpty = (G, rng) => {
  if (Array.isArray(G.deck) && G.deck.length > 0) return;
  if (Array.isArray(G.discardPile) && G.discardPile.length > 0) {
    G.deck = shuffle(G.discardPile, rng);
    G.discardPile = [];
  }
};

const drawTopCard = (G, rng) => {
  ensureDeckNotEmpty(G, rng);
  if (!Array.isArray(G.deck) || G.deck.length === 0) return null;
  return G.deck.shift();
};

const isSlashCardName = (name) => ['杀', '火杀', '雷杀'].includes(name);

const applyDamageInternal = (G, rng, targetPlayerID, damage) => {
  const player = G.players[targetPlayerID];
  if (!player || player.hp === undefined) return;
  let remaining = damage;
  if (player.armor > 0 && remaining > 0) {
    if (player.armor >= remaining) {
      player.armor -= remaining;
      remaining = 0;
    } else {
      remaining -= player.armor;
      player.armor = 0;
    }
  }
  if (remaining > 0) {
    const beforeHp = player.hp;
    player.hp = Math.max(player.hp - remaining, 0);
    const hpLost = Math.max(0, beforeHp - player.hp);
    if (hpLost > 0 && player.general && player.general.name === '曹髦') {
      caomaoInternal.addDaoXin(G, targetPlayerID, hpLost * 10, '受伤');
      if (player.is_turned_over) {
        player.is_turned_over = false;
        caomaoInternal.gainTrickLikeRangjie(G, rng, targetPlayerID);
        G.actionLog.push(`曹髦 受到伤害后翻回正面`);
      }
    }
  }
  clampArmor(player);
};

const applySimazhaoDamage = (G, rng, sourceID, targetID, baseDamage, reason) => {
  const source = G.players[sourceID];
  let damage = baseDamage;
  if (source && source.general && source.general.name === '司马昭') {
    const pending = typeof source.simazhaoDangyiPending === 'number' ? source.simazhaoDangyiPending : 0;
    if (pending > 0) {
      source.simazhaoDangyiPending = pending - 1;
      damage += 1;
      G.actionLog.push(`司马昭 发动荡异：${reason} 伤害+1（剩余${source.simazhaoDangyiPending}）`);
    }
  }
  applyDamageInternal(G, rng, targetID, damage);
};

const takeRandomHandCard = (G, rng, targetID) => {
  const hand = G.hands[targetID];
  if (!Array.isArray(hand) || hand.length === 0) return null;
  const idx = Math.floor(rng.Number() * hand.length);
  return hand.splice(idx, 1)[0] || null;
};

const ensureSimazhaoInit = (player) => {
  if (!player) return;
  if (!player.simazhaoFaction) player.simazhaoFaction = '魏';
  if (typeof player.simazhaoXiezhenUsed !== 'boolean') player.simazhaoXiezhenUsed = false;
  if (typeof player.simazhaoQiantunUsedThisTurn !== 'boolean') player.simazhaoQiantunUsedThisTurn = false;
  if (typeof player.simazhaoWeisiUsedThisTurn !== 'boolean') player.simazhaoWeisiUsedThisTurn = false;
  if (typeof player.simazhaoZhaoxiongUsed !== 'boolean') player.simazhaoZhaoxiongUsed = false;
  if (typeof player.simazhaoDangyiPending !== 'number') player.simazhaoDangyiPending = 0;
};

const beginXiezhenRound = (G, rng) => {
  const state = G.simazhaoXiezhen;
  if (!state || !state.active) return;
  const targetID = state.targetID;
  if (typeof targetID !== 'string') {
    G.simazhaoXiezhen = null;
    return;
  }
  const revealed = [];
  for (let i = 0; i < 4; i++) {
    const c = drawTopCard(G, rng);
    if (c) revealed.push(c);
  }
  const seq = typeof G.simazhaoSeq === 'number' ? G.simazhaoSeq + 1 : 1;
  G.simazhaoSeq = seq;
  G.simazhaoXiezhenReveal = {
    active: true,
    seq,
    sourceID: state.sourceID,
    targetID,
    revealedCards: revealed.map(c => ({ ...c }))
  };
};

export const simazhaoSkill = {
  moves: {
    simazhaoDangyiAdd: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '司马昭') return;
      ensureSimazhaoInit(player);
      const pending = typeof player.simazhaoDangyiPending === 'number' ? player.simazhaoDangyiPending : 0;
      player.simazhaoDangyiPending = pending + 1;
      G.actionLog.push(`司马昭 准备发动荡异（${player.simazhaoDangyiPending}）`);
    },

    simazhaoZhaoxiong: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '司马昭') return;
      ensureSimazhaoInit(player);
      player.simazhaoZhaoxiongUsed = true;
      player.simazhaoFaction = '晋';
      G.actionLog.push(`司马昭 发动昭凶，势力变更为晋`);
    },

    simazhaoXiezhenStart: ({ G, playerID, random }, targetIDs) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '司马昭') return;
      ensureSimazhaoInit(player);
      if (player.simazhaoXiezhenUsed) return;
      if (G.simazhaoXiezhen && G.simazhaoXiezhen.active) return;
      const ids = Array.isArray(targetIDs) ? targetIDs.filter(id => typeof id === 'string') : [];
      const unique = Array.from(new Set(ids));
      if (unique.length === 0) return;
      const limited = unique.slice(0, 2);
      const rng = getRng(random);

      const withHand = limited.filter(tid => Array.isArray(G.hands[tid]) && G.hands[tid].length > 0);
      if (withHand.length === 0) return;
      const movedCards = [];
      withHand.forEach(tid => {
        const hand = G.hands[tid];
        if (!Array.isArray(hand) || hand.length === 0) return;
        const idx = Math.floor(rng.Number() * hand.length);
        const card = hand.splice(idx, 1)[0];
        if (card) {
          movedCards.push(card);
          const targetName = G.players[tid]?.general?.name || `Player ${tid}`;
          G.actionLog.push(`${targetName} 将随机一张手牌置于牌堆顶（挟征）`);
        }
      });
      if (movedCards.length === 0) return;
      if (!Array.isArray(G.deck)) G.deck = [];
      for (let i = movedCards.length - 1; i >= 0; i--) {
        G.deck.unshift(movedCards[i]);
      }

      player.simazhaoXiezhenUsed = true;
      G.simazhaoXiezhen = {
        active: true,
        sourceID: playerID,
        stage: 'select_target',
        coverTargetIDs: withHand,
        coveredCards: movedCards.map(c => ({ ...c })),
        targetID: null,
        damageDealt: false
      };
    },

    simazhaoXiezhenSelectTarget: ({ G, playerID, random }, targetID) => {
      const state = G.simazhaoXiezhen;
      if (!state || !state.active || state.stage !== 'select_target') return;
      if (playerID !== state.sourceID) return;
      if (typeof targetID !== 'string') return;
      state.targetID = targetID;
      state.stage = 'reveal';
      const rng = getRng(random);
      beginXiezhenRound(G, rng);
    },

    simazhaoXiezhenResolve: ({ G, playerID }) => {
      const reveal = G.simazhaoXiezhenReveal;
      const state = G.simazhaoXiezhen;
      if (!reveal || !reveal.active || !state || !state.active) return;
      if (playerID !== state.sourceID) return;
      const cards = Array.isArray(reveal.revealedCards) ? reveal.revealedCards.map(c => ({ ...c })) : [];
      const slashes = [];
      const rest = [];
      cards.forEach(c => {
        if (c && isSlashCardName(c.name)) slashes.push(c);
        else rest.push(c);
      });
      const formatCard = (card) => {
        if (!card) return '';
        const suit = card.suit || '';
        const rank = card.rank || '';
        const name = card.name || '';
        return `${suit}${rank}${name}`.trim();
      };
      const coverLabel = Array.isArray(state.coveredCards) && state.coveredCards.length > 0
        ? state.coveredCards.map(formatCard).filter(Boolean).join('，')
        : '无';
      const slashLabel = slashes.length > 0 ? slashes.map(formatCard).filter(Boolean).join('，') : '无';
      const restLabel = rest.length > 0 ? rest.map(formatCard).filter(Boolean).join('，') : '无';
      const targetName = G.players[reveal.targetID]?.general?.name || `Player ${reveal.targetID}`;
      G.actionLog.push(`司马昭 挟征 ${coverLabel}。对${targetName} 使用了 ${slashLabel}。放回了 ${restLabel}。`);
      if (slashes.length > 0) {
        state.damageDealt = true;
      }
      if (slashes.length > 0) addCardsToDiscard(G, slashes);
      if (rest.length > 0) {
        for (let i = rest.length - 1; i >= 0; i--) {
          G.deck.unshift(rest[i]);
        }
      }
      G.simazhaoXiezhenReveal = null;

      if (!state.damageDealt) {
        G.actionLog.push(`司马昭 挟征未造成伤害`);
      }
      G.simazhaoXiezhen = null;
    },

    simazhaoQiantunStart: ({ G, playerID }, targetID) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '司马昭') return;
      ensureSimazhaoInit(player);
      if (player.simazhaoFaction !== '魏') return;
      if (G.simazhaoQiantun && G.simazhaoQiantun.active) return;
      if (typeof targetID !== 'string') return;
      const targetHand = G.hands[targetID];
      if (!Array.isArray(targetHand) || targetHand.length === 0) return;
      G.simazhaoQiantun = {
        active: true,
        stage: 'reveal',
        sourceID: playerID,
        targetID,
        revealedCardIds: []
      };
      const sourceName = player.general?.name || `Player ${playerID}`;
      const targetName = G.players[targetID]?.general?.name || `Player ${targetID}`;
      G.actionLog.push(`${sourceName} 对 ${targetName} 发动谦吞，等待其展示手牌`);
    },

    simazhaoQiantunConfirmReveal: ({ G, playerID }, selected) => {
      const q = G.simazhaoQiantun;
      if (!q || !q.active || q.stage !== 'reveal') return;
      if (playerID !== q.targetID) return;
      const targetHand = G.hands[playerID];
      if (!Array.isArray(targetHand) || targetHand.length === 0) return;
      const picks = Array.isArray(selected) ? selected.filter(s => s && s.type === 'hand' && typeof s.index === 'number') : [];
      if (picks.length === 0) return;
      const pickedIds = Array.from(new Set(picks.map(p => targetHand[p.index]).filter(Boolean).map(c => c.id))).filter(Boolean);
      if (pickedIds.length === 0) return;

      q.revealedCardIds = pickedIds;
      q.stage = 'show';
      const revealedCards = targetHand.filter(c => c && pickedIds.includes(c.id)).map(c => ({ ...c }));
      const seq = typeof G.simazhaoSeq === 'number' ? G.simazhaoSeq + 1 : 1;
      G.simazhaoSeq = seq;
      q.show = {
        seq,
        revealedCards,
        revealedCount: revealedCards.length,
        hiddenCount: Math.max(0, targetHand.length - revealedCards.length),
        acknowledged: {}
      };
      const targetName = G.players[q.targetID]?.general?.name || `Player ${q.targetID}`;
      const formatCard = (card) => {
        if (!card) return '';
        const suit = card.suit || '';
        const rank = card.rank || '';
        const name = card.name || '';
        return `${suit}${rank}${name}`.trim();
      };
      const revealedLabel = revealedCards.map(formatCard).filter(Boolean).join('，');
      const hiddenCount = Math.max(0, targetHand.length - revealedCards.length);
      G.actionLog.push(`${targetName} 展示了${revealedCards.length}张手牌（共${targetHand.length}张）：${revealedLabel}。未展示${hiddenCount}张牌。`);
    },

    simazhaoQiantunAcknowledge: ({ G, playerID }) => {
      const q = G.simazhaoQiantun;
      if (!q || !q.active || q.stage !== 'show' || !q.show) return;
      q.show.acknowledged[playerID] = true;
      const all = Object.keys(G.players || {}).every(id => q.show.acknowledged[id]);
      if (!all) return;
      q.stage = 'pindian';
      q.show = null;
      G.pindian = {
        active: true,
        sourcePlayerID: q.sourceID,
        targetPlayerID: q.targetID,
        sourceCard: null,
        targetCard: null,
        skillName: '谦吞',
        targetAllowedCardIds: q.revealedCardIds
      };
      const targetName = G.players[q.targetID]?.general?.name || `Player ${q.targetID}`;
      G.actionLog.push(`司马昭 对 ${targetName} 发起拼点（谦吞）`);
    },

    simazhaoQiantunCancel: ({ G, playerID }) => {
      const q = G.simazhaoQiantun;
      if (!q || !q.active) return;
      if (playerID !== q.sourceID && playerID !== q.targetID) return;
      if (q.stage === 'show') return;
      if (G.pindian && G.pindian.active && G.pindian.skillName === '谦吞') return;
      G.simazhaoQiantun = null;
    },

    simazhaoShowHandClose: ({ G, playerID }) => {
      if (!G.simazhaoShowHand || !G.simazhaoShowHand.active) return;
      if (playerID !== G.simazhaoShowHand.sourceID) return;
      G.simazhaoShowHand = null;
    },

    simazhaoWeisiStart: ({ G, playerID }, targetID) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '司马昭') return;
      ensureSimazhaoInit(player);
      if (typeof targetID !== 'string') return;
      const targetHand = G.hands[targetID];
      if (!Array.isArray(targetHand)) return;
      if (G.simazhaoWeisi && G.simazhaoWeisi.active) return;
      G.simazhaoWeisi = {
        active: true,
        stage: targetHand.length === 0 ? 'decision' : 'lock',
        sourceID: playerID,
        targetID,
        lockedCards: []
      };
      const targetName = G.players[targetID]?.general?.name || `Player ${targetID}`;
      if (targetHand.length === 0) {
        G.actionLog.push(`${targetName} 无手牌可扣置（威肆）`);
      } else {
        G.actionLog.push(`司马昭 对 ${targetName} 发动威肆，等待其扣置手牌`);
      }
    },

    simazhaoWeisiConfirmLock: ({ G, playerID }, selected) => {
      const w = G.simazhaoWeisi;
      if (!w || !w.active || w.stage !== 'lock') return;
      if (playerID !== w.targetID) return;
      const targetHand = G.hands[playerID];
      if (!Array.isArray(targetHand) || targetHand.length === 0) {
        w.stage = 'decision';
        return;
      }
      const picks = Array.isArray(selected) ? selected.filter(s => s && s.type === 'hand' && typeof s.index === 'number') : [];
      const indices = Array.from(new Set(picks.map(p => p.index))).filter(i => i >= 0 && i < targetHand.length).sort((a, b) => b - a);
      const locked = [];
      indices.forEach(i => {
        const c = targetHand.splice(i, 1)[0];
        if (c) locked.push(c);
      });
      w.lockedCards = locked;
      w.stage = 'decision';
      const targetName = G.players[playerID]?.general?.name || `Player ${playerID}`;
      G.actionLog.push(`${targetName} 扣置了${locked.length}张手牌（威肆）`);
    },

    simazhaoWeisiGet: ({ G, playerID, random }) => {
      const w = G.simazhaoWeisi;
      if (!w || !w.active || w.stage !== 'decision') return;
      if (playerID !== w.sourceID) return;
      const rng = getRng(random);
      const targetName = G.players[w.targetID]?.general?.name || `Player ${w.targetID}`;
      applySimazhaoDamage(G, rng, w.sourceID, w.targetID, 1, '威肆');
      const gained = takeRandomHandCard(G, rng, w.targetID);
      if (gained) {
        addCardsToHand(G, w.sourceID, gained);
        G.actionLog.push(`司马昭 获得了 ${targetName} 的一张手牌（威肆）`);
      } else {
        G.actionLog.push(`${targetName} 无手牌可被获得（威肆）`);
      }
      if (Array.isArray(w.lockedCards) && w.lockedCards.length > 0) {
        addCardsToHand(G, w.targetID, w.lockedCards);
      }
      G.simazhaoWeisi = null;
    },

    simazhaoWeisiCancel: ({ G, playerID }) => {
      const w = G.simazhaoWeisi;
      if (!w || !w.active || w.stage !== 'decision') return;
      if (playerID !== w.sourceID) return;
      if (Array.isArray(w.lockedCards) && w.lockedCards.length > 0) {
        addCardsToHand(G, w.targetID, w.lockedCards);
      }
      G.simazhaoWeisi = null;
    }
  }
};

export const simazhaoInternal = {
  ensureSimazhaoInit
};
