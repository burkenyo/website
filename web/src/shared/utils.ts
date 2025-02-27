// Copyright © 2024 Samuel Justin Speth Gabay
// Licensed under the GNU Affero Public License, Version 3

export class AssertError extends Error { }

export function assert<T>(value: T, message: string, param?: unknown) {
  if (!value) {
    if (param) {
      message += param;
    }

    throw new AssertError(message);
  }
}

export function requireTruthy<T>(value: T, message: string, param?: unknown): NonNullable<T> {
  if (!value) {
    if (param) {
      message += param;
    }

    throw new TypeError(message);
  }

  return value as NonNullable<T>;
}

export const FALSE_STRING = String(false);
export const TRUE_STRING = String(true);

export function isTrue(value: Optional<boolean | string | number | bigint>): boolean {
  if (typeof value == "string") {
    return value.toLowerCase() == TRUE_STRING;
  }

  return !!value;
}

export interface Lazy<T extends object> {
  readonly value: T;
}

export function lazy<T extends {}>(factory: () => T): Lazy<T> {
  let value: T;

  return {
    get value() {
      if (value) {
        return value;
      }

      value = factory();

      return value;
    },
  };
}

export function delay(millis: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), millis);
  });
}

export class CancellablePromise<T extends {}> implements Promise<Optional<T>> {
  readonly #promise: Promise<Optional<T>>;
  #isCanceled = false;
  #resolve!: () => void;

  get isCanceled(): boolean {
    return this.#isCanceled;
  }

  get [Symbol.toStringTag]() {
    return "CancellablePromise";
  }

  constructor(promise?: Optional<Promise<T>>) {
    const canceler = new Promise<void>(resolve => { this.#resolve = resolve });

    this.#promise = (
      promise
        ? Promise.race([promise, canceler])
        : canceler
     ) as Promise<Optional<T>>
  }

  then<TResult1 = Optional<T>, TResult2 = never>(onfulfilled?: ((value: Optional<T>) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined): Promise<Optional<T> | TResult> {
    return this.#promise.then(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<Optional<T>> {
    return this.#promise.finally(onfinally);
  }

  cancel() {
    this.#resolve();
    this.#isCanceled = true;
  }
}

// Here clazz is typed as Function rather than new (...args: unknown[]) => object
// because TypeScript won’t allow me to assign a private constructor to the latter definition
export function validateConstructorKey(providedKey: symbol, constructorKey: symbol, clazz: Function) {
  if (providedKey != constructorKey) {
    throw new TypeError(
      clazz.name + " constructor is private! It cannot be invoked outside of the class definition.")
  }
}

export enum TimeUnit {
  Millisecond,
  Second,
  Minute,
  Hour,
  Day,
}

export function timeDiff(first: Date, second: Date, unit: TimeUnit): number {
  const millis = first.getTime() - second.getTime();

  switch (unit) {
    case TimeUnit.Millisecond:
      return millis;

    case TimeUnit.Second:
      return millis / 1000;

    case TimeUnit.Minute:
      return millis / 60_000;

    case TimeUnit.Hour:
      return millis / 3_600_000;

    case TimeUnit.Day:
      return millis / 86_400_000;
  }
}

export function dynamicImport<T extends {}>(url: string): Lazy<Promise<T>> {
  return lazy(async () => import(/* @vite-ignore */ url)) as Lazy<Promise<T>>;
}

export function immutable<K, V>(map: Map<K, V>) {
  return map as ReadonlyMap<K, Readonly<V>>;
}

export function ordinalize(value: number) {
  if (value < 0) {
    throw new RangeError("Value must be non-negative!");
  }

  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 == 1 && mod100 != 11) {
    return "1st";
  }
  if (mod10 == 2 && mod100 != 12) {
    return "2nd";
  }
  if (mod10 == 3 && mod100 != 13) {
    return "3rd";
  }

  return `${value}th`;
}

export function range(collection: { readonly length: number }): readonly number[];
export function range(length: number): readonly number[];
export function range(collectionOrLength: { length: number } | number): number[] {
  let length;
  if (typeof collectionOrLength == "number") {
    if (collectionOrLength < 0) {
      throw new RangeError("Length must be non-negative!");
    }

    length = collectionOrLength
  } else {
    length = collectionOrLength.length;
  }

  const array = new Array(length);

  for (let i = 0; i < length; i++) {
    array[i] = i;
  }

  return array;
}

export function shuffle(array: unknown[]): void {
  {
    let m = array.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);

      [array[m], array[i]] = [array[i], array[m]];
    }
  }
}

export function pickRandom<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}
