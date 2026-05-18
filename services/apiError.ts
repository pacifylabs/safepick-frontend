export function getApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const record = error as Record<string, unknown>;

  if (typeof record.message === "string") {
    return record.message;
  }

  if (record.message && typeof record.message === "object") {
    return getApiErrorMessage(record.message, fallback);
  }

  if (typeof record.error === "string") {
    return record.error;
  }

  if (record.data) {
    return getApiErrorMessage(record.data, fallback);
  }

  return fallback;
}
