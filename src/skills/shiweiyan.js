export const shiweiyanSkill = {
  confirmZhuangShi: ({ G, playerID }, x, y) => {
    const player = G.players[playerID];
    const playerName = player.general ? player.general.name : `Player ${playerID}`;
    
    G.actionLog.push(`${playerName} 势魏延 无距离限制&不可被响应 ${x} 不计入次数 ${y}`);
  },
  startYinZhan: ({ G, playerID }, targetID) => {
    const player = G.players[playerID];
    if (!player || !player.general || player.general.name !== '势魏延') return;
    if (!G.players[targetID]) return;
    if (G.selectCard && G.selectCard.active) return;
    G.selectCard = {
      active: true,
      sourcePlayerID: playerID,
      targetPlayerID: targetID,
      actionType: 'discard',
      pendingCard: { name: '饮战' }
    };
  }
};
