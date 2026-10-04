import { Observable, of, shareReplay, tap } from 'rxjs';

const DEFAULT_TTL_MS = 60_000;

export class Cached<T> {
  private value?: T;
  private storedAt = 0;
  private pending?: Observable<T>;

  constructor(private readonly ttlMs: number = DEFAULT_TTL_MS) {}

  get(source: () => Observable<T>): Observable<T> {
    if (this.value !== undefined && Date.now() - this.storedAt < this.ttlMs) {
      return of(this.value);
    }

    if (this.pending) {
      return this.pending;
    }

    this.pending = source().pipe(
      tap({
        next: value => {
          this.value = value;
          this.storedAt = Date.now();
          this.pending = undefined;
        },
        error: () => {
          this.pending = undefined;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.pending;
  }

  peek(): T | undefined {
    return this.value;
  }

  clear(): void {
    this.value = undefined;
    this.pending = undefined;
    this.storedAt = 0;
  }
}
