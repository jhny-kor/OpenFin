export type CacheBudgetLimits = {
  maxTotalBytes: number;
  maxSingleEntryBytes: number;
  maxDecodedRows: number;
  maxInflightBytes: number;
};

export type CacheBudgetSnapshot = {
  bytes: number;
  decodedRows: number;
  inflightBytes: number;
  entries: number;
  evictions: number;
};

export type CacheAdmission = {
  accepted: boolean;
  evicted: string[];
  reason?: "single_entry_bytes" | "total_bytes" | "decoded_rows";
};

type Entry = { bytes: number; decodedRows: number };

const finiteNonNegative = (value: number, name: string): number => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a finite non-negative number`);
  return value;
};

/**
 * Small LRU ledger for parsed runtime artifacts. Byte and row ceilings are
 * primary; entry count remains an implementation detail of the caller.
 */
export class CacheBudget {
  readonly limits: CacheBudgetLimits;
  private readonly entries = new Map<string, Entry>();
  private readonly inflight = new Map<string, number>();
  private evictionCount = 0;
  private totalBytes = 0;
  private totalDecodedRows = 0;
  private totalInflightBytes = 0;

  constructor(limits: CacheBudgetLimits) {
    this.limits = limits;
    finiteNonNegative(limits.maxTotalBytes, "maxTotalBytes");
    finiteNonNegative(limits.maxSingleEntryBytes, "maxSingleEntryBytes");
    finiteNonNegative(limits.maxDecodedRows, "maxDecodedRows");
    finiteNonNegative(limits.maxInflightBytes, "maxInflightBytes");
  }

  admit(key: string, bytes: number, decodedRows: number): CacheAdmission {
    finiteNonNegative(bytes, "bytes");
    finiteNonNegative(decodedRows, "decodedRows");
    const evicted: string[] = [];
    this.remove(key);
    if (bytes > this.limits.maxSingleEntryBytes) return { accepted: false, evicted, reason: "single_entry_bytes" };
    while (this.entries.size && (this.totalBytes + bytes > this.limits.maxTotalBytes || this.totalDecodedRows + decodedRows > this.limits.maxDecodedRows)) {
      const oldest = this.entries.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.remove(oldest);
      evicted.push(oldest);
      this.evictionCount += 1;
    }
    if (this.totalBytes + bytes > this.limits.maxTotalBytes) return { accepted: false, evicted, reason: "total_bytes" };
    if (this.totalDecodedRows + decodedRows > this.limits.maxDecodedRows) return { accepted: false, evicted, reason: "decoded_rows" };
    this.entries.set(key, { bytes, decodedRows });
    this.totalBytes += bytes;
    this.totalDecodedRows += decodedRows;
    return { accepted: true, evicted };
  }

  touch(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    this.entries.delete(key);
    this.entries.set(key, entry);
    return true;
  }

  remove(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    this.entries.delete(key);
    this.totalBytes -= entry.bytes;
    this.totalDecodedRows -= entry.decodedRows;
    return true;
  }

  clear(): void {
    this.entries.clear();
    this.inflight.clear();
    this.totalBytes = 0;
    this.totalDecodedRows = 0;
    this.totalInflightBytes = 0;
  }

  reserveInflight(key: string, bytes: number): boolean {
    finiteNonNegative(bytes, "bytes");
    const previous = this.inflight.get(key) ?? 0;
    const next = this.totalInflightBytes - previous + bytes;
    if (next > this.limits.maxInflightBytes) return false;
    this.inflight.set(key, bytes);
    this.totalInflightBytes = next;
    return true;
  }

  releaseInflight(key: string): void {
    const bytes = this.inflight.get(key);
    if (bytes === undefined) return;
    this.inflight.delete(key);
    this.totalInflightBytes -= bytes;
  }

  snapshot(): CacheBudgetSnapshot {
    return {
      bytes: this.totalBytes,
      decodedRows: this.totalDecodedRows,
      inflightBytes: this.totalInflightBytes,
      entries: this.entries.size,
      evictions: this.evictionCount,
    };
  }
}
