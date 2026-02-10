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
  }
};