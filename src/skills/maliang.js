
export const maliangSkill = {
  transfer: {
    start: ({ G, playerID }) => {
      if (G.maliang.cheeringPile.length === 0) return;
      G.maliang.status = 'selecting_transfer_target';
      G.maliang.sourcePlayerID = playerID;
    },
    confirm: ({ G }, targetID) => {
      if (G.maliang.status !== 'selecting_transfer_target') return;
      
      const cards = [...G.maliang.cheeringPile];
      if (cards.length === 0) return;

      // Move to target hand
      if (!G.hands[targetID]) G.hands[targetID] = [];
      G.hands[targetID].push(...cards);
      
      // Log
      const sourceName = G.players[G.maliang.sourcePlayerID] && G.players[G.maliang.sourcePlayerID].general ? G.players[G.maliang.sourcePlayerID].general.name : 'Ma Liang';
      const targetName = G.players[targetID] && G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
      G.actionLog.push(`${sourceName} transferred ${cards.length} cards to ${targetName} from Cheering Area`);

      // Clear area
      G.maliang.cheeringPile = [];
      G.maliang.status = 'idle';
      G.maliang.sourcePlayerID = null;
    },
    cancel: ({ G }) => {
      G.maliang.status = 'idle';
      G.maliang.sourcePlayerID = null;
    }
  },
  discard: ({ G, playerID }) => {
    if (G.maliang.cheeringPile.length === 0) return;
    
    const cards = [...G.maliang.cheeringPile];
    G.discardPile.push(...cards);
    
    const sourceName = G.players[playerID] && G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
    G.actionLog.push(`${sourceName} discarded ${cards.length} cards from Cheering Area`);

    G.maliang.cheeringPile = [];
  }
};
