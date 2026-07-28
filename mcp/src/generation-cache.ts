export function generationCacheKey(generation: string, key: string): string {
  return JSON.stringify([generation, key]);
}

export function isCurrentGeneration(requestGeneration: string, currentGeneration: string): boolean {
  return requestGeneration === currentGeneration;
}

export class SingleFlight<T> {
  private pending?: Promise<T>;

  run(factory: () => Promise<T>): Promise<T> {
    if (this.pending) return this.pending;
    const request = factory().finally(() => {
      if (this.pending === request) this.pending = undefined;
    });
    this.pending = request;
    return request;
  }
}
