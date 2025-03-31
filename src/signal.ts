type EffectFunction = () => void;
export type Signal<T> = ((newVal?: T | ((prev: T) => T)) => T) & { dispose?: () => void };

const effects: EffectFunction[] = [() => {}];
const disposed = new WeakSet<EffectFunction>();

export function signal<T>(value?: T): Signal<T> {
  const subs = new Set<EffectFunction>();

  const signalFn: Signal<T> = (newVal?: T | ((prev: T) => T)) => {
    if (newVal === undefined) {
      const lastEffect = effects.at(-1);
      if (lastEffect) subs.add(lastEffect);
      return value as T;
    }
    if (newVal !== value) {
      value = typeof newVal === "function" ? (newVal as (prev: T) => T)(value as T) : newVal;
      for (const eff of subs) {
        if (disposed.has(eff)) {
          subs.delete(eff);
        } else {
          eff();
        }
      }
    }
    return value as T;
  };

  return signalFn;
}

export function effect(fn: EffectFunction): () => void {
  effects.push(fn);
  try {
    fn();
    return () => disposed.add(fn);
  } finally {
    effects.pop();
  }
}

export function computed<T>(fn: () => T): Signal<T> {
  const s = signal<T>();
  s.dispose = effect(() => s(fn()));
  return s;
}
