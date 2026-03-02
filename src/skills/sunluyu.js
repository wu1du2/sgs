export const sunluyuSkill = {
  moves: {
    sunluyuMumuStart: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (!player || !player.general || player.general.name !== '孙鲁育') return;
      if (G.sunluyuMumu && G.sunluyuMumu.active) return;
      
      G.sunluyuMumu = {
        active: true,
        stage: 'select_target',
        sourcePlayerID: playerID,
        targetPlayerID: null,
        selectedCard: null
      };
    },

    sunluyuMumuSelectTarget: ({ G, playerID }, targetPlayerID) => {
      const m = G.sunluyuMumu;
      if (!m || !m.active || m.sourcePlayerID !== playerID || m.stage !== 'select_target') return;
      if (targetPlayerID === playerID) return;
      
      const target = G.players[targetPlayerID];
      if (!target || !target.equipments) return;
      
      const hasEquip = Object.values(target.equipments).some(Boolean);
      if (!hasEquip) return;
      
      m.targetPlayerID = targetPlayerID;
      m.stage = 'select_card';
    },

    sunluyuMumuSelectCard: ({ G, playerID }, cardInfo) => {
      const m = G.sunluyuMumu;
      if (!m || !m.active || m.sourcePlayerID !== playerID || m.stage !== 'select_card') return;
      
      const targetID = m.targetPlayerID;
      if (!targetID) return;
      
      const target = G.players[targetID];
      if (!target || !target.equipments) return;
      
      const { slot } = cardInfo;
      const card = target.equipments[slot];
      if (!card) return;
      
      m.selectedCard = { slot, card };
    },

    sunluyuMumuDiscard: ({ G, playerID }) => {
      const m = G.sunluyuMumu;
      if (!m || !m.active || m.sourcePlayerID !== playerID || m.stage !== 'select_card') return;
      if (!m.selectedCard || !m.targetPlayerID) return;
      
      const targetID = m.targetPlayerID;
      const target = G.players[targetID];
      const { slot, card } = m.selectedCard;
      
      if (!target.equipments[slot]) return;
      
      target.equipments[slot] = null;
      if (!Array.isArray(G.discardPile)) G.discardPile = [];
      G.discardPile.push(card);
      
      const sourceName = G.players[playerID].general.name;
      const targetName = target.general ? target.general.name : `Player ${targetID}`;
      G.actionLog.push(`${sourceName} 发动穆穆，弃置了 ${targetName} 的 ${card.name}`);
      
      G.sunluyuMumu = null;
    },

    sunluyuMumuGain: ({ G, playerID }) => {
      const m = G.sunluyuMumu;
      if (!m || !m.active || m.sourcePlayerID !== playerID || m.stage !== 'select_card') return;
      if (!m.selectedCard || !m.targetPlayerID) return;
      
      const { slot, card } = m.selectedCard;
      if (card.type !== '防具') return;
      
      const targetID = m.targetPlayerID;
      const target = G.players[targetID];
      const source = G.players[playerID];
      
      if (!target.equipments[slot]) return;
      
      target.equipments[slot] = null;
      
      if (!source.equipments) source.equipments = { weapon: null, armor: null, plusOne: null, minusOne: null };
      
      if (source.equipments.armor) {
        if (!Array.isArray(G.discardPile)) G.discardPile = [];
        G.discardPile.push(source.equipments.armor);
      }
      
      source.equipments.armor = card;
      source.mumuCannotUseSha = true;
      
      const sourceName = source.general.name;
      const targetName = target.general ? target.general.name : `Player ${targetID}`;
      G.actionLog.push(`${sourceName} 发动穆穆，获得了 ${targetName} 的 ${card.name}，本回合不能使用或打出杀`);
      
      G.sunluyuMumu = null;
    },

    sunluyuMumuCancel: ({ G, playerID }) => {
      const m = G.sunluyuMumu;
      if (!m || !m.active || m.sourcePlayerID !== playerID) return;
      G.sunluyuMumu = null;
    }
  }
};
