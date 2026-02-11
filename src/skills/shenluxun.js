export const shenluxunSkill = {
  junlue: {
    name: "军略",
    getDisplayName: (count) => {
      const value = typeof count === 'number' ? count : 0;
      return `军略${value}`;
    },
    add: ({ G, playerID }) => {
      const player = G.players[playerID];
      if (typeof player.junlueCount !== 'number') {
        player.junlueCount = 0;
      }
      player.junlueCount += 1;
    },
    reset: ({ G, playerID }) => {
      const player = G.players[playerID];
      player.junlueCount = 0;
    }
  }
};
