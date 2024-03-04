import { BooleanProperty, DerivedProperty, DynamicProperty, isTReadOnlyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Color, Font, PaintColorProperty } from 'phet-lib/scenery';
import { LocalStorageBooleanProperty, LocalStorageProperty, LocalStorageStringProperty } from '../util/localStorage.ts';
import { RectangularButton } from 'phet-lib/sun';
import { okhslToRGBString } from '../util/color.ts';

// Listen to the OS default light/dark mode
const mediaQueryList = window.matchMedia( '(prefers-color-scheme: dark)' );
const isOSDarkModeProperty = new BooleanProperty( mediaQueryList.matches );
mediaQueryList.addEventListener( 'change', e => {
  isOSDarkModeProperty.value = e.matches;
} );
// isOSDarkModeProperty.link( isDark => console.log( 'OS dark mode:', isDark ) );

export interface TTheme {
  name: string;
  isEditable: boolean;
  navbarBackgroundColorProperty: PaintColorProperty;
  navbarErrorBackgroundColorProperty: PaintColorProperty;
  playAreaBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundStrokeColorProperty: PaintColorProperty;
  vertexColorProperty: PaintColorProperty;
  xColorProperty: PaintColorProperty;
  blackLineColorProperty: PaintColorProperty;
  redLineColorProperty: PaintColorProperty;
  whiteLineColorProperty: PaintColorProperty;
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
  generateAddedFaceColorProperty: PaintColorProperty;
  generateMinimizedFaceColorProperty: PaintColorProperty;

  // TODO: can we actually use rainbow colors (culori-based) for the UI button colors?!? ZOMG

  // TODO: properties for UI color generation (and whether we should use regions or not)
}

// TODO: the region/not switch SHOULD be actually an independent LocalStorageProperty.

export const lightTheme = {
  name: 'Light',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( '#eee' ),
  navbarErrorBackgroundColorProperty: new PaintColorProperty( okhslToRGBString( 30, 0.7, 0.6 ) ),
  playAreaBackgroundColorProperty: new PaintColorProperty( '#ccc' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( '#fff' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( '#888' ),
  vertexColorProperty: new PaintColorProperty( '#000' ),
  xColorProperty: new PaintColorProperty( '#f00' ),
  blackLineColorProperty: new PaintColorProperty( '#000' ),
  redLineColorProperty: new PaintColorProperty( '#aaa' ),
  whiteLineColorProperty: new PaintColorProperty( '#999' ),
  faceValueColorProperty: new PaintColorProperty( '#000' ),
  faceValueCompletedColorProperty: new PaintColorProperty( '#aaa' ),
  faceValueErrorColorProperty: new PaintColorProperty( '#f00' ),
  edgeWeirdColorProperty: new PaintColorProperty( '#888' ),
  uiForegroundProperty: new PaintColorProperty( '#000' ),
  uiBackgroundProperty: new PaintColorProperty( '#fff' ),
  uiButtonForegroundProperty: new PaintColorProperty( '#000' ),
  uiButtonBaseColorProperty: new PaintColorProperty( 'rgb(153,206,255)' ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(220,220,220)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(127,127,127,0.7)' ),
  generateAddedFaceColorProperty: new PaintColorProperty( okhslToRGBString( 360 - 50, 0.7, 0.8 ) ),
  generateMinimizedFaceColorProperty: new PaintColorProperty( okhslToRGBString( 360 - 100, 0.7, 0.8 ) )
};

export const darkTheme = {
  name: 'Dark',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( '#111' ),
  navbarErrorBackgroundColorProperty: new PaintColorProperty( okhslToRGBString( 30, 0.7, 0.3 ) ),
  playAreaBackgroundColorProperty: new PaintColorProperty( '#333' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( '#222' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( '#777' ),
  vertexColorProperty: new PaintColorProperty( '#777' ),
  xColorProperty: new PaintColorProperty( '#f00' ),
  blackLineColorProperty: new PaintColorProperty( '#aaa' ),
  redLineColorProperty: new PaintColorProperty( '#444' ),
  whiteLineColorProperty: new PaintColorProperty( '#555' ),
  faceValueColorProperty: new PaintColorProperty( '#ccc' ),
  faceValueCompletedColorProperty: new PaintColorProperty( '#555' ),
  faceValueErrorColorProperty: new PaintColorProperty( '#f00' ),
  edgeWeirdColorProperty: new PaintColorProperty( '#888' ),
  uiForegroundProperty: new PaintColorProperty( '#ccc' ),
  uiBackgroundProperty: new PaintColorProperty( '#222' ),
  uiButtonForegroundProperty: new PaintColorProperty( '#000' ),
  uiButtonBaseColorProperty: new PaintColorProperty( okhslToRGBString( 50, 0.7, 0.6 ) ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(128,128,128)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(60,60,60,0.7)' ),
  generateAddedFaceColorProperty: new PaintColorProperty( okhslToRGBString( 360 - 50, 0.7, 0.3 ) ),
  generateMinimizedFaceColorProperty: new PaintColorProperty( okhslToRGBString( 360 - 100, 0.7, 0.3 ) )
};

export const autoTheme = {
  name: 'Auto',
  isEditable: false
} as TTheme;
Object.keys( lightTheme ).forEach( key => {
  // @ts-expect-error
  if ( isTReadOnlyProperty( lightTheme[ key ] ) ) {
    // @ts-expect-error
    autoTheme[ key ] = new DerivedProperty( [
      isOSDarkModeProperty,
      // @ts-expect-error
      lightTheme[ key ],
      // @ts-expect-error
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
  deserialize: name => availableThemes.find( theme => theme.name === name ) ?? autoTheme
} );
// @ts-expect-error - Allow this globally
window.themeProperty = themeProperty;

export const popupColorEditor = ( theme: TTheme ) => {

  const div = document.createElement( 'div' );

  // Close button
  const closeButton = document.createElement( 'button' );
  closeButton.textContent = 'Close';
  closeButton.addEventListener( 'click', () => {
    document.body.removeChild( div );
  } );
  div.appendChild( closeButton );

  const colorContainer = document.createElement( 'div' );

  // Toggle view button (toggles colorContainer)
  const toggleButton = document.createElement( 'button' );
  toggleButton.textContent = 'Toggle Visibility';
  toggleButton.addEventListener( 'click', () => {
    colorContainer.style.display = colorContainer.style.display === 'none' ? 'block' : 'none';
  } );
  div.appendChild( toggleButton );

  div.appendChild( colorContainer );

  Object.keys( theme ).forEach( key => {
    const prop = theme[ key as keyof TTheme ];
    if ( prop instanceof PaintColorProperty ) {
      const section = document.createElement( 'div' );

      const input = document.createElement( 'input' );
      input.type = 'color';
      input.value = prop.value.withAlpha( 1 ).toHexString();

      input.style.margin = '1px';
      input.style.marginRight = '10px';

      const initialAlpha = prop.value.alpha;

      const alphaSlider = document.createElement( 'input' );
      const alphaSliderReadout = document.createElement( 'span' );

      alphaSlider.style.width = '100px';
      alphaSlider.type = 'range';
      alphaSlider.min = '0';
      alphaSlider.max = '1';
      alphaSlider.step = '0.01';
      alphaSlider.value = `${initialAlpha}`;
      alphaSliderReadout.innerText = initialAlpha.toFixed( 2 );

      const updateColor = () => {
        const alpha = alphaSlider.valueAsNumber;
        alphaSliderReadout.innerText = alpha.toFixed( 2 );
        prop.value = new Color( input.value ).withAlpha( alpha );
      };
      input.addEventListener( 'input', updateColor );
      alphaSlider.addEventListener( 'input', updateColor );

      section.appendChild( input );
      section.appendChild( alphaSliderReadout );
      section.appendChild( alphaSlider );
      section.appendChild( document.createTextNode( key ) );

      colorContainer.appendChild( section );
    }
  } );

  document.body.appendChild( div );
  div.style.position = 'absolute';
  div.style.zIndex = '100000';
};

export const navbarBackgroundColorProperty = new DynamicProperty( themeProperty, {
  derive: 'navbarBackgroundColorProperty'
} ) as TReadOnlyProperty<Color>; // TODO: why is this necessary?

export const navbarErrorBackgroundColorProperty = new DynamicProperty( themeProperty, {
  derive: 'navbarErrorBackgroundColorProperty'
} ) as TReadOnlyProperty<Color>;

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

export const blackLineColorProperty = new DynamicProperty( themeProperty, {
  derive: 'blackLineColorProperty'
} ) as TReadOnlyProperty<Color>;

export const redLineColorProperty = new DynamicProperty( themeProperty, {
  derive: 'redLineColorProperty'
} ) as TReadOnlyProperty<Color>;

export const whiteLineColorProperty = new DynamicProperty( themeProperty, {
  derive: 'whiteLineColorProperty'
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

export const uiForegroundColorProperty = new DynamicProperty( themeProperty, {
  derive: 'uiForegroundProperty'
} ) as TReadOnlyProperty<Color>;

export const uiBackgroundColorProperty = new DynamicProperty( themeProperty, {
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

export const generateAddedFaceColorProperty = new DynamicProperty( themeProperty, {
  derive: 'generateAddedFaceColorProperty'
} ) as TReadOnlyProperty<Color>;

export const generateMinimizedFaceColorProperty = new DynamicProperty( themeProperty, {
  derive: 'generateMinimizedFaceColorProperty'
} ) as TReadOnlyProperty<Color>;

const useFlatButtons = true;
export const rectangularButtonAppearanceStrategy = useFlatButtons ? RectangularButton.FlatAppearanceStrategy : RectangularButton.ThreeDAppearanceStrategy;

export const controlBarFont = new Font( {
  family: 'sans-serif',
  // weight: 'bold',
  size: 15
} );

export const uiFont = new Font( {
  family: 'sans-serif',
  size: 16
} );

export const uiHeaderFont = new Font( {
  family: 'sans-serif',
  size: 16,
  weight: 'bold'
} );

export const puzzleFont = new Font( {
  family: 'sans-serif',
  size: 25
} );

export const generateButtonFont = new Font( {
  family: 'sans-serif',
  size: 25
} );

export const redLineVisibleProperty = new LocalStorageBooleanProperty( 'redLineVisibleProperty', false );
export const whiteLineVisibleProperty = new LocalStorageBooleanProperty( 'whiteLineVisibleProperty', true );
export const verticesVisibleProperty = new LocalStorageBooleanProperty( 'verticesVisibleProperty', false );
export const redXsVisibleProperty = new LocalStorageBooleanProperty( 'redXsVisibleProperty', false );
export const redXsAlignedProperty = new LocalStorageBooleanProperty( 'redXsAlignedProperty', false );

export const lineJoins = [ 'miter', 'round', 'bevel' ] as const;
export type TLineJoin = typeof lineJoins[ number ];
export const joinedLinesJoinProperty = new LocalStorageStringProperty<TLineJoin>( 'joinedLinesJoinProperty', 'round' );

// TODO: add a value for "cut out" (based on the other line segments going into it)
// TODO: name "faceted"?
// TODO: actually, we can have "faceted exclude" and "faceted include" (include has all the parts of a faceted vertex)
export const lineCaps = [ 'butt', 'round', 'square' ] as const;
export type TLineCap = typeof lineCaps[ number ];
export const joinedLinesCapProperty = new LocalStorageStringProperty<TLineCap>( 'joinedLinesCapProperty', 'round' );

// TODO: add a "faceted" option (which will be... SQUARE for square puzzles)
export const vertexStyles = [ 'round', 'square' ] as const;
export type TVertexStyle = typeof vertexStyles[ number ];
export const vertexStyleProperty = new LocalStorageStringProperty<TVertexStyle>( 'vertexStyleProperty', 'round' );

export const redLineStyles = [ 'full', 'gap', 'middle' ] as const;
export type TRedLineStyle = typeof redLineStyles[ number ];
export const redLineStyleProperty = new LocalStorageStringProperty<TRedLineStyle>( 'redLineStyleProperty', 'middle' );

export const faceValueStyles = [ 'static', 'remaining', 'ratio' ] as const;
export type TFaceValueStyle = typeof faceValueStyles[ number ];
export const faceValueStyleProperty = new LocalStorageStringProperty<TFaceValueStyle>( 'faceValueStyleProperty', 'static' );

export const smallVertexProperty = new LocalStorageBooleanProperty( 'smallVertexProperty', true );

export const controlBarMargin = 5;
