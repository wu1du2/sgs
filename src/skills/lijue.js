const applyDamage = (target, damage) => {
  let remaining = damage;
  if (target.armor > 0 && remaining > 0) {
    if (target.armor >= remaining) {
      target.armor -= remaining;
      remaining = 0;
    } else {
      remaining -= target.armor;
      target.armor = 0;
    }
  }
  if (remaining > 0) {
    target.hp = Math.max(target.hp - remaining, 0);
  }
};

export const lijueSkill = {
  moves: {
    lijueLangXi: ({ G, ctx, playerID }, targetID) => {
      const source = G.players[playerID];
      const target = G.players[targetID];
      if (!source || !target) return;
      if (!source.general || source.general.name !== '李傕') return;
      if (targetID === playerID) return;
      if (typeof source.hp !== 'number' || typeof target.hp !== 'number') return;
      if (target.hp > source.hp) return;

      const damage = Math.floor((ctx.random ? ctx.random.Number() : Math.random()) * 3);
      const sourceName = source.general ? source.general.name : `Player ${playerID}`;
      const targetName = target.general ? target.general.name : `Player ${targetID}`;

      if (damage > 0) {
        applyDamage(target, damage);
      }
      G.actionLog.push(`${sourceName} 发动狼袭，对 ${targetName} 造成 ${damage} 点伤害`);
    },

    lijueYiSuan: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '李傕') return;
      if (!player.yiSuanLastTrickCardId) return;
      if (player.hpMax <= 1) return;

      const idx = G.discardPile.findIndex(c => c && c.id === player.yiSuanLastTrickCardId);
      if (idx === -1) {
        player.yiSuanLastTrickCardId = null;
        return;
      }
      const card = G.discardPile[idx];
      if (!card || card.type !== '锦囊') {
        player.yiSuanLastTrickCardId = null;
        return;
      }

      G.discardPile.splice(idx, 1);
      G.hands[playerID].push(card);

      player.hpMax -= 1;
      if (player.hp > player.hpMax) {
        player.hp = player.hpMax;
      }

      player.yiSuanLastTrickCardId = null;

      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 发动亦算，获得 ${card.suit}${card.rank} ${card.name}，体力上限-1`);
    }
  }
};

