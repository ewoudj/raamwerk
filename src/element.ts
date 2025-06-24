import { Signal, effect } from './signal';

type WithSignal<T> = {
  [K in keyof T]?: T[K] | Signal<NonNullable<T[K]>> | null | undefined;
};

// Updated type definition with proper support for computed styles
type ElementConfig<T extends keyof HTMLElementTagNameMap> = {
  tag: T;
  style?: WithSignal<Partial<CSSStyleDeclaration>> | 
          Signal<WithSignal<Partial<CSSStyleDeclaration>>> | 
          string | 
          Signal<string> |
          (() => string) | // Support for computed functions returning strings
          (() => string | Signal<string>); // Support for stylesheet functions
  children?: Array<{ [K in keyof HTMLElementTagNameMap]: ElementConfig<K> }[keyof HTMLElementTagNameMap]> | 
            Signal<Array<{ [K in keyof HTMLElementTagNameMap]: ElementConfig<K> }[keyof HTMLElementTagNameMap]>>;
} & WithSignal<Partial<Omit<HTMLElementTagNameMap[T], "style" | "children">>>;

export function element<T extends keyof HTMLElementTagNameMap>(
  config: ElementConfig<T>
): HTMLElementTagNameMap[T] {
  const result = document.createElement(config.tag) as HTMLElementTagNameMap[T];
  
  // Track if we're currently updating from a signal to prevent loops
  let isUpdatingFromSignal = false;

  // Handle attributes
  for (const attributeName in config) {
    if (attributeName === "tag" || attributeName === "children") continue;
    
    // Special handling for the style attribute
    if (attributeName === "style") {
      const styleValue = config.style;
      
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
            result.removeAttribute('style');
            
            // If style is a string, set it directly
            if (typeof resolvedStyle === 'string') {
              result.setAttribute('style', resolvedStyle);
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
                      result.style.setProperty(prop, String(propValue));
                    }
                  });
                } else {
                  result.style.setProperty(prop, String(value));
                }
              });
            }
          });
        }
        // Case 2: style is a string directly
        else if (typeof styleValue === 'string') {
          result.setAttribute('style', styleValue);
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
                  result.style.setProperty(prop, String(propValue));
                }
              });
            } else {
              // Apply the style property directly
              (result.style as any)[prop] = value;
            }
          });
        }
      }
    } else {
      const attributeValue = config[attributeName as keyof ElementConfig<T>];

      if (attributeValue !== undefined) {
        // Handle event listeners (onclick, onchange, oninput, etc.)
        if (attributeName.startsWith('on') && typeof attributeValue === 'function') {
          const eventName = attributeName.slice(2).toLowerCase(); // Remove 'on' prefix
          result.addEventListener(eventName, attributeValue as EventListener);
        }
        // Handle regular attributes
        else if (typeof attributeValue === "function") {
          // Check if it's a signal function or computed
          const isSignalFn = attributeValue.name === 'signalFn';
          
          // If the attribute is a signal or computed, bind it reactively
          effect(() => {
            if (!isUpdatingFromSignal) {
              (result as any)[attributeName] = isSignalFn ? attributeValue() : attributeValue();
            }
          });
        } else {
          (result as any)[attributeName] = attributeValue;
        }

        // Two-way binding for form elements (input, textarea, select)
        if (
          ["value", "checked"].includes(attributeName) &&
          typeof attributeValue === "function" &&
          (attributeValue as any).name === 'signalFn'
        ) {
          result.addEventListener("input", (event) => {
            // Prevent infinite loops by checking if we're already updating from signal
            if (isUpdatingFromSignal) return;
            
            try {
              isUpdatingFromSignal = true;
              const target = event.target as HTMLInputElement;
              const newValue = target[attributeName as keyof HTMLInputElement];
              (attributeValue as Signal<any>)(newValue);
            } finally {
              // Reset the flag after a short delay to allow the signal update to complete
              setTimeout(() => {
                isUpdatingFromSignal = false;
              }, 0);
            }
          });
        }
      }
    }
  }

  // Handle children
  if (config.children) {
    if (typeof config.children === "function" && config.children.name === 'signalFn') {
      effect(() => {
        while (result.firstChild) {
          result.removeChild(result.firstChild);
        }
        
        const childrenArray = (config.children as Signal<ElementConfig<any>[]>)();
        
        for (const childConfig of childrenArray) {
          if (childConfig) {
            const childElement = element(childConfig);
            result.appendChild(childElement);
          }
        }
      });
    } else if (config.children && typeof config.children === 'object' && (config.children as any).__isSignalArray) {
      // Handle signal array wrapper from each function
      const wrapper = config.children as any;
      effect(() => {
        while (result.firstChild) {
          result.removeChild(result.firstChild);
        }
        
        const items = wrapper.signal();
        const childrenArray = items.map((item: any, index: number) => wrapper.template(item, index));
        
        for (const childConfig of childrenArray) {
          if (childConfig) {
            const childElement = element(childConfig);
            result.appendChild(childElement);
          }
        }
      });
    } else {
      for (const childConfig of config.children as ElementConfig<any>[]) {
        if (childConfig) {
          const childElement = element(childConfig);
          result.appendChild(childElement);
        }
      }
    }
  }

  return result;
}

// Updated each function to correctly integrate with ElementConfig
export function each<T, K>(
  val: Array<T> | Signal<Array<T>>,
  getKey: (item: T, index: number) => K,
  tpl: (item: T, index: number) => ElementConfig<any>
): ElementConfig<any>[] | Signal<ElementConfig<any>[]> {
  // For static arrays, return the configs directly
  if (typeof val !== "function" || val.name !== 'signalFn') {
    return (val as Array<T>).map((item, index) => tpl(item, index));
  }
  
  // For signal arrays, create a special wrapper that will be handled by the element function
  const signalWrapper = {
    __isSignalArray: true,
    signal: val,
    template: tpl,
    getKey: getKey
  };
  
  return signalWrapper as any;
}
