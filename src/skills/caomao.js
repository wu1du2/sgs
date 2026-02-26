import { addCardsToDiscard, addCardsToHand, clampArmor } from './cardUtils.js';

const clampDaoXin = (value) => {
  const n = typeof value === 'number' ? value : 0;
  if (n < 0) return 0;
  if (n > 99) return 99;
  return n;
};

const ensureGrantedSkills = (player) => {
  if (!player.grantedSkills || !Array.isArray(player.grantedSkills)) {
    player.grantedSkills = [];
  }
  return player.grantedSkills;
};

const grantSkillIfMissing = (player, skillName) => {
  const list = ensureGrantedSkills(player);
  if (!list.includes(skillName)) {
    list.push(skillName);
  }
};

const checkUnlocks = (player) => {
  const d = clampDaoXin(player.daoxin);
  player.daoxin = d;
  if (d >= 25) grantSkillIfMissing(player, '清正');
  if (d >= 50) grantSkillIfMissing(player, '酒诗');
  if (d >= 75) grantSkillIfMissing(player, '放逐');
  if (d >= 99) grantSkillIfMissing(player, '决进');
};

const addDaoXin = (G, playerID, amount, reason) => {
  const player = G.players[playerID];
  if (!player || !player.general || player.general.name !== '曹髦') return;
  const before = clampDaoXin(player.daoxin);
  const after = clampDaoXin(before + amount);
  player.daoxin = after;
  checkUnlocks(player);
  const playerName = player.general ? player.general.name : `Player ${playerID}`;
  const delta = after - before;
  if (delta !== 0) {
    G.actionLog.push(`${playerName} 道心${delta > 0 ? '+' : ''}${delta}${reason ? `（${reason}）` : ''}，当前${after}/99`);
  }
};

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

const gainTrickLikeRangjie = (G, rng, playerID) => {
  G.deck = shuffle(G.deck, rng);
  const delayedScrolls = ['乐不思蜀', '兵粮寸断', '闪电'];
  const idx = G.deck.findIndex(c => c && c.type === '锦囊' && !delayedScrolls.includes(c.name));
  const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
  if (idx === -1) {
    G.actionLog.push(`${playerName} 未能获得锦囊牌（牌堆无可用锦囊）`);
    return;
  }
  const card = G.deck.splice(idx, 1)[0];
  if (!card) return;
  addCardsToHand(G, playerID, card);
  G.actionLog.push(`${playerName} 获得了一张锦囊牌`);
};

const applyDamage = (G, rng, sourceID, targetID, amount, opts) => {
  const target = G.players[targetID];
  if (!target) return { armorUsed: 0, hpLost: 0 };
  const beforeArmor = typeof target.armor === 'number' ? target.armor : 0;
  const beforeHp = typeof target.hp === 'number' ? target.hp : 0;
  let remaining = amount;
  if (beforeArmor > 0 && remaining > 0) {
    if (beforeArmor >= remaining) {
      target.armor = beforeArmor - remaining;
      remaining = 0;
    } else {
      target.armor = 0;
      remaining -= beforeArmor;
    }
  }
  clampArmor(target);
  if (remaining > 0) {
    target.hp = Math.max(beforeHp - remaining, 0);
  }
  const afterHp = typeof target.hp === 'number' ? target.hp : 0;
  const afterArmor = typeof target.armor === 'number' ? target.armor : 0;
  const hpLost = Math.max(0, beforeHp - afterHp);
  const armorUsed = Math.max(0, beforeArmor - afterArmor);
  if (hpLost > 0 && target.general && target.general.name === '曹髦') {
    addDaoXin(G, targetID, hpLost * 10, '受伤');
    if (target.is_turned_over) {
      target.is_turned_over = false;
      gainTrickLikeRangjie(G, rng, targetID);
      G.actionLog.push(`${target.general.name} 受到伤害后翻回正面`);
    }
  }
  if (opts && opts.skillName === '清正') {
    if (hpLost > 0 || armorUsed > 0) {
      addDaoXin(G, sourceID, 15, '清正造成伤害');
    }
  }
  return { armorUsed, hpLost };
};

export const caomaoSkill = {
  moves: {
    caomaoAddDaoxin: ({ G, playerID }, amount) => {
      const a = Number(amount);
      if (![5, 15].includes(a)) return;
      addDaoXin(G, playerID, a, a === 5 ? '获得牌' : '造成伤害');
    },

    caomaoJiuPoemActivate: ({ G, playerID, random }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹髦') return;
      if ((player.daoxin || 0) < 50) return;
      player.is_turned_over = !player.is_turned_over;
      player.jiuAnimKey = (typeof player.jiuAnimKey === 'number' ? player.jiuAnimKey : 0) + 1;
      if (player.is_turned_over) {
        G.actionLog.push(`${player.general.name} 发动酒诗并翻面`);
      } else {
        G.actionLog.push(`${player.general.name} 再次发动酒诗并翻回`);
      }
      const rng = getRng(random);
      gainTrickLikeRangjie(G, rng, playerID);
    },

    caomaoQingzhengStart: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹髦') return;
      if ((player.daoxin || 0) < 25) return;
      if (G.caomaoQingzheng && G.caomaoQingzheng.active) return;
      if (!Array.isArray(G.hands[playerID]) || G.hands[playerID].length === 0) return;
      G.caomaoQingzheng = {
        active: true,
        stage: 'select_suit_self',
        sourceID: playerID,
        selectedSuit: null,
        targetID: null,
        targetSuit: null,
        sourceDiscardCount: 0,
        targetDiscardCount: 0
      };
    },

    caomaoQingzhengSelectSuitSelf: ({ G, playerID }, suit) => {
      const q = G.caomaoQingzheng;
      if (!q || !q.active || q.sourceID !== playerID || q.stage !== 'select_suit_self') return;
      const hand = G.hands[playerID];
      if (!Array.isArray(hand) || hand.length === 0) return;
      const toDiscard = [];
      for (let i = hand.length - 1; i >= 0; i--) {
        const c = hand[i];
        if (c && c.suit === suit) {
          toDiscard.push(hand.splice(i, 1)[0]);
        }
      }
      if (toDiscard.length === 0) return;
      addCardsToDiscard(G, toDiscard);
      q.selectedSuit = suit;
      q.sourceDiscardCount = toDiscard.length;
      q.stage = 'select_target';
      G.actionLog.push(`曹髦 清正：弃置${toDiscard.length}张${suit}牌`);
    },

    caomaoQingzhengSelectTarget: ({ G, playerID }, targetID) => {
      const q = G.caomaoQingzheng;
      if (!q || !q.active || q.sourceID !== playerID || q.stage !== 'select_target') return;
      if (targetID === playerID) return;
      const targetHand = G.hands[targetID];
      if (!Array.isArray(targetHand) || targetHand.length === 0) return;
      q.targetID = targetID;
      q.stage = 'select_suit_target';
    },

    caomaoQingzhengSelectSuitTarget: ({ G, playerID, random }, suit) => {
      const q = G.caomaoQingzheng;
      if (!q || !q.active || q.sourceID !== playerID || q.stage !== 'select_suit_target') return;
      const targetID = q.targetID;
      if (typeof targetID !== 'string') return;
      const targetHand = G.hands[targetID];
      if (!Array.isArray(targetHand) || targetHand.length === 0) return;
      const toDiscard = [];
      for (let i = targetHand.length - 1; i >= 0; i--) {
        const c = targetHand[i];
        if (c && c.suit === suit) {
          toDiscard.push(targetHand.splice(i, 1)[0]);
        }
      }
      addCardsToDiscard(G, toDiscard);
      q.targetSuit = suit;
      q.targetDiscardCount = toDiscard.length;
      const targetName = G.players[targetID] && G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
      G.actionLog.push(`曹髦 清正：令${targetName}弃置${toDiscard.length}张${suit}牌`);
      if (q.targetDiscardCount < q.sourceDiscardCount) {
        const rng = getRng(random);
        applyDamage(G, rng, playerID, targetID, 1, { skillName: '清正' });
        G.actionLog.push(`曹髦 清正：对${targetName}造成1点伤害`);
      }
      G.caomaoQingzheng = null;
    },

    caomaoQingzhengCancel: ({ G, playerID }) => {
      const q = G.caomaoQingzheng;
      if (!q || !q.active || q.sourceID !== playerID) return;
      G.caomaoQingzheng = null;
    },

    caomaoFangzhuStart: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹髦') return;
      if ((player.daoxin || 0) < 75) return;
      if (player.caomaoFangzhuUsed) return;
      player.caomaoFangzhuUsed = true;
      G.caomaoFangzhu = {
        active: true,
        stage: 'select_target',
        sourceID: playerID,
        targetID: null,
        option: null
      };
    },

    caomaoFangzhuSelectTarget: ({ G, playerID }, targetID) => {
      const f = G.caomaoFangzhu;
      if (!f || !f.active || f.sourceID !== playerID || f.stage !== 'select_target') return;
      if (targetID === playerID) return;
      const source = G.players[playerID];
      if (source && source.caomaoFangzhuLastTarget && source.caomaoFangzhuLastTarget === targetID) return;
      f.targetID = targetID;
      f.stage = 'select_option';
    },

    caomaoFangzhuSelectOption: ({ G, playerID }, option) => {
      const f = G.caomaoFangzhu;
      if (!f || !f.active || f.sourceID !== playerID || f.stage !== 'select_option') return;
      if (!['disable_skills', 'forbid_nontrick_hand'].includes(option)) return;
      const targetID = f.targetID;
      if (typeof targetID !== 'string') return;
      const targetName = G.players[targetID] && G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
      const optText = option === 'disable_skills' ? '技能失效直到其下回合结束' : '不能使用除锦囊牌以外的手牌直到其下回合结束';
      G.actionLog.push(`曹髦 对 ${targetName} 发动放逐：${optText}`);
      const player = G.players[playerID];
      if (player) player.caomaoFangzhuLastTarget = targetID;
      G.caomaoFangzhu = null;
    },

    caomaoFangzhuCancel: ({ G, playerID }) => {
      const f = G.caomaoFangzhu;
      if (!f || !f.active || f.sourceID !== playerID) return;
      const player = G.players[playerID];
      if (player) player.caomaoFangzhuUsed = false;
      G.caomaoFangzhu = null;
    },

    caomaoJuejinStart: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '曹髦') return;
      if ((player.daoxin || 0) < 99) return;
      if (player.caomaoJuejinUsed) return;
      if (G.pendingEffect && G.pendingEffect.active) return;
      G.pendingEffect = {
        active: true,
        sourcePlayerID: playerID,
        targetPlayerID: null,
        actionType: 'caomao_juejin',
        pendingCard: { name: '决进' }
      };
    }
  }
};

export const caomaoInternal = {
  addDaoXin,
  checkUnlocks,
  gainTrickLikeRangjie
};
