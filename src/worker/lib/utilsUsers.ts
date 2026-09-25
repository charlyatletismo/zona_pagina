// Returns the column name if err is a UNIQUE constraint violation, e.g. "email"
export function uniqueViolationColumn(err: unknown): string | null {
  const e = err as { message?: string; cause?: { message?: string } };
  const msg = e?.cause?.message ?? e?.message ?? "";
  const match = msg.match(/UNIQUE constraint failed: \w+\.(\w+)/);
  return match ? match[1] : null;
}
