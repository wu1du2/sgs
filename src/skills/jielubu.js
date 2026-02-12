export const jielubuSkill = {
    // 1. Start the skill: enable target selection
    useLiyu: ({ G, playerID }) => {
        // Initialize the targeting state
        G.liyuTargeting = {
            active: true,
            sourceID: playerID,
            selectedTargetID: null
        };
        // Log that the player is using the skill
        G.actionLog.push(`Player ${playerID} used skill "利驭"`);
    },

    // 1.5 Select target (update G state)
    selectLiyuTarget: ({ G, playerID }, targetID) => {
        if (G.liyuTargeting && G.liyuTargeting.active && G.liyuTargeting.sourceID === playerID) {
            G.liyuTargeting.selectedTargetID = targetID;
        }
    },

    // 2. Confirm the selected target
    confirmLiyuTarget: ({ G, playerID }) => {
        const targetID = G.liyuTargeting?.selectedTargetID;
        if (!targetID) return;
        
        // Transition from targeting to card selection
        G.liyuTargeting = null;
        G.liyuCardSelecting = {
            active: true,
            sourceID: playerID,
            targetID: targetID
        };
    },

    // 3. Cancel the targeting
    cancelLiyuTarget: ({ G }) => {
        G.liyuTargeting = null;
    },

    // 4. Action: Obtain the selected card
    liyuObtainCard: ({ G, playerID }, targetID, selectedCards) => {
        const target = G.players[targetID];
        const source = G.players[playerID];
        const targetHand = G.hands[targetID];

        // selectedCards is expected to be an array from CardSelectionModal
        // We only expect one card because singleSelection will be true
        if (!selectedCards || selectedCards.length === 0) return;

        const selection = selectedCards[0];
        let cardToMove = null;
        let cardType = "";

        if (selection.type === 'hand') {
            const index = selection.index;
            if (index >= 0 && index < targetHand.length) {
                cardToMove = targetHand[index];
                targetHand.splice(index, 1);
                cardType = "手";
            }
        } else if (selection.type === 'equip') {
            const slot = selection.slot;
            if (target.equipments[slot]) {
                cardToMove = target.equipments[slot];
                target.equipments[slot] = null;
                cardType = "装备";
            }
        } else if (selection.type === 'judge') {
            const slot = selection.slot;
            if (target.judges[slot]) {
                cardToMove = target.judges[slot];
                delete target.judges[slot];
                cardType = "判定";
            }
        }

        if (cardToMove) {
            G.hands[playerID].push(cardToMove);
            const targetName = target.general.name;
            G.actionLog.push(`界吕布 "利驭" 获得了 ${targetName} 的一张 ${cardType} 牌`);
        }

        // Clean up state
        G.liyuCardSelecting = null;
    }
};
