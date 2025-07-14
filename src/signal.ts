type EffectFunction = () => void;
export type Signal<T> = ((newVal?: T | ((prev: T) => T)) => T) & { dispose?: () => void };

// Global state for tracking current effect and dependencies
let currentEffect: EffectFunction | null = null;
const effectDependencies = new WeakMap<EffectFunction, Set<Signal<any>>>();
const signalSubscribers = new WeakMap<Signal<any>, Set<EffectFunction>>();
let isUpdating = false; // Prevent nested updates

// Helper to get or create subscribers set for a signal
function getSubscribers(signal: Signal<any>): Set<EffectFunction> {
  if (!signalSubscribers.has(signal)) {
    signalSubscribers.set(signal, new Set());
  }
  return signalSubscribers.get(signal)!;
}

// Helper to get or create dependencies set for an effect
function getDependencies(effect: EffectFunction): Set<Signal<any>> {
  if (!effectDependencies.has(effect)) {
    effectDependencies.set(effect, new Set());
  }
  return effectDependencies.get(effect)!;
}

// Clean up effect from all its current dependencies
function cleanupEffect(effect: EffectFunction) {
  const dependencies = effectDependencies.get(effect);
  if (dependencies) {
    for (const signal of dependencies) {
      const subscribers = signalSubscribers.get(signal);
      if (subscribers) {
        subscribers.delete(effect);
      }
    }
    dependencies.clear();
  }
}

// Batch updates to prevent cascading effects
function batchUpdate(updates: (() => void)[]) {
  if (isUpdating) {
    // If already updating, just run the updates directly
    updates.forEach(update => update());
    return;
  }
  
  isUpdating = true;
  try {
    updates.forEach(update => update());
  } finally {
    isUpdating = false;
  }
}

// Create a signal that can be used to store and update values reactively
export function signal<T>(value?: T): Signal<T> {
  const signalFn: Signal<T> = (newVal?: T | ((prev: T) => T)) => {
    if (newVal === undefined) {
      // Reading the signal - track dependency if we're in an effect
      if (currentEffect) {
        const subscribers = getSubscribers(signalFn);
        const dependencies = getDependencies(currentEffect);
        
        subscribers.add(currentEffect);
        dependencies.add(signalFn);
      }
      return value as T;
    }
    
    // Setting the signal value
    const oldValue = value;
    value = typeof newVal === "function" ? (newVal as (prev: T) => T)(value as T) : newVal;
    
    // Only notify subscribers if value actually changed
    if (oldValue !== value) {
      const subscribers = getSubscribers(signalFn);
      // Create a copy of subscribers to avoid modification during iteration
      const subscribersCopy = new Set(subscribers);
      
      // Batch updates to prevent cascading effects
      const updates = Array.from(subscribersCopy).map(effect => () => {
        // Clean up old dependencies before running the effect
        cleanupEffect(effect);
        effect();
      });
      
      batchUpdate(updates);
    }
    
    return value as T;
  };

  return signalFn;
}

// Create a signal that can be used in effects
export function effect(fn: EffectFunction): () => void {
  let disposed = false;
  
  const effectFn = () => {
    if (disposed) return;
    
    // Clean up old dependencies
    cleanupEffect(effectFn);
    
    // Set current effect and run the function
    const previousEffect = currentEffect;
    currentEffect = effectFn;
    
    try {
      fn();
    } catch (error) {
      console.error('Error in effect:', error);
    } finally {
      currentEffect = previousEffect;
    }
  };
  
  // Run the effect immediately
  effectFn();
  
  // Return dispose function
  return () => {
    disposed = true;
    cleanupEffect(effectFn);
  };
}

// Create a computed signal that updates when dependencies change
export function computed<T>(fn: () => T): Signal<T> {
  const s = signal<T>();
  s.dispose = effect(() => s(fn()));
  return s;
}

// Utility function to batch multiple signal updates
export function batch(fn: () => void) {
  batchUpdate([fn]);
}

// Utility type to allow signals in object properties
export type WithSignal<T> = {
  [K in keyof T]?: T[K] | Signal<NonNullable<T[K]>> | null | undefined;
};


