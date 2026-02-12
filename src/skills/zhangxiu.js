export const zhangxiuSkill = {
  congjian: {
    name: "从谏",
    description: "点击后，选择唯一目标武将A，点击确定或者取消。点击确定后，进入选牌框，展示张绣的所有手牌和装备区的牌。点击一张牌，选择确定或者取消。点击确定后，这张牌移动到武将A的手牌中。",
    
    // Action to initiate the skill
    action: ({ G, playerID }) => {
      G.congjianSelect.active = true;
      G.congjianSelect.stage = 'target_selection';
      G.congjianSelect.sourcePlayerID = playerID;
      G.congjianSelect.targetPlayerID = null;
      G.congjianSelect.selectedCard = null;
    }
  }
};
