import { addCardsToDiscard, addCardsToHand } from './cardUtils.js';

export const liuyanSkill = {
    limu: {
        name: "立牧",
        description: "出牌阶段，你可以将一张方块牌当【乐不思蜀】对自己使用，然后回复1点体力；你的判定区有牌时，你对攻击范围内的其他角色使用牌没有次数和距离限制。",
    },
    moves: {
        liuyanLimuStart: ({ G, playerID }) => {
            const player = G.players[playerID];
            if (!player || !player.general || player.general.name !== '刘焉') return;
            if (player.judges.le) {
                G.actionLog.push('判定区已有【乐不思蜀】，无法发动【立牧】');
                return;
            }
            G.liuyanLimuSelect = {
                active: true,
                stage: 'select_card',
                playerID: playerID,
                selectedCard: null
            };
            G.actionLog.push('请选择一张方块牌当【乐不思蜀】');
        },
        liuyanLimuSelectCard: ({ G, playerID }, selected) => {
            const s = G.liuyanLimuSelect;
            if (!s || !s.active || s.playerID !== playerID || s.stage !== 'select_card') return;
            const hand = G.hands[playerID];
            const player = G.players[playerID];
            
            if (selected.type === 'hand') {
                const card = hand[selected.index];
                if (card && card.suit === '♦') { // 'Diamond' or '方块'? Check data. Usually English suit names.
                    // Check suit names in Game.js/sgs_data.js. 'Diamond' usually.
                    s.selectedCard = { type: 'hand', index: selected.index };
                } else {
                    G.actionLog.push('请选择方块牌');
                }
            } else if (selected.type === 'equip') {
                const card = player.equipments[selected.slot];
                if (card && card.suit === '♦') {
                    s.selectedCard = { type: 'equip', slot: selected.slot };
                } else {
                    G.actionLog.push('请选择方块牌');
                }
            }
        },
        liuyanLimuConfirm: ({ G, playerID }, selection) => {
            const s = G.liuyanLimuSelect;
            if (!s || !s.active || s.playerID !== playerID) return;
            
            const hand = G.hands[playerID];
            const player = G.players[playerID];
            let card = null;
            let finalSelection = s.selectedCard;

            // If selection is provided directly (from Board.jsx), use it
            if (selection) {
                const sourceType = selection.type || selection.source;
                if (sourceType === 'hand') {
                    const c = hand[selection.index];
                    if (c && (c.suit === '♦')) {
                        finalSelection = { type: 'hand', index: selection.index };
                    }
                } else if (sourceType === 'equip') {
                    const c = player.equipments[selection.slot];
                    if (c && (c.suit === '♦')) {
                        finalSelection = { type: 'equip', slot: selection.slot };
                    }
                }
            }
            
            if (!finalSelection) {
                G.actionLog.push('请选择方块牌');
                return;
            }
            
            if (finalSelection.type === 'hand') {
                card = hand.splice(finalSelection.index, 1)[0];
            } else {
                card = player.equipments[finalSelection.slot];
                player.equipments[finalSelection.slot] = null;
            }
            
            if (!card) return;
            
            // Transform to Indulgence
            card.name = '乐不思蜀';
            card.type = '乐';
            
            player.judges.le = card;
            G.actionLog.push(`刘焉 将 ${card.suit}${card.rank} 当【乐不思蜀】置于判定区`);
            
            // Recover 1 HP
            if (player.hp < player.hpMax) {
                player.hp += 1;
                G.actionLog.push('刘焉 回复1点体力');
            }
            
            G.liuyanLimuSelect = null;
        },
        liuyanLimuCancel: ({ G, playerID }) => {
            if (G.liuyanLimuSelect && G.liuyanLimuSelect.playerID === playerID) {
                G.liuyanLimuSelect = null;
            }
        }
    }
};
