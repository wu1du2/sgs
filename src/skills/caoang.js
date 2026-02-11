export const caoangSkill = {
  kangkai: {
    name: "慷忾",
    activate: ({ G, playerID }) => {
      G.kangkaiSelect = {
        active: true,
        sourcePlayerID: playerID,
        targetPlayerID: null,
        stage: 'target_selection'
      };
    },
    confirmTarget: ({ G, playerID }, targetID) => {
      if (!G.kangkaiSelect || !G.kangkaiSelect.active) return;
      if (G.kangkaiSelect.sourcePlayerID !== playerID) return;
      G.kangkaiSelect = {
        active: true,
        sourcePlayerID: playerID,
        targetPlayerID: targetID,
        stage: 'card_selection'
      };
    },
    confirmCard: ({ G, playerID }, selection) => {
      if (!G.kangkaiSelect || !G.kangkaiSelect.active) return;
      if (G.kangkaiSelect.sourcePlayerID !== playerID) return;
      if (G.kangkaiSelect.stage !== 'card_selection') return;

      const targetID = G.kangkaiSelect.targetPlayerID;
      if (!targetID) return;

      let movedCard = null;
      if (selection?.type === 'hand') {
        const hand = G.hands[playerID];
        if (selection.index >= 0 && selection.index < hand.length) {
          movedCard = hand.splice(selection.index, 1)[0];
        }
      } else if (selection?.type === 'equip') {
        const slot = selection.slot;
        const card = G.players[playerID].equipments[slot];
        if (card) {
          movedCard = card;
          G.players[playerID].equipments[slot] = null;
        }
      }

      if (movedCard) {
        G.hands[targetID].push(movedCard);
        const sourceName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
        const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
        G.actionLog.push(`${sourceName} used 慷忾 to give a card to ${targetName}`);
      }

      G.kangkaiSelect = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        stage: null
      };
    },
    cancel: ({ G, playerID }) => {
      if (!G.kangkaiSelect || !G.kangkaiSelect.active) return;
      if (G.kangkaiSelect.sourcePlayerID !== playerID) return;
      G.kangkaiSelect = {
        active: false,
        sourcePlayerID: null,
        targetPlayerID: null,
        stage: null
      };
    }
  }
};
