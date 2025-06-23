import { Signal, computed } from './signal';

// CSS property types for full TypeScript support
type CSSProperties = {
  // Layout
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;
  
  // Box model
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string | number;
  boxSizing?: 'content-box' | 'border-box';
  
  // Flexbox
  flex?: string | number;
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  
  // Typography
  color?: string;
  fontSize?: string | number;
  fontWeight?: number | 'normal' | 'bold' | 'bolder' | 'lighter';
  fontFamily?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  textDecoration?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  
  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  
  // Visual
  opacity?: number;
  visibility?: 'visible' | 'hidden' | 'collapse';
  cursor?: string;
  userSelect?: 'none' | 'auto' | 'text' | 'all';
  
  // Transforms
  transform?: string;
  transition?: string;
  
  // List
  listStyleType?: string;
  listStylePosition?: string;
  
  // Table
  borderCollapse?: 'collapse' | 'separate';
  borderSpacing?: string;
  
  // Other
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  wordWrap?: 'normal' | 'break-word';
  
  // Custom properties (for any CSS property not explicitly typed)
  [key: string]: any;
};

// Style function that converts CSS-like objects to CSS strings
export function style(properties: CSSProperties | Signal<CSSProperties>): string | Signal<string> {
  if (typeof properties === 'function') {
    // If it's a signal, return a computed signal that converts to CSS string
    return computed(() => {
      const props = properties();
      return convertToCSSString(props);
    });
  }
  
  // If it's a plain object, convert directly to CSS string
  return convertToCSSString(properties);
}

// Helper function to convert CSS properties object to CSS string
function convertToCSSString(properties: CSSProperties): string {
  return Object.entries(properties)
    .map(([property, value]) => {
      if (value === undefined || value === null) return '';
      
      // Convert camelCase to kebab-case
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      // Handle numeric values (add 'px' if no unit specified)
      let cssValue = value;
      if (typeof value === 'number' && !['zIndex', 'flexGrow', 'flexShrink', 'opacity', 'fontWeight'].includes(property)) {
        cssValue = `${value}px`;
      }
      
      return `${cssProperty}: ${cssValue}`;
    })
    .filter(Boolean)
    .join('; ');
}

// Utility functions for common patterns
export const styles = {
  // Layout utilities
  flex: (direction: CSSProperties['flexDirection'] = 'row', justify: CSSProperties['justifyContent'] = 'flex-start', align: CSSProperties['alignItems'] = 'stretch') => 
    style({ display: 'flex', flexDirection: direction, justifyContent: justify, alignItems: align }),
  
  center: () => style({ display: 'flex', justifyContent: 'center', alignItems: 'center' }),
  
  // Spacing utilities
  margin: (value: string | number) => style({ margin: value }),
  padding: (value: string | number) => style({ padding: value }),
  
  // Typography utilities
  text: (size: string | number, weight: CSSProperties['fontWeight'] = 'normal', family: string = 'inherit') => 
    style({ fontSize: size, fontWeight: weight, fontFamily: family }),
  
  // Color utilities
  bg: (color: string) => style({ backgroundColor: color }),
  color: (color: string) => style({ color }),
  
  // Size utilities
  size: (width: string | number, height?: string | number) => 
    style({ width, height: height ?? width }),
  
  // Border utilities
  border: (width: string | number = 1, borderStyle: string = 'solid', color: string = '#000') => 
    style({ border: `${width}px ${borderStyle} ${color}` }),
  
  // Common combinations
  button: (bgColor: string = '#007bff', textColor: string = 'white') => 
    style({ 
      padding: '8px 16px', 
      backgroundColor: bgColor, 
      color: textColor, 
      border: 'none', 
      borderRadius: 4, 
      cursor: 'pointer',
      fontSize: 14
    }),
  
  input: () => 
    style({ 
      padding: '8px 12px', 
      border: '1px solid #ddd', 
      borderRadius: 4, 
      fontSize: 14 
    }),
  
  card: () => 
    style({ 
      padding: 20, 
      backgroundColor: 'white', 
      borderRadius: 8, 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
    })
};

// CSS-like syntax with template literals
export function css(strings: TemplateStringsArray, ...values: (CSSProperties | Signal<CSSProperties> | string | number)[]): string | Signal<string> {
  // If any value is a signal, return a computed signal
  const hasSignals = values.some(v => typeof v === 'function');
  
  if (hasSignals) {
    return computed(() => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value === 'function') {
          // Handle signal values
          const signalValue = value();
          if (typeof signalValue === 'object') {
            result += convertToCSSString(signalValue);
          } else {
            result += signalValue;
          }
        } else if (typeof value === 'object') {
          // Handle plain CSS objects
          result += convertToCSSString(value);
        } else {
          // Handle strings and numbers
          result += value;
        }
        result += strings[i + 1];
      }
      return result;
    });
  }
  
  // If no signals, return a plain string
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value === 'object') {
      result += convertToCSSString(value);
    } else {
      result += value;
    }
    result += strings[i + 1];
  }
  return result;
} 