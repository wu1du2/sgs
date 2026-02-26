export const isJuejinForbiddenCard = (card) => {
  return card && ['闪', '桃', '酒'].includes(card.name);
};

export const filterJuejinCards = (G, cards) => {
  const list = Array.isArray(cards) ? cards : [cards];
  if (!G || !G.caomaoJuejinAuraActive) {
    return { allowed: list.filter(Boolean), exiled: [] };
  }
  const allowed = [];
  const exiled = [];
  list.filter(Boolean).forEach(card => {
    if (isJuejinForbiddenCard(card)) {
      exiled.push(card);
    } else {
      allowed.push(card);
    }
  });
  return { allowed, exiled };
};

export const pushToExiled = (G, cards) => {
  const list = Array.isArray(cards) ? cards : [cards];
  const valid = list.filter(Boolean);
  if (valid.length === 0) return;
  if (!Array.isArray(G.exiledCards)) G.exiledCards = [];
  G.exiledCards.push(...valid);
};

export const addCardsToHand = (G, playerID, cards) => {
  const { allowed, exiled } = filterJuejinCards(G, cards);
  if (allowed.length > 0) {
    G.hands[playerID].push(...allowed);
  }
  if (exiled.length > 0) {
    pushToExiled(G, exiled);
  }
  return { allowed, exiled };
};

export const addCardsToDiscard = (G, cards) => {
  const list = Array.isArray(cards) ? cards : [cards];
  list.filter(Boolean).forEach(card => {
    if (card._originalName) {
      card.name = card._originalName;
      delete card._originalName;
    }
    if (card._originalType) {
      card.type = card._originalType;
      delete card._originalType;
    }
    if (card._originalSuit) {
      card.suit = card._originalSuit;
      delete card._originalSuit;
    }
  });
  const { allowed, exiled } = filterJuejinCards(G, list);
  if (allowed.length > 0) {
    G.discardPile.push(...allowed);
  }
  if (exiled.length > 0) {
    pushToExiled(G, exiled);
  }
  return { allowed, exiled };
};

export const clampArmor = (player) => {
  if (!player) return;
  if (typeof player.armor !== 'number') player.armor = 0;
  if (player.armor < 0) player.armor = 0;
  if (player.armor > 5) player.armor = 5;
};
