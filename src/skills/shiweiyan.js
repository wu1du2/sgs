export const shiweiyanSkill = {
  confirmZhuangShi: ({ G, playerID }, x, y) => {
    const player = G.players[playerID];
    const playerName = player.general ? player.general.name : `Player ${playerID}`;
    
    G.actionLog.push(`${playerName} 势魏延 无距离限制&不可被响应 ${x} 不计入次数 ${y}`);
  }
};