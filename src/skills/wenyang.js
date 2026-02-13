export const wenyangSkill = {
  useQueDi: ({ G, playerID }, drawCards) => {
    const player = G.players[playerID];
    if (player && player.hp !== undefined) {
      // 却敌：体力上限-1
      player.hpMax -= 1;
      // 确保当前体力不超过新的上限
      if (player.hp > player.hpMax) {
        player.hp = player.hpMax;
      }
      
      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 使用了【却敌】，减少了1点体力上限`);
    }
  },
  
  useChouJue: ({ G, playerID }, drawCards) => {
    const player = G.players[playerID];
    if (player && player.hp !== undefined) {
      // 仇决：体力上限+1，摸两张牌
      player.hpMax += 1;
      // 确保当前体力不超过新的上限
      if (player.hp > player.hpMax) {
        player.hp = player.hpMax;
      }
      
      if (drawCards) {
        drawCards(G, playerID, 2);
      }
      
      const playerName = player.general ? player.general.name : `Player ${playerID}`;
      G.actionLog.push(`${playerName} 使用了【仇决】，增加了1点体力上限并摸了两张牌`);
    }
  },

  useZhuiFeng: ({ G, playerID }, targetID) => {
    // 椎锋: Click a player, then execute a "Snatch" that allows choosing any number of cards.
    G.selectCard = {
      active: true,
      sourcePlayerID: playerID,
      targetPlayerID: targetID,
      actionType: 'steal',
      pendingCard: { name: '椎锋' }, // Special name to bypass single selection limit
    };
    
    const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
    const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
    G.actionLog.push(`${playerName} 使用了【椎锋】，指定 ${targetName} 为目标`);
  },

  useChongJian: ({ G, playerID }, targetID) => {
    // 冲坚: Click a player, then execute a "Snatch" that allows choosing any number of cards.
    G.selectCard = {
      active: true,
      sourcePlayerID: playerID,
      targetPlayerID: targetID,
      actionType: 'steal',
      pendingCard: { name: '冲坚' }, // Special name to bypass single selection limit
    };
    
    const playerName = G.players[playerID].general ? G.players[playerID].general.name : `Player ${playerID}`;
    const targetName = G.players[targetID].general ? G.players[targetID].general.name : `Player ${targetID}`;
    G.actionLog.push(`${playerName} 使用了【冲坚】，指定 ${targetName} 为目标`);
  }
};