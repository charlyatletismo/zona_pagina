
export const buildItemId = (eventId: number | string, userId: string, registrationId: number | string) => {
  return `event_${eventId}_user_${userId}_reg_${registrationId}`;
}

export const parseItemId = (itemId: string) => {
  const regex = /^event_(\d+)_user_(.+)_reg_(\d+)$/;
  const match = itemId.match(regex);
  if (!match) {
    throw new Error(`Invalid item ID format: ${itemId}`);
  }
  return {
    eventId: Number(match[1]),
    userId: match[2],
    registrationId: Number(match[3]),
  };
}
