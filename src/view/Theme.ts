import { BooleanProperty, DerivedProperty, DynamicProperty, isTReadOnlyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Color, Font, PaintColorProperty } from 'phet-lib/scenery';
import { LocalStorageBooleanProperty, LocalStorageNumberProperty, LocalStorageProperty, LocalStorageStringProperty } from '../util/localStorage.ts';
import { RectangularButton } from 'phet-lib/sun';
import { copyToClipboard } from '../util/copyToClipboard.ts';

// Listen to the OS default light/dark mode
const mediaQueryList = window.matchMedia( '(prefers-color-scheme: dark)' );
const isOSDarkModeProperty = new BooleanProperty( mediaQueryList.matches );
mediaQueryList.addEventListener( 'change', e => {
  isOSDarkModeProperty.value = e.matches;
} );

export interface TTheme {
  name: string;
  isEditable: boolean;
  navbarBackgroundColorProperty: PaintColorProperty;
  navbarErrorBackgroundColorProperty: PaintColorProperty;
  playAreaBackgroundColorProperty: PaintColorProperty;
  playAreaLinearTopColorProperty: PaintColorProperty;
  playAreaLinearMiddleColorProperty: PaintColorProperty;
  playAreaLinearBottomColorProperty: PaintColorProperty;
  playAreaRadialInsideColorProperty: PaintColorProperty;
  playAreaRadialOutsideColorProperty: PaintColorProperty;
  puzzleBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundStrokeColorProperty: PaintColorProperty;
  vertexColorProperty: PaintColorProperty;
  xColorProperty: PaintColorProperty;
  blackLineColorProperty: PaintColorProperty;
  redLineColorProperty: PaintColorProperty;
  whiteLineColorProperty: PaintColorProperty;

  // Alpha affects how much the hue gets shifted toward the target color. value and saturation used directly
  simpleRegionTargetColorProperty: PaintColorProperty;

  // TODO: describe the effects of alpha here
  faceColorTargetColorProperty: PaintColorProperty;
  faceColorOutsideColorProperty: PaintColorProperty;
  faceColorInsideColorProperty: PaintColorProperty;
  faceColorDefaultColorProperty: PaintColorProperty;
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
  navbarBackgroundColorProperty: new PaintColorProperty( 'rgb(238,238,238)' ),
  navbarErrorBackgroundColorProperty: new PaintColorProperty( 'rgb(218,107,91)' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( 'rgb(237,237,237)' ),
  playAreaLinearTopColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaLinearMiddleColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaLinearBottomColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaRadialInsideColorProperty: new PaintColorProperty( 'rgba(255,255,255,0)' ),
  playAreaRadialOutsideColorProperty: new PaintColorProperty( 'rgba(173,199,210,0)' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( 'rgb(255,255,255)' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( 'rgb(179,179,179)' ),
  vertexColorProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  xColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  blackLineColorProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  redLineColorProperty: new PaintColorProperty( 'rgb(170,170,170)' ),
  whiteLineColorProperty: new PaintColorProperty( 'rgb(153,153,153)' ),
  simpleRegionTargetColorProperty: new PaintColorProperty( 'rgba(79,140,238,0)' ),
  faceColorTargetColorProperty: new PaintColorProperty( 'rgba(255,229,229,0)' ),
  faceColorOutsideColorProperty: new PaintColorProperty( 'rgb(255,255,255)' ),
  faceColorInsideColorProperty: new PaintColorProperty( 'rgb(230,230,230)' ),
  faceColorDefaultColorProperty: new PaintColorProperty( 'rgb(245,245,245)' ),
  faceValueColorProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  faceValueCompletedColorProperty: new PaintColorProperty( 'rgba(0,0,0,0.2000000000000000111)' ),
  faceValueErrorColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  edgeWeirdColorProperty: new PaintColorProperty( 'rgb(136,136,136)' ),
  uiForegroundProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  uiBackgroundProperty: new PaintColorProperty( 'rgb(255,255,255)' ),
  uiButtonForegroundProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  uiButtonBaseColorProperty: new PaintColorProperty( 'rgb(153,206,255)' ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(220,220,220)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(127,127,127,0.69999999999999995559)' ),
  generateAddedFaceColorProperty: new PaintColorProperty( 'rgb(216,184,241)' ),
  generateMinimizedFaceColorProperty: new PaintColorProperty( 'rgb(173,200,244)' )
};

export const darkTheme = {
  name: 'Dark',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( 'rgb(17,17,17)' ),
  navbarErrorBackgroundColorProperty: new PaintColorProperty( 'rgb(115,44,34)' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( 'rgb(51,51,51)' ),
  playAreaLinearTopColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaLinearMiddleColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaLinearBottomColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaRadialInsideColorProperty: new PaintColorProperty( 'rgba(66,66,66,0.30999999999999999778)' ),
  playAreaRadialOutsideColorProperty: new PaintColorProperty( 'rgba(0,0,0,0.17999999999999999334)' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( 'rgb(26,26,26)' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( 'rgb(89,89,89)' ),
  vertexColorProperty: new PaintColorProperty( 'rgb(119,119,119)' ),
  xColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  blackLineColorProperty: new PaintColorProperty( 'rgb(170,170,170)' ),
  redLineColorProperty: new PaintColorProperty( 'rgb(68,68,68)' ),
  whiteLineColorProperty: new PaintColorProperty( 'rgb(85,85,85)' ),
  simpleRegionTargetColorProperty: new PaintColorProperty( 'rgba(207,80,128,0)' ),
  faceColorTargetColorProperty: new PaintColorProperty( 'rgba(74,18,18,0)' ),
  faceColorOutsideColorProperty: new PaintColorProperty( 'rgb(26,26,26)' ),
  faceColorInsideColorProperty: new PaintColorProperty( 'rgb(40,40,40)' ),
  faceColorDefaultColorProperty: new PaintColorProperty( 'rgb(31,31,31)' ),
  faceValueColorProperty: new PaintColorProperty( 'rgb(204,204,204)' ),
  faceValueCompletedColorProperty: new PaintColorProperty( 'rgba(217,217,217,0.14000000000000001332)' ),
  faceValueErrorColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  edgeWeirdColorProperty: new PaintColorProperty( 'rgb(136,136,136)' ),
  uiForegroundProperty: new PaintColorProperty( 'rgb(204,204,204)' ),
  uiBackgroundProperty: new PaintColorProperty( 'rgb(34,34,34)' ),
  uiButtonForegroundProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  uiButtonBaseColorProperty: new PaintColorProperty( 'rgb(206,119,67)' ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(128,128,128)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(60,60,60,0.69999999999999995559)' ),
  generateAddedFaceColorProperty: new PaintColorProperty( 'rgb(92,42,123)' ),
  generateMinimizedFaceColorProperty: new PaintColorProperty( 'rgb(33,68,126)' )
};

export const fadeLightTheme = {
  ...lightTheme,
  name: 'Fade Light',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( 'rgb(33,33,33)' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( 'rgb(204,204,204)' ),
  playAreaLinearTopColorProperty: new PaintColorProperty( 'rgba(255,102,0,0.36999999999999999556)' ),
  playAreaLinearMiddleColorProperty: new PaintColorProperty( 'rgba(255,0,200,0.3499999999999999778)' ),
  playAreaLinearBottomColorProperty: new PaintColorProperty( 'rgba(0,17,255,0.34000000000000002442)' ),
  playAreaRadialInsideColorProperty: new PaintColorProperty( 'rgba(255,255,255,0)' ),
  playAreaRadialOutsideColorProperty: new PaintColorProperty( 'rgba(255,255,255,0.79000000000000003553)' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( 'rgb(148,148,148)' ),
};

export const fadeDarkTheme = {
  ...darkTheme,
  name: 'Fade Dark',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( 'rgb(17,17,17)' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( 'rgb(255,255,255)' ),
  playAreaLinearTopColorProperty: new PaintColorProperty( 'rgba(255,102,0,0.64000000000000001332)' ),
  playAreaLinearMiddleColorProperty: new PaintColorProperty( 'rgba(255,0,208,0.54000000000000003553)' ),
  playAreaLinearBottomColorProperty: new PaintColorProperty( 'rgba(4,0,255,0.42999999999999999334)' ),
  playAreaRadialInsideColorProperty: new PaintColorProperty( 'rgba(0,0,0,0.46999999999999997335)' ),
  playAreaRadialOutsideColorProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( 'rgb(24,23,22)' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( 'rgb(92,51,40)' ),
  whiteLineColorProperty: new PaintColorProperty( 'rgb(78,73,70)' ),
};

export const purplesDarkTheme = {
  name: 'Purples Dark',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( 'rgb(97,67,133)' ),
  navbarErrorBackgroundColorProperty: new PaintColorProperty( 'rgb(115,44,34)' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( 'rgb(51,51,51)' ),
  playAreaLinearTopColorProperty: new PaintColorProperty( 'rgb(97,67,133)' ),
  playAreaLinearMiddleColorProperty: new PaintColorProperty( 'rgb(89,84,142)' ),
  playAreaLinearBottomColorProperty: new PaintColorProperty( 'rgb(81,99,149)' ),
  playAreaRadialInsideColorProperty: new PaintColorProperty( 'rgba(0,0,0,0.42999999999999999334)' ),
  playAreaRadialOutsideColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( 'rgb(34,34,34)' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( 'rgb(153,142,180)' ),
  vertexColorProperty: new PaintColorProperty( 'rgb(119,119,119)' ),
  xColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  blackLineColorProperty: new PaintColorProperty( 'rgb(170,170,170)' ),
  redLineColorProperty: new PaintColorProperty( 'rgb(68,68,68)' ),
  whiteLineColorProperty: new PaintColorProperty( 'rgb(85,85,85)' ),
  simpleRegionTargetColorProperty: new PaintColorProperty( 'rgba(163,79,232,0.56000000000000005329)' ),
  faceColorTargetColorProperty: new PaintColorProperty( 'rgba(40,0,0,0)' ),
  faceColorOutsideColorProperty: new PaintColorProperty( 'rgba(15,15,15,1)' ),
  faceColorInsideColorProperty: new PaintColorProperty( 'rgba(50,50,50,1)' ),
  faceColorDefaultColorProperty: new PaintColorProperty( 'rgb(31,31,31)' ),
  faceValueColorProperty: new PaintColorProperty( 'rgb(204,204,204)' ),
  faceValueCompletedColorProperty: new PaintColorProperty( 'rgb(85,85,85)' ),
  faceValueErrorColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  edgeWeirdColorProperty: new PaintColorProperty( 'rgb(136,136,136)' ),
  uiForegroundProperty: new PaintColorProperty( 'rgb(204,204,204)' ),
  uiBackgroundProperty: new PaintColorProperty( 'rgb(34,34,34)' ),
  uiButtonForegroundProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  uiButtonBaseColorProperty: new PaintColorProperty( 'rgb(95,129,196)' ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(128,128,128)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(60,60,60,0.69999999999999995559)' ),
  generateAddedFaceColorProperty: new PaintColorProperty( 'rgb(92,42,123)' ),
  generateMinimizedFaceColorProperty: new PaintColorProperty( 'rgb(33,68,126)' )
};

export const nightVisionTheme = {
  name: 'Night Vision',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty( 'rgb(31,0,2)' ),
  navbarErrorBackgroundColorProperty: new PaintColorProperty( 'rgb(103,39,4)' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( 'rgb(28,0,0)' ),
  playAreaLinearTopColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaLinearMiddleColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaLinearBottomColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  playAreaRadialInsideColorProperty: new PaintColorProperty( 'rgba(66,66,66,0)' ),
  playAreaRadialOutsideColorProperty: new PaintColorProperty( 'rgba(0,0,0,0)' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( 'rgb(68,18,18)' ),
  vertexColorProperty: new PaintColorProperty( 'rgb(117,0,0)' ),
  xColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  blackLineColorProperty: new PaintColorProperty( 'rgb(170,170,170)' ),
  redLineColorProperty: new PaintColorProperty( 'rgb(68,68,68)' ),
  whiteLineColorProperty: new PaintColorProperty( 'rgb(117,60,41)' ),
  simpleRegionTargetColorProperty: new PaintColorProperty( 'rgba(189,0,0,0.64000000000000001332)' ),
  faceColorTargetColorProperty: new PaintColorProperty( 'rgba(40,0,0,0)' ),
  faceColorOutsideColorProperty: new PaintColorProperty( 'rgba(15,15,15,1)' ),
  faceColorInsideColorProperty: new PaintColorProperty( 'rgba(50,50,50,1)' ),
  faceColorDefaultColorProperty: new PaintColorProperty( 'rgb(31,31,31)' ),
  faceValueColorProperty: new PaintColorProperty( 'rgb(179,0,0)' ),
  faceValueCompletedColorProperty: new PaintColorProperty( 'rgb(46,0,0)' ),
  faceValueErrorColorProperty: new PaintColorProperty( 'rgb(255,0,0)' ),
  edgeWeirdColorProperty: new PaintColorProperty( 'rgb(75,58,58)' ),
  uiForegroundProperty: new PaintColorProperty( 'rgb(163,0,0)' ),
  uiBackgroundProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  uiButtonForegroundProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  uiButtonBaseColorProperty: new PaintColorProperty( 'rgb(153,0,0)' ),
  uiButtonDisabledColorProperty: new PaintColorProperty( 'rgb(0,0,0)' ),
  barrierColorProperty: new PaintColorProperty( 'rgba(0,0,0,0.69999999999999995559)' ),
  generateAddedFaceColorProperty: new PaintColorProperty( 'rgb(92,42,123)' ),
  generateMinimizedFaceColorProperty: new PaintColorProperty( 'rgb(33,68,126)' )
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
  autoTheme,
  fadeLightTheme,
  fadeDarkTheme,
  purplesDarkTheme,
  nightVisionTheme
];

// TODO: auto theme based on system settings (keep EVERYTHING basically a Property)

export const themeProperty = new LocalStorageProperty<TTheme>( 'theme', {
  serialize: theme => theme.name,
  deserialize: name => availableThemes.find( theme => theme.name === name ) ?? autoTheme
} );
// @ts-expect-error - Allow this globally
window.themeProperty = themeProperty;

export const themeToJS = ( theme: TTheme ) => {
  const keyValueStringMap: Record<string, string> = {};
  Object.keys( theme ).forEach( key => {
    const prop = theme[ key as keyof TTheme ];
    if ( prop instanceof PaintColorProperty ) {
      keyValueStringMap[ key ] = `new PaintColorProperty( '${prop.value.toCSS()}' )`;
    }
    else if ( typeof prop === 'string' ) {
      keyValueStringMap[ key ] = `'${prop}'`;
    }
    else {
      // TODO: better support?
      keyValueStringMap[ key ] = JSON.stringify( prop, null, 2 );
    }
  } );

  return `{\n${Object.keys( keyValueStringMap ).map( key => `  ${key}: ${keyValueStringMap[ key ]}` ).join( ',\n' )}\n}`;
};

export const popupColorEditor = ( theme: TTheme ) => {

  const div = document.createElement( 'div' );
  // @ts-expect-error
  div.style.zoom = '0.8';
  div.style.backgroundColor = 'rgba(127,127,127,0.3)';

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

  // Copy to clipboard
  const copyToClipboardButton = document.createElement( 'button' );
  copyToClipboardButton.textContent = 'Copy to Clipboard';
  copyToClipboardButton.addEventListener( 'click', () => {
    copyToClipboard( themeToJS( theme ) );
  } );
  div.appendChild( copyToClipboardButton );

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
      alphaSlider.style.marginRight = '10px';
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

export const playAreaLinearTopColorProperty = new DynamicProperty( themeProperty, {
  derive: 'playAreaLinearTopColorProperty'
} ) as TReadOnlyProperty<Color>;

export const playAreaLinearMiddleColorProperty = new DynamicProperty( themeProperty, {
  derive: 'playAreaLinearMiddleColorProperty'
} ) as TReadOnlyProperty<Color>;

export const playAreaLinearBottomColorProperty = new DynamicProperty( themeProperty, {
  derive: 'playAreaLinearBottomColorProperty'
} ) as TReadOnlyProperty<Color>;

export const playAreaRadialInsideColorProperty = new DynamicProperty( themeProperty, {
  derive: 'playAreaRadialInsideColorProperty'
} ) as TReadOnlyProperty<Color>;

export const playAreaRadialOutsideColorProperty = new DynamicProperty( themeProperty, {
  derive: 'playAreaRadialOutsideColorProperty'
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

export const simpleRegionTargetColorProperty = new DynamicProperty( themeProperty, {
  derive: 'simpleRegionTargetColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceColorTargetColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceColorTargetColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceColorOutsideColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceColorOutsideColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceColorInsideColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceColorInsideColorProperty'
} ) as TReadOnlyProperty<Color>;

export const faceColorDefaultColorProperty = new DynamicProperty( themeProperty, {
  derive: 'faceColorDefaultColorProperty'
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

export const faceColorsVisibleProperty = new LocalStorageBooleanProperty( 'faceColorsVisibleProperty', true );
export const redLineVisibleProperty = new LocalStorageBooleanProperty( 'redLineVisibleProperty', false );
export const whiteLineVisibleProperty = new LocalStorageBooleanProperty( 'whiteLineVisibleProperty', true );
export const verticesVisibleProperty = new LocalStorageBooleanProperty( 'verticesVisibleProperty', false );
export const redXsVisibleProperty = new LocalStorageBooleanProperty( 'redXsVisibleProperty', false );
export const redXsAlignedProperty = new LocalStorageBooleanProperty( 'redXsAlignedProperty', false );

export const faceColorThresholdProperty = new LocalStorageNumberProperty( 'faceColorThresholdProperty', 2 );

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
