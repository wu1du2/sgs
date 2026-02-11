export const yangbiaoSkill = {
    zhaohan: {
        name: "昭汉",
        description: "初始为1最多为8。数字=8时，点按无效。点击时，x=1，2，3，4时，杨彪体力上限+1，体力值+1；x=5 ,6, 7时，杨彪体力上限-1。点击后x+1。",
        
        /**
         * Zhaohan Action
         * @param {object} G - Game state
         * @param {string} playerID - ID of the player using the skill
         */
        action: ({ G, playerID }) => {
            const player = G.players[playerID];
            
            // Initialize zhaohan count if not present
            if (typeof player.zhaohanCount !== 'number') {
                player.zhaohanCount = 1;
            }
            
            const x = player.zhaohanCount;
            
            if (x >= 8) {
                return; // Invalid click
            }
            
            if (x >= 1 && x <= 4) {
                // Max HP + 1, HP + 1
                player.hpMax += 1;
                player.hp += 1;
                G.actionLog.push(`Player ${playerID} used Zhaohan (x=${x}): Max HP +1, HP +1`);
            } else if (x >= 5 && x <= 7) {
                // Max HP - 1
                player.hpMax -= 1;
                if (player.hp > player.hpMax) {
                    player.hp = player.hpMax;
                }
                G.actionLog.push(`Player ${playerID} used Zhaohan (x=${x}): Max HP -1`);
            }
            
            // Increment x
            player.zhaohanCount += 1;
        },
        
        /**
         * Get display name based on state
         * @param {number} count - Current zhaohan count
         * @returns {string} - Display name
         */
        getDisplayName: (count) => {
            const x = count === undefined || count === null ? 1 : count;
            return `昭汉${x}`;
        }
    }
};