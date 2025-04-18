import { computed, Signal } from './signal';
/**
 * Creates a reactive text template from template literals with embedded signals
 * 
 * @example
 * const count = signal(0)
 * const message = text`Count is: ${count}!`
 * // message() will return "Count is: 0!" and update when count changes
 */
export function text(
    strings: TemplateStringsArray,
    ...values: (Signal<any> | any)[]
  ): Signal<string> {
    // Create a computed signal that will update whenever any embedded signal changes
    return computed(() => {
      // Map each value - if it's a signal, get its current value
      const resolvedValues = values.map(value => 
        typeof value === 'function' && value.name === 'signalFn' 
          ? value()
          : value
      );
      
      // Interleave the static strings with the resolved dynamic values
      let result = strings[0];
      for (let i = 0; i < resolvedValues.length; i++) {
        result += resolvedValues[i] + strings[i + 1];
      }
      
      return result;
    });
  }