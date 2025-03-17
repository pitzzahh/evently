export type TagVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export function makeTag(text = '', width = 30, variant: TagVariant = 'default') {
  // Define color schemes for each variant
  const variantStyles = {
    default: {
      backgroundColor: '#990876', // primary
      lineColor: '#B08BCD',
      textColor: '#FFFFFF'
    },
    secondary: {
      backgroundColor: '#6E6E6E', // secondary
      lineColor: '#A0A0A0',
      textColor: '#FFFFFF'
    },
    destructive: {
      backgroundColor: '#EF4444', // destructive
      lineColor: '#F87171',
      textColor: '#FFFFFF'
    },
    outline: {
      backgroundColor: 'transparent',
      lineColor: '#6E6E6E',
      textColor: '#6E6E6E'
    }
  };

  // Get the style for the selected variant
  const style = variantStyles[variant];

  let canvas = {
    type: 'rect',
    x: 0,
    y: 0,
    w: width,
    h: 14,
    r: 7,
    color: style.backgroundColor,
    lineColor: style.lineColor,
  }
  let column = {
    text,
    width,
    color: style.textColor,
    alignment: 'center',
    noWrap: true,
    maxHeight: 16,
    bold: true
  }
  return {
    stack: [
      { canvas: [canvas] },
      {
        columns: [column],
        relativePosition: { y: -11 },
        style: { fontSize: 7, bold: true }
      }
    ]
  }
}