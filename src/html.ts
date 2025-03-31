import { effect } from "./signal";

type RenderFunction = (node: Node, attr: string | null, value: any) => void;

export type TemplateFunction = (tpl: TemplateStringsArray, ...data: any[]) => Node[];

type EffectDisposer = () => void;

type RunFunction = (fn: (val: any) => void) => void;

export function html(tpl: TemplateStringsArray, ...data: any[]): Node[] {
  const marker = "\ufeff";
  const t = document.createElement("template");
  t.innerHTML = tpl.join(marker);
  
  if (tpl.length > 1) {
    const iter = document.createNodeIterator(t.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n: Node | null;
    let idx = 0;

    while ((n = iter.nextNode())) {
      if (n instanceof Element) {
        if (n.attributes.length) {
          for (const attr of Array.from(n.attributes)) {
            if (attr.value === marker) {
              render(n, attr.name, data[idx++]);
            }
          }
        }
      } else if (n.nodeValue && n.nodeValue.includes(marker)) {
        const tmp = document.createElement("template");
        tmp.innerHTML = n.nodeValue.replaceAll(marker, "<!>");
        for (const child of Array.from(tmp.content.childNodes)) {
          if (child.nodeType === Node.COMMENT_NODE) {
            render(child, null, data[idx++]);
          }
        }
        (n as ChildNode).replaceWith(...Array.from(tmp.content.childNodes));
      }
    }
  }
  return Array.from(t.content.childNodes);
}

const render: RenderFunction = (node, attr, value) => {
  const run: RunFunction = value?.call
    ? (fn) => {
        let dispose: EffectDisposer | undefined;
        dispose = effect(() => {
          if (dispose && !node.isConnected) {
            dispose();
          } else {
            fn(value());
          }
        });
      }
    : (fn) => fn(value);

  if (attr) {
    (node as Element).removeAttribute(attr);
    if (attr.startsWith("on")) {
      (node as any)[attr] = value;
    } else {
      run((val) => {
        if (attr === "value" || attr === "checked") {
          (node as any)[attr] = val;
        } else {
          if (val === false) {
            (node as Element).removeAttribute(attr);
          } else {
            (node as Element).setAttribute(attr, val);
          }
        }
      });
    }
  } else {
    const key = Symbol();
    run((val) => {
      const upd = Array.isArray(val)
        ? val.flat()
        : val !== undefined
        ? [document.createTextNode(String(val))]
        : [];
      for (const n of upd) (n as any)[key] = true;
      
      let a: Node | null = node;
      let b: Node | null = null;
      while ((a = a?.nextSibling!) && (a as any)[key]) {
        b = upd.shift() || null;
        if (a !== b) {
          if (b) {
            (a as ChildNode).replaceWith(b);
          } else {
            b = a.previousSibling;
            (a as ChildNode).remove();
          }
          a = b;
        }
      }
      if (upd.length) {
        ((b || node) as ChildNode).after(...upd);
      }
    });
  }
};
