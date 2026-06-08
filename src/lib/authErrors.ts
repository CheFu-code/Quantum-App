export function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const normalized = message.toLowerCase();

  if (normalized.includes("timeout") || normalized.includes("timed out")) {
    return "CheFu Account is taking longer than expected. Check your connection and try again.";
  }

  if (
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("service unavailable") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("503")
  ) {
    return "CheFu Account is temporarily unavailable. Try again in a moment.";
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("invalid token") ||
    normalized.includes("invalid id token")
  ) {
    return "Your CheFu session expired. Sign in again to sync.";
  }

  return message || "Could not sign in to CheFu Account.";
}
