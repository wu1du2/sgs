import { addCardsToHand } from './cardUtils.js';

// Fisher-Yates shuffle with optional RNG
function shuffle(array, rng) {
  if (!rng || typeof rng.Number !== 'function') {
    throw new Error('random is required');
  }
  let currentIndex = array.length,  randomIndex;
  const newArray = [...array];

  while (currentIndex != 0) {
    randomIndex = Math.floor(rng.Number() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

export const luotongSkill = {
    qinzheng: {
        name: "勤政",
        description: "锁定技，你每使用或打出三张牌时，你随机获得一张【杀】或【闪】；每使用或打出五张牌时，你随机获得一张【桃】或【酒】；每使用或打出八张牌时，你随机获得一张【无中生有】或【决斗】。",
        
        trigger: (G, playerID, rng) => {
            const player = G.players[playerID];
            if (!player || typeof player.qz_cnt !== 'number') return;

            const cnt = player.qz_cnt;
            const logMessages = [];

            // Helper to find and draw card
            const findAndDraw = (targetNames) => {
                // Shuffle deck
                G.deck = shuffle(G.deck, rng);
                
                const cardIndex = G.deck.findIndex(c => targetNames.includes(c.name));
                if (cardIndex !== -1) {
                    const card = G.deck.splice(cardIndex, 1)[0];
                    addCardsToHand(G, playerID, card);
                    return card.name;
                }
                return null;
            };

            // Check conditions
            if (cnt % 3 === 0) {
                const cardName = findAndDraw(['杀', '闪']);
                if (cardName) {
                    logMessages.push(`勤政 triggered (3): Obtained ${cardName}`);
                } else {
                    logMessages.push(`勤政 triggered (3): No 杀 or 闪 found in deck`);
                }
            }

            if (cnt % 5 === 0) {
                const cardName = findAndDraw(['桃', '酒']);
                if (cardName) {
                    logMessages.push(`勤政 triggered (5): Obtained ${cardName}`);
                } else {
                    logMessages.push(`勤政 triggered (5): No 桃 or 酒 found in deck`);
                }
            }

            if (cnt % 8 === 0) {
                const cardName = findAndDraw(['无中生有', '决斗']);
                if (cardName) {
                    logMessages.push(`勤政 triggered (8): Obtained ${cardName}`);
                } else {
                    logMessages.push(`勤政 triggered (8): No 无中生有 or 决斗 found in deck`);
                }
            }
            
            return logMessages;
        }
    }
};
