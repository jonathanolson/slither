// @ts-expect-error
import { formatHex, toGamut, converter, parse } from 'culori';
import { Color } from 'phet-lib/scenery';

const toRGB = toGamut( 'rgb' );
const okhslConverter = converter( 'okhsl' );

export const okhslToRGBString = ( h: number, s: number, l: number ): string => formatHex( toRGB( {
  mode: 'okhsl',
  h: h,
  s: s,
  l: l
} ) ) as unknown as string;

export const okhslToColor = ( h: number, s: number, l: number ): Color => {
  return new Color( okhslToRGBString( h, s, l ) );
};

export const okhslaToColor = ( h: number, s: number, l: number, a: number ): Color => {
  return new Color( okhslToRGBString( h, s, l ) ).withAlpha( a );
};

export const okhslaToRGBAString = ( h: number, s: number, l: number, a: number ): string => {
  return okhslaToColor( h, s, l, a ).toCSS();
};

export const parseToOKHSL = ( color: string ): { h: number; s: number; l: number } => {
  // @ts-expect-error
  return okhslConverter( parse( color ) );
};
