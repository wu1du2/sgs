export const xizhicaiSkill = {
    chouce: {
        description: "筹策：点击筹策后，可以点击一名武将，点击确定或者取消。确定后，展示这名武将的手牌（背面向上）和装备和判定区。选择一张，点击确定。这张牌移动到弃牌堆，log记录。",
    },
    tiandu: {
        name: "天妒",
        description: "天妒：点击天妒后，检测弃牌堆顶的牌。若存在，弹窗显示该牌信息（花色、点数、牌名），询问是否获得。确认后将该牌置入戏志才手牌。",
        canActivate: (G) => {
            return G.discardPile.length > 0;
        },
        getLastDiscardedCard: (G) => {
            if (G.discardPile.length === 0) return null;
            return G.discardPile[G.discardPile.length - 1];
        }
    }
};
