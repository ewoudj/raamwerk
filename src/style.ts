import {WithSignal, Signal, effect} from './signal';

export type StyleValue = 
  | WithSignal<Partial<CSSStyleDeclaration>> 
  | Signal<WithSignal<Partial<CSSStyleDeclaration>>> 
  | string 
  | Signal<string>
  | (() => string) 
  | (() => string | Signal<string>);

export function renderStyle(styleValue: StyleValue | undefined, element: HTMLElement) {
  if (styleValue !== undefined) {
    // Case 1: style is a signal function (either from signal() or computed())
    if (typeof styleValue === "function") {
      // Check if it's a signal function (has name 'signalFn')
      const isSignalFn = styleValue.name === 'signalFn';

      // Handle both signal and computed functions
      effect(() => {
        // For computed functions, call directly; for signals, call as function
        const resolvedStyle = isSignalFn ? styleValue() : styleValue();

        // Clear existing inline styles
        element.removeAttribute('style');

        // If style is a string, set it directly
        if (typeof resolvedStyle === 'string') {
          element.setAttribute('style', resolvedStyle);
        }

        // If style is an object, apply each property
        else if (typeof resolvedStyle === 'object' && resolvedStyle !== null) {
          Object.entries(resolvedStyle).forEach(([prop, value]) => {
            // Handle nested signals in style object
            if (typeof value === 'function') {
              effect(() => {
                // Fix: Call value without arguments but cast it to appropriate callable type
                const propValue = (value as () => any)();
                if (propValue !== undefined) {
                  element.style.setProperty(prop, String(propValue));
                }
              });
            } else {
              element.style.setProperty(prop, String(value));
            }
          });
        }
      });
    }

    // Case 2: style is a string directly
    else if (typeof styleValue === 'string') {
      element.setAttribute('style', styleValue);
    }

    // Case 3: style is an object with potential signal properties
    else if (typeof styleValue === 'object' && styleValue !== null) {
      Object.entries(styleValue).forEach(([prop, value]) => {
        // Handle signal for individual style property
        if (typeof value === 'function') {
          effect(() => {
            // Fix: Call value without arguments but cast it to appropriate callable type
            const propValue = (value as () => any)();
            if (propValue !== undefined) {
              element.style.setProperty(prop, String(propValue));
            }
          });
        } else {
          // Apply the style property directly
          (element.style as any)[prop] = value;
        }
      });
    }
  }
}