// src/web-component.ts
import { element, ElementConfig } from './element';
import { signal, effect, Signal } from './signal';

type WebComponentProps<P extends Record<string, any>> = {
  props?: P;
  shadow?: boolean;
  observedAttributes?: (keyof P)[];
  styles?: string;
  onConnected?: (element: HTMLElement, props: P) => void;
  onDisconnected?: (element: HTMLElement, props: P) => void;
  onAttributeChanged?: (element: HTMLElement, name: string, oldValue: string | null, newValue: string | null, props: P) => void;
};

export function defineComponent<P extends Record<string, any> = {}>(
  name: string,
  renderFn: (props: P) => ElementConfig<any>,
  options: WebComponentProps<P> = {}
): void {
  // Check if component is already defined
  if (customElements.get(name)) {
    console.warn(`Component "${name}" is already defined. Skipping definition.`);
    return;
  }

  // Validate component name (must contain a hyphen)
  if (!name.includes('-')) {
    console.error(`Invalid component name "${name}". Custom element names must contain a hyphen (-).`);
    return;
  }

  const { 
    props: defaultProps = {} as P, 
    shadow = true,
    observedAttributes = [],
    styles = '',
    onConnected,
    onDisconnected,
    onAttributeChanged
  } = options;
  
  class CustomElement extends HTMLElement {
    private _props: P;
    private _root: ShadowRoot | HTMLElement;
    private _signals: Map<keyof P, Signal<any>> = new Map();
    private _cleanup: (() => void)[] = [];
    
    constructor() {
      super();
      this._props = { ...defaultProps };
      
      // Create shadow DOM or use element itself
      this._root = shadow ? this.attachShadow({ mode: 'open' }) : this;
      
      // Create signals for each prop
      for (const key in defaultProps) {
        const signal = this._createSignalForProp(key);
        this._signals.set(key, signal);
      }
      
      // Add styles if using shadow DOM
      if (shadow && styles) {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        this._root.appendChild(styleElement);
      }
    }
    
    // Create a signal for a property with two-way binding
    private _createSignalForProp(key: keyof P) {
      const initialValue = this._props[key];
      const sig = signal(initialValue);
      
      // When signal changes, update the property and attribute
      const cleanup = effect(() => {
        const value = sig();
        this._props[key] = value;
        
        // Update attribute if it's in observed attributes
        if (observedAttributes.includes(key)) {
          if (value === null || value === undefined) {
            this.removeAttribute(String(key));
          } else if (typeof value === 'boolean') {
            if (value) {
              this.setAttribute(String(key), '');
            } else {
              this.removeAttribute(String(key));
            }
          } else {
            this.setAttribute(String(key), String(value));
          }
        }
      });
      
      this._cleanup.push(cleanup);
      return sig;
    }
    
    // Web Component lifecycle: connected
    connectedCallback() {
      // Render the component using the render function
      const rendered = renderFn(this._getPropsProxy());
      const el = element(rendered);
      this._root.appendChild(el);
      
      if (onConnected) {
        onConnected(this, this._props);
      }
    }
    
    // Web Component lifecycle: disconnected
    disconnectedCallback() {
      // Clean up effects and signals
      this._cleanup.forEach(cleanup => cleanup());
      
      if (onDisconnected) {
        onDisconnected(this, this._props);
      }
    }
    
    // Web Component lifecycle: attribute changed
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      const key = name as keyof P;
      if (this._signals.has(key)) {
        const signal = this._signals.get(key)!;
        
        // Parse attribute value based on the default prop type
        let parsedValue: any = newValue;
        const defaultValue = defaultProps[key];
        
        if (defaultValue === undefined && newValue === null) {
          return;
        }
        
        if (typeof defaultValue === 'number') {
          parsedValue = newValue === null ? 0 : Number(newValue);
        } else if (typeof defaultValue === 'boolean') {
          parsedValue = newValue !== null;
        } else if (typeof defaultValue === 'object' && defaultValue !== null) {
          try {
            parsedValue = newValue === null ? null : JSON.parse(newValue);
          } catch (e) {
            console.warn(`Failed to parse attribute ${name} as JSON`, e);
          }
        }
        
        // Update the signal
        signal(parsedValue);
      }
      
      if (onAttributeChanged) {
        onAttributeChanged(this, name, oldValue, newValue, this._props);
      }
    }
    
    // Get the list of observed attributes
    static get observedAttributes(): string[] {
      return observedAttributes.map(attr => String(attr));
    }
    
    // Create a proxy for the props to allow object destructuring with signals
    private _getPropsProxy(): P {
      const proxy = {} as P;
      for (const key in this._props) {
        if (this._signals.has(key)) {
          Object.defineProperty(proxy, key, {
            get: () => this._signals.get(key)!,
            enumerable: true
          });
        } else {
          proxy[key] = this._props[key];
        }
      }
      return proxy;
    }
    
    // Public API to get a prop
    getProp<K extends keyof P>(key: K): P[K] {
      return this._props[key];
    }
    
    // Public API to set a prop
    setProp<K extends keyof P>(key: K, value: P[K]): void {
      if (this._signals.has(key)) {
        this._signals.get(key)!(value);
      } else {
        this._props[key] = value;
      }
    }
  }
  
  // Register with better error handling
  try {
    customElements.define(name, CustomElement);
    console.log(`Component "${name}" successfully registered.`);
  } catch (error) {
    console.error(`Failed to register component "${name}":`, error);
  }
}