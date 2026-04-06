export function roundUpToNearestHalf(value: number) {
  return Math.ceil(value * 2) / 2;
}

export function getPerSpotAmount(totalRent: number, maxPlayers: number) {
  if (!maxPlayers || maxPlayers <= 0) {
    return Number(Number(totalRent).toFixed(2));
  }

  return Number(
    roundUpToNearestHalf(Number(totalRent) / Number(maxPlayers)).toFixed(2),
  );
}

export function getRequestedSpots(guestCount: number) {
  return 1 + Math.max(0, Number(guestCount || 0));
}

export function getRequiredBalanceForSelection({
  totalRent,
  maxPlayers,
  guestCount = 0,
}: {
  totalRent: number;
  maxPlayers: number;
  guestCount?: number;
}) {
  const perSpot = getPerSpotAmount(Number(totalRent), Number(maxPlayers));
  const requestedSpots = getRequestedSpots(guestCount);

  return Number((perSpot * requestedSpots).toFixed(2));
}

export function getSuggestedTopUpAmount({
  totalRent,
  maxPlayers,
  guestCount = 0,
  currentBalance = 0,
}: {
  totalRent: number;
  maxPlayers: number;
  guestCount?: number;
  currentBalance?: number;
}) {
  const requiredBalance = getRequiredBalanceForSelection({
    totalRent,
    maxPlayers,
    guestCount,
  });

  const rawNeeded = Number(requiredBalance) - Number(currentBalance || 0);

  if (rawNeeded <= 0) {
    return 0;
  }

  return Number(roundUpToNearestHalf(rawNeeded).toFixed(2));
}

export function getPaymentMemo(
  profileName?: string | null,
  fallback?: string | null,
) {
  const cleanName = String(profileName || "").trim();
  const cleanFallback = String(fallback || "").trim();

  if (cleanName.length > 0) return cleanName;
  if (cleanFallback.length > 0) return cleanFallback;
  return "your profile name";
}