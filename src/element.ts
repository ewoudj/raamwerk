import { Signal, effect } from './signal';

type ElementConfig<T extends keyof HTMLElementTagNameMap = "div"> = {
  tag?: T;
  style?: Partial<CSSStyleDeclaration> | string;
  children?: Array<{ [K in keyof HTMLElementTagNameMap]: ElementConfig<K> }[keyof HTMLElementTagNameMap]>;
} & Partial<Omit<HTMLElementTagNameMap[T], "style" | "children">>;

export function createElement<T extends keyof HTMLElementTagNameMap>(config: ElementConfig<T> & { tag: T }): HTMLElementTagNameMap[T];
export function createElement(config: ElementConfig): HTMLElementTagNameMap["div"];
export function createElement(config: any): any {
  const result = document.createElement(config.tag ?? "div") as HTMLElementTagNameMap[T];

  for (const attributeName in config) {
    if (attributeName === "tag" || attributeName === "children") continue;

    const attributeValue = config[attributeName as keyof ElementConfig<T>];

    if (attributeValue !== undefined) {
      if (typeof attributeValue === "function" && attributeValue.name === 'signalFn') {
        // If the attribute is a signal, bind it reactively
        effect(() => {
          (result as any)[attributeName] = (attributeValue as Signal<any>)();
        });
      } else if (attributeName === "style" && typeof attributeValue !== "string") {
        Object.assign(result.style, attributeValue);
      } else {
        (result as any)[attributeName] = attributeValue;
      }

      // Two-way binding for form elements (input, textarea, select)
      if (
        ["value", "checked"].includes(attributeName) &&
        typeof attributeValue === "function" &&
        (attributeValue as any)()?.dispose
      ) {
        result.addEventListener("input", (event) => {
          const target = event.target as HTMLInputElement;
          (attributeValue as Signal<any>)(target[attributeName as keyof HTMLInputElement]);
        });
      }
    }
  }

  if (config.children) {
    for (const childConfig of config.children) {
      const childElement = createElement(childConfig);
      result.appendChild(childElement);
    }
  }

  return result;
}
