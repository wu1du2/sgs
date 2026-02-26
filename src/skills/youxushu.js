import { addCardsToDiscard, addCardsToHand } from './cardUtils.js';

const shuffle = (array, rng) => {
  if (!rng || typeof rng.Number !== 'function') {
    throw new Error('random is required');
  }
  let currentIndex = array.length;
  let randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(rng.Number() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export const youxushuSkill = {
    moves: {
        youxushuXiaXing: ({ G, playerID }) => {
            const player = G.players[playerID];
            
            // Search for "玄剑" (Xuan Jian) in discard pile
            const xuanJianIndex = G.discardPile.findIndex(c => c.name === '玄剑');
            let xuanJianCard;

            if (xuanJianIndex !== -1) {
                // Found in discard pile
                xuanJianCard = G.discardPile[xuanJianIndex];
                G.discardPile.splice(xuanJianIndex, 1);
            } else {
                // Not found, generate it
                // "玄剑黑桃A"
                xuanJianCard = {
                    suit: '♠',
                    rank: 'A',
                    name: '玄剑',
                    type: '武器',
                    id: `generated-xuanjian-${Date.now()}`
                };
            }

            // Put into weapon slot
            const oldWeapon = player.equipments.weapon;
            if (oldWeapon) {
                addCardsToDiscard(G, [oldWeapon]);
            }
            player.equipments.weapon = xuanJianCard;
            
            const playerName = player.general ? player.general.name : `Player ${playerID}`;
            G.actionLog.push(`${playerName} 触发侠行，装备了玄剑`);
        },

        youxushuQiHuiClick: ({ G, playerID }, button) => {
            const player = G.players[playerID];
            
            // Initialize state if not exists
            if (!player.qiHui) {
                player.qiHui = {
                    litButtons: [],
                    stage: 'lighting', // 'lighting', 'selecting_option'
                    selectedOption: null
                };
            }

            const { qiHui } = player;

            if (qiHui.stage === 'dimming') {
              qiHui.stage = 'selecting_option';
            }

            const toggle = () => {
              if (qiHui.litButtons.includes(button)) {
                qiHui.litButtons = qiHui.litButtons.filter(b => b !== button);
              } else {
                qiHui.litButtons.push(button);
              }
            };

            if (qiHui.stage === 'lighting') {
              toggle();

              const allButtons = ['基本', '锦囊', '装备'];
              const allLit = allButtons.every(b => qiHui.litButtons.includes(b));
              if (allLit) {
                qiHui.stage = 'selecting_option';
                qiHui.selectedOption = null;
              }
              return;
            }

            if (qiHui.stage === 'selecting_option') {
              toggle();
              return;
            }
        },

        youxushuQiHuiSelectOption: ({ G, playerID }, option) => {
            const player = G.players[playerID];
            if (!player.qiHui || player.qiHui.stage !== 'selecting_option') return;
            player.qiHui.selectedOption = option;
        },

        youxushuQiHuiConfirm: ({ G, playerID, random }) => {
          const player = G.players[playerID];
          if (!player || !player.qiHui || player.qiHui.stage !== 'selecting_option') return;
          const qiHui = player.qiHui;
          if (!qiHui.selectedOption) return;
          if (!Array.isArray(qiHui.litButtons) || qiHui.litButtons.length !== 1) return;

          const option = qiHui.selectedOption;
          const playerName = player.general ? player.general.name : `Player ${playerID}`;

          if (option === 1) {
            if (player.hp < player.hpMax) {
              player.hp++;
              G.actionLog.push(`${playerName} 通过启诲回复了1点体力`);
            } else {
              G.actionLog.push(`${playerName} 通过启诲试图回复体力，但体力已满`);
            }
            G.actionLog.push(`${playerName} 请重铸一张牌`);
          } else if (option === 2) {
            for (let i = 0; i < 2; i++) {
              if (G.deck.length === 0) {
                if (G.discardPile.length > 0) {
                  G.deck = shuffle(G.discardPile, random);
                  G.discardPile = [];
                } else {
                  break;
                }
              }
              const card = G.deck.shift();
              if (card) addCardsToHand(G, playerID, card);
            }
            G.actionLog.push(`${playerName} 通过启诲摸了两张牌`);
          } else if (option === 3) {
            G.actionLog.push(`${playerName} 选择：使用的下一张牌不计入使用次数且无次数限制`);
          }

          qiHui.stage = 'lighting';
          qiHui.selectedOption = null;
        }
    }
};
