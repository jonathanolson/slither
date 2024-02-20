import { BooleanProperty, DerivedProperty, DynamicProperty, isTReadOnlyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Color, PaintColorProperty } from 'phet-lib/scenery';
import { LocalStorageProperty } from '../util/localStorage.ts';

// @ts-ignore
import { formatHex, toGamut } from 'culori';

const toRGB = toGamut( 'rgb' );

const hslToRGB = ( h: number, s: number, l: number ): string => formatHex( toRGB( {
  mode: 'okhsl',
  h: h,
  s: s,
  l: l
} ) ) as unknown as string;
// @ts-ignore - Allow this globally
window.hslToRGB = hslToRGB;

// e.g. to test colors:
// themeProperty.value.uiButtonBaseColorProperty.paint = hslToRGB( 20, 0.7, 0.5 );

// Listen to the OS default light/dark mode
const mediaQueryList = window.matchMedia( '(prefers-color-scheme: dark)' );
const isOSDarkModeProperty = new BooleanProperty( mediaQueryList.matches );
mediaQueryList.addEventListener( 'change', e => {
  isOSDarkModeProperty.value = e.matches
} );
isOSDarkModeProperty.link( isDark => console.log( 'OS dark mode:', isDark ) );

export interface TTheme {
  name: string;
  navbarBackgroundColorProperty: PaintColorProperty;
  playAreaBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundStrokeColorProperty: PaintColorProperty;
  vertexColorProperty: PaintColorProperty;
  xColorProperty: PaintColorProperty;
  lineColorProperty: PaintColorProperty;
  faceValueColorProperty: PaintColorProperty;
  faceValueCompletedColorProperty: PaintColorProperty;
  faceValueErrorColorProperty: PaintColorProperty;
  edgeWeirdColorProperty: PaintColorProperty;
  uiForegroundProperty: PaintColorProperty;
  uiBackgroundProperty: PaintColorProperty;
  uiButtonForegroundProperty: PaintColorProperty;
  uiButtonBaseColorProperty: PaintColorProperty;
  uiButtonDisabledColorProperty: PaintColorProperty;
  barrierColorProperty: PaintColorProperty;

  // TODO: can we actually use rainbow colors (culori-based) for the UI button colors?!? ZOMG

  // TODO: properties for UI color generation (and whether we should use regions or not)
}

// TODO: the region/not switch SHOULD be actually an independent LocalStorageProperty.

export const lightTheme = {
  name: 'Light',
  navbarBackgroundColorProperty: new PaintColorProperty( '#eee' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( '#ccc' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( '#fff' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( '#888' ),
  vertexColorProperty: new PaintColorProperty( '#000' ),
  xColorProperty: new PaintColorProperty( '#f00' ),
  lineColorProperty: new PaintColorProperty( '#000' ),
  faceValueColorProperty: new PaintColorProperty( '#000' ),
  faceValueCompletedColorProperty: new PaintColorProperty( '#aaa' ),
  faceValueErrorColorProperty: new PaintColorProperty( '#f00' ),
  edgeWeirdColorProperty: new PaintColorProperty( '#888' ),
  uiForegroundProperty: new PaintColorProperty( '#000' ),
  uiBackgroundProperty: new PaintColorProperty( '#fff' ),
  uiButtonForegroundProperty: new PaintColorProperty( '#000' ),
  uiButtonBaseColorProperty: new PaintColorProperty( 'rgb(153,206,255)' ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(220,220,220)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(127,127,127,0.7)' )
};

export const darkTheme = {
  name: 'Dark',
  navbarBackgroundColorProperty: new PaintColorProperty( '#111' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( '#333' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( '#222' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( '#777' ),
  vertexColorProperty: new PaintColorProperty( '#888' ),
  xColorProperty: new PaintColorProperty( '#f00' ),
  lineColorProperty: new PaintColorProperty( '#aaa' ),
  faceValueColorProperty: new PaintColorProperty( '#ccc' ),
  faceValueCompletedColorProperty: new PaintColorProperty( '#888' ),
  faceValueErrorColorProperty: new PaintColorProperty( '#f00' ),
  edgeWeirdColorProperty: new PaintColorProperty( '#888' ),
  uiForegroundProperty: new PaintColorProperty( '#ccc' ),
  uiBackgroundProperty: new PaintColorProperty( '#222' ),
  uiButtonForegroundProperty: new PaintColorProperty( '#000' ),
  uiButtonBaseColorProperty: new PaintColorProperty( hslToRGB( 50, 0.7, 0.6 ) ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(128,128,128)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(60,60,60,0.7)' )
};

export const autoTheme = {
  name: 'Auto'
} as TTheme;
Object.keys( lightTheme ).forEach( key => {
  // @ts-ignore
  if ( isTReadOnlyProperty( lightTheme[ key ] ) ) {
    // @ts-ignore
    autoTheme[ key ] = new DerivedProperty( [
      isOSDarkModeProperty,
      // @ts-ignore
      lightTheme[ key ],
      // @ts-ignore
      darkTheme[ key ]
    ], ( isDark: boolean, light: Color, dark: Color ) => isDark ? dark : light );

    // TODO: this is somehow giving null.... sign of a bigger bug?
    // autoTheme[ key ] = new DynamicProperty( isOSDarkModeProperty, {
    //   // derive: ( isDark: boolean ) => isDark ? darkTheme[ key ] : lightTheme[ key ]
    //   derive: ( isDark: boolean ) => {
    //     const prop = isDark ? darkTheme[ key ] : lightTheme[ key ];
    //     if ( !( prop instanceof Property ) ) {
    //       debugger;
    //     }
    //     return prop;
    //   }
    // } );
  }
} );

// Mostly so we get type checking
export const availableThemes: TTheme[] = [
  lightTheme,
  darkTheme,
  autoTheme
];

// TODO: auto theme based on system settings (keep EVERYTHING basically a Property)

export const themeProperty = new LocalStorageProperty<TTheme>( 'theme', {
  serialize: theme => theme.name,
  deserialize: name => availableThemes.find( theme => theme.name === name ) || autoTheme
} );
// @ts-ignore - Allow this globally
window.themeProperty = themeProperty;

export const navbarBackgroundColorProperty = new DynamicProperty( themeProperty, {
  derive: 'navbarBackgroundColorProperty'
} ) as TReadOnlyProperty<Color>; // TODO: why is this necessary?

export const playAreaBackgroundColorProperty = new DynamicProperty( themeProperty, {
  derive: 'playAreaBackgroundColorProperty'
} ) as TReadOnlyProperty<Color>;

export const puzzleBackgroundColorProperty = new DynamicProperty( themeProperty, {
  derive: 'puzzleBackgroundColorProperty'
} ) as TReadOnlyProperty<Color>;

export const puzzleBackgroundStrokeColorProperty = new DynamicProperty( themeProperty, {
  derive: 'puzzleBackgroundStrokeColorProperty'
} ) as TReadOnlyProperty<Color>;

export const vertexColorProperty = new DynamicProperty( themeProperty, {
  derive: 'vertexColorProperty'
} ) as TReadOnlyProperty<Color>;

export const xColorProperty = new DynamicProperty( themeProperty, {
  derive: 'xColorProperty'
} ) as TReadOnlyProperty<Color>;

export const lineColorProperty = new DynamicProperty( themeProperty, {
  derive: 'lineColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceValueColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceValueColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceValueCompletedColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceValueCompletedColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceValueErrorColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceValueErrorColorProperty'
} ) as TReadOnlyProperty<Color>;

export const edgeWeirdColorProperty = new DynamicProperty( themeProperty, {
  derive: 'edgeWeirdColorProperty'
} ) as TReadOnlyProperty<Color>;

export const uiForegroundProperty = new DynamicProperty( themeProperty, {
  derive: 'uiForegroundProperty'
} ) as TReadOnlyProperty<Color>;

export const uiBackgroundProperty = new DynamicProperty( themeProperty, {
  derive: 'uiBackgroundProperty'
} ) as TReadOnlyProperty<Color>;

export const uiButtonForegroundProperty = new DynamicProperty( themeProperty, {
  derive: 'uiButtonForegroundProperty'
} ) as TReadOnlyProperty<Color>;

export const uiButtonBaseColorProperty = new DynamicProperty( themeProperty, {
  derive: 'uiButtonBaseColorProperty'
} ) as TReadOnlyProperty<Color>;

export const uiButtonDisabledColorProperty = new DynamicProperty( themeProperty, {
  derive: 'uiButtonDisabledColorProperty'
} ) as TReadOnlyProperty<Color>;

export const barrierColorProperty = new DynamicProperty( themeProperty, {
  derive: 'barrierColorProperty'
} ) as TReadOnlyProperty<Color>;
