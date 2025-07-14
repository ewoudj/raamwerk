import {WithSignal, Signal, effect } from './signal';
import {renderStyle, StyleValue } from './style';

// Simplified ElementConfig using the StyleValue type
type ElementConfig<T extends keyof HTMLElementTagNameMap> = {
  tag: T;
  style?: StyleValue;
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
    if (attributeName === "tag") {
      continue; // Skip the tag attribute
    }
    else if (attributeName === "children"){
      renderChildren<T>(config, result);
    }
    else if (attributeName === "style") {
      renderStyle(config.style, result);
    } 
    else {
      isUpdatingFromSignal = renderAttribute<T>(config, attributeName, result, isUpdatingFromSignal);
    }
  }

  return result;
}

function renderChildren<T extends keyof HTMLElementTagNameMap>(config: ElementConfig<T>, result: HTMLObjectElement | HTMLElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFormElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLMapElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLScriptElement | HTMLSelectElement | HTMLSlotElement | HTMLSourceElement | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement) {
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
}

function renderAttribute<T extends keyof HTMLElementTagNameMap>(config: ElementConfig<T>, attributeName: string, result: HTMLObjectElement | HTMLElement | HTMLStyleElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFormElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLMapElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLScriptElement | HTMLSelectElement | HTMLSlotElement | HTMLSourceElement | HTMLSpanElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement, isUpdatingFromSignal: boolean) {
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
    if (["value", "checked"].includes(attributeName) &&
      typeof attributeValue === "function" &&
      (attributeValue as any).name === 'signalFn') {
      // Initial value setting - check if the property exists first
      if (attributeName in result) {
        (result as any)[attributeName] = attributeValue();
      }

      // Update the DOM when the signal changes
      effect(() => {
        const newValue = attributeValue();
        if (attributeName in result && (result as any)[attributeName] !== newValue) {
          (result as any)[attributeName] = newValue;
        }
      });

      // Update the signal when the input changes
      result.addEventListener("input", (event) => {
        if (isUpdatingFromSignal) return;

        try {
          isUpdatingFromSignal = true;
          const target = event.target as HTMLInputElement;
          if (attributeName in target) {
            const newValue = target[attributeName as keyof HTMLInputElement];
            (attributeValue as Signal<any>)(newValue);
          }
        } finally {
          // Reset the flag after a short delay to allow the signal update to complete
          setTimeout(() => {
            isUpdatingFromSignal = false;
          }, 0);
        }
      });
    }
  }
  return isUpdatingFromSignal;
}

// Reactive each function to create lists of elements
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
