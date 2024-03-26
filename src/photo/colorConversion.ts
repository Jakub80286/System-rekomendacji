import * as convert from 'color-convert';

export const rgbToCIELAB = (red: number, green: number, blue: number): [number, number, number] => {
    if (red === 0 && green === 0 && blue === 0) {
      return [0, 0, 0]; 
    }
    const [l, a, b] = convert.rgb.lab(red, green, blue);
    return [l, a, b];
  };