export const getAdjustmentDate = (adjustment) => {
  if (!adjustment || typeof adjustment !== 'object') {
    return null;
  }

  const candidates = [
    adjustment.date,
    adjustment.createdAt,
    adjustment.created_at,
    adjustment.updatedAt,
    adjustment.updated_at,
    adjustment.timestamp,
    adjustment.time,
    adjustment.created,
    adjustment.updated
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

export const getAdjustmentTimestamp = (adjustment) => {
  const date = getAdjustmentDate(adjustment);
  return date ? date.getTime() : 0;
};

export const formatAdjustmentDate = (adjustment, locale = 'en-US') => {
  const date = getAdjustmentDate(adjustment);
  if (!date) return 'Unknown date';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
