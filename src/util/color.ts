// @ts-expect-error
import { formatHex, toGamut } from 'culori';

const toRGB = toGamut( 'rgb' );

export const okhslToRGBString = ( h: number, s: number, l: number ): string => formatHex( toRGB( {
  mode: 'okhsl',
  h: h,
  s: s,
  l: l
} ) ) as unknown as string;
