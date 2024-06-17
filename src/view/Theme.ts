import { BooleanProperty, DerivedProperty, DynamicProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { platform } from 'phet-lib/phet-core';
import { Color, Font, PaintColorProperty } from 'phet-lib/scenery';
import { RectangularButton } from 'phet-lib/sun';

import { okhslToRGBString, parseToOKHSL } from '../util/color.ts';
import { copyToClipboard } from '../util/copyToClipboard.ts';
import {
  LocalStorageBooleanProperty,
  LocalStorageNumberProperty,
  LocalStorageProperty,
  LocalStorageStringProperty,
} from '../util/localStorage.ts';

import _ from '../workarounds/_.ts';

// Listen to the OS default light/dark mode
const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
const isOSDarkModeProperty = new BooleanProperty(mediaQueryList.matches);
mediaQueryList.addEventListener('change', (e) => {
  isOSDarkModeProperty.value = e.matches;
});

export const themeColorPropertyNames = [
  'navbarBackgroundColorProperty',
  'playAreaBackgroundColorProperty',
  'playAreaLinearTopColorProperty',
  'playAreaLinearMiddleColorProperty',
  'playAreaLinearBottomColorProperty',
  'playAreaRadialInsideColorProperty',
  'playAreaRadialOutsideColorProperty',
  'puzzleBackgroundColorProperty',
  'puzzleBackgroundStrokeColorProperty',
  'vertexColorProperty',
  'xColorProperty',
  'blackLineColorProperty',
  'redLineColorProperty',
  'whiteLineColorProperty',
  'selectedFaceColorHighlightColorProperty',
  'selectedSectorEditColorProperty',

  // Alpha affects how much the hue gets shifted toward the target color. value and saturation used directly
  'simpleRegionTargetColorProperty',

  // TODO: describe the effects of alpha here
  'faceColorBasicTargetColorProperty',
  'faceColorLightTargetColorProperty',
  'faceColorDarkTargetColorProperty',
  'faceColorOutsideColorProperty',
  'faceColorInsideColorProperty',
  'faceColorDefaultColorProperty',

  'sectorOnlyOneColorProperty',
  'sectorNotOneColorProperty',
  'sectorNotZeroColorProperty',
  'sectorNotTwoColorProperty',
  'sectorOtherColorProperty',

  'vertexStateLineProperty',
  'vertexStateBackgroundProperty',
  'vertexStateOutlineProperty',
  'vertexStatePointProperty',

  'faceValueColorProperty',
  'faceValueCompletedColorProperty',
  'faceValueErrorColorProperty',
  'faceValueRatioColorProperty',
  'edgeWeirdColorProperty',
  'incorrectEdgeColorProperty',
  'incorrectFaceColorProperty',

  'uiForegroundColorProperty',
  'uiBackgroundColorProperty',
  'uiButtonForegroundProperty',
  'uiButtonInvertedForegroundProperty',
  'uiButtonBaseColorProperty',
  'uiButtonDisabledColorProperty',
  'uiButtonSelectedStrokeColorProperty',
  'uiButtonDeselectedStrokeColorProperty',
  'uiButtonFaceOutsideColorProperty',
  'uiButtonFaceInsideColorProperty',
  'barrierColorProperty',
  'generateAddedFaceColorProperty',
  'generateMinimizedFaceColorProperty',
  'patternAnnotationBackgroundColorProperty',
  'timerColorProperty',

  // TODO: can we actually use rainbow colors (culori-based) for the UI button colors?!? ZOMG

  // TODO: properties for UI color generation (and whether we should use regions or not)
] as const;
export type ThemeColorPropertyName = (typeof themeColorPropertyNames)[number];

export const themeLUTPropertyNames = [
  'simpleRegionHueLUTProperty',
  'faceColorBasicHueLUTProperty',
  'faceColorLightHueLUTProperty',
  'faceColorDarkHueLUTProperty',
] as const;
export type ThemeLUTPropertyName = (typeof themeLUTPropertyNames)[number];

export type TThemeInfo = {
  name: string;
  isEditable: boolean;

  // TODO: an identifier, for serialization that isn't for display
};

export type TTheme = TThemeInfo & {
  [key in ThemeColorPropertyName]: PaintColorProperty;
};

export type TRuntimeTheme = {
  [key in ThemeColorPropertyName]: TReadOnlyProperty<Color>;
} & {
  [key in ThemeLUTPropertyName]: TReadOnlyProperty<string[]>;
};

export type TFullTheme = TTheme & TRuntimeTheme;

export const themeFromProperty = (themeProperty: TReadOnlyProperty<TRuntimeTheme>): TRuntimeTheme => {
  const theme = {} as TRuntimeTheme;
  for (const key of themeColorPropertyNames) {
    theme[key] = new DynamicProperty(themeProperty, {
      derive: key,
    }) as TReadOnlyProperty<Color>;
  }
  for (const key of themeLUTPropertyNames) {
    theme[key] = new DynamicProperty(themeProperty, {
      derive: key,
    }) as TReadOnlyProperty<string[]>;
  }
  return theme;
};

const getLUTProperty = (colorProperty: TReadOnlyProperty<Color>): TReadOnlyProperty<string[]> => {
  return new DerivedProperty([colorProperty], (targetColor) => {
    const okhsl = parseToOKHSL(targetColor.toHexString());

    const hueForce = targetColor.alpha;
    const targetHue = okhsl.h;

    // Depending on the alpha of our target color, control the amount we are pulled to the hue of the target color
    const mapHueDegree = (hue: number) => {
      let hueDelta = hue - targetHue;

      // sanity check wrap
      if (hueDelta > 180) {
        hueDelta -= 360;
      }
      if (hueDelta < -180) {
        hueDelta += 360;
      }
      hueDelta *= 1 - hueForce;
      hueDelta = Math.round(hueDelta);

      return (hueDelta + targetHue + 360) % 360;
    };

    return _.range(0, 360).map((i) => {
      return okhslToRGBString(mapHueDegree(i), okhsl.s, okhsl.l);
    });
  });
};

export const addThemeLUT = (theme: TTheme): TFullTheme => {
  const readOnlyTheme = {
    ...theme,
  } as unknown as TFullTheme;
  readOnlyTheme.simpleRegionHueLUTProperty = getLUTProperty(theme.simpleRegionTargetColorProperty);
  readOnlyTheme.faceColorBasicHueLUTProperty = getLUTProperty(theme.faceColorBasicTargetColorProperty);
  readOnlyTheme.faceColorLightHueLUTProperty = getLUTProperty(theme.faceColorLightTargetColorProperty);
  readOnlyTheme.faceColorDarkHueLUTProperty = getLUTProperty(theme.faceColorDarkTargetColorProperty);
  return readOnlyTheme;
};

// TODO: the region/not switch SHOULD be actually an independent LocalStorageProperty.

export const lightTheme = addThemeLUT({
  name: 'Light',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty('rgb(238,238,238)'),
  playAreaBackgroundColorProperty: new PaintColorProperty('rgb(237,237,237)'),
  playAreaLinearTopColorProperty: new PaintColorProperty('rgba(0,0,0,0)'),
  playAreaLinearMiddleColorProperty: new PaintColorProperty('rgba(0,0,0,0)'),
  playAreaLinearBottomColorProperty: new PaintColorProperty('rgba(0,0,0,0)'),
  playAreaRadialInsideColorProperty: new PaintColorProperty('rgba(255,255,255,0)'),
  playAreaRadialOutsideColorProperty: new PaintColorProperty('rgba(173,199,210,0)'),
  puzzleBackgroundColorProperty: new PaintColorProperty('rgb(255,255,255)'),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty('rgb(179,179,179)'),
  vertexColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  xColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  blackLineColorProperty: new PaintColorProperty('rgb(64,64,64)'),
  redLineColorProperty: new PaintColorProperty('rgba(0,0,0,0.47999999999999998224)'),
  whiteLineColorProperty: new PaintColorProperty('rgb(153,153,153)'),
  selectedFaceColorHighlightColorProperty: new PaintColorProperty('rgba(0,0,0,0.5)'),
  selectedSectorEditColorProperty: new PaintColorProperty('rgba(0,0,0,0.80000000000000004441)'),
  simpleRegionTargetColorProperty: new PaintColorProperty('rgba(79,140,238,0)'),
  faceColorBasicTargetColorProperty: new PaintColorProperty('rgba(240,214,214,0)'),
  faceColorLightTargetColorProperty: new PaintColorProperty('rgba(245,224,224,0)'),
  faceColorDarkTargetColorProperty: new PaintColorProperty('rgba(223,191,191,0)'),
  faceColorOutsideColorProperty: new PaintColorProperty('rgb(255,255,255)'),
  faceColorInsideColorProperty: new PaintColorProperty('rgb(214,214,214)'),
  faceColorDefaultColorProperty: new PaintColorProperty('rgb(237,237,237)'),
  sectorOnlyOneColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  sectorNotOneColorProperty: new PaintColorProperty('rgb(0,153,204)'),
  sectorNotZeroColorProperty: new PaintColorProperty('rgb(0,163,0)'),
  sectorNotTwoColorProperty: new PaintColorProperty('rgb(236,124,19)'),
  sectorOtherColorProperty: new PaintColorProperty('rgb(182,26,255)'),
  vertexStateLineProperty: new PaintColorProperty('rgb(0,132,255)'),
  vertexStateBackgroundProperty: new PaintColorProperty('rgb(255,255,255)'),
  vertexStateOutlineProperty: new PaintColorProperty('rgb(120,120,120)'),
  vertexStatePointProperty: new PaintColorProperty('rgb(61,61,61)'),
  faceValueColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  faceValueCompletedColorProperty: new PaintColorProperty('rgba(0,0,0,0.2000000000000000111)'),
  faceValueErrorColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  faceValueRatioColorProperty: new PaintColorProperty('rgba(0,0,0,0.2999999999999999889)'),
  edgeWeirdColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  incorrectEdgeColorProperty: new PaintColorProperty('rgba(255,0,0,0.3)'),
  incorrectFaceColorProperty: new PaintColorProperty('rgba(255,0,0,0.3)'),
  uiForegroundColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  uiBackgroundColorProperty: new PaintColorProperty('rgb(255,255,255)'),
  uiButtonForegroundProperty: new PaintColorProperty('rgb(0,0,0)'),
  uiButtonInvertedForegroundProperty: new PaintColorProperty('rgb(255,255,255)'),
  uiButtonBaseColorProperty: new PaintColorProperty('rgb(153,206,255)'),
  uiButtonDisabledColorProperty: new PaintColorProperty('rgb(220,220,220)'),
  uiButtonSelectedStrokeColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  uiButtonDeselectedStrokeColorProperty: new PaintColorProperty('rgb(50,50,50)'),
  uiButtonFaceOutsideColorProperty: new PaintColorProperty('rgb(255,255,255)'),
  uiButtonFaceInsideColorProperty: new PaintColorProperty('rgb(50,50,50)'),
  barrierColorProperty: new PaintColorProperty('rgba(127,127,127,0.69999999999999995559)'),
  generateAddedFaceColorProperty: new PaintColorProperty('rgb(216,184,241)'),
  generateMinimizedFaceColorProperty: new PaintColorProperty('rgb(173,200,244)'),
  patternAnnotationBackgroundColorProperty: new PaintColorProperty('rgb(184,184,184)'),
  timerColorProperty: new PaintColorProperty('rgb(0,0,0)'),
});

export const darkTheme = addThemeLUT({
  name: 'Dark',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty('rgb(17,17,17)'),
  playAreaBackgroundColorProperty: new PaintColorProperty('rgb(51,51,51)'),
  playAreaLinearTopColorProperty: new PaintColorProperty('rgba(0,0,0,0)'),
  playAreaLinearMiddleColorProperty: new PaintColorProperty('rgba(0,0,0,0)'),
  playAreaLinearBottomColorProperty: new PaintColorProperty('rgba(0,0,0,0)'),
  playAreaRadialInsideColorProperty: new PaintColorProperty('rgba(66,66,66,0.30999999999999999778)'),
  playAreaRadialOutsideColorProperty: new PaintColorProperty('rgba(0,0,0,0.17999999999999999334)'),
  puzzleBackgroundColorProperty: new PaintColorProperty('rgb(13,13,13)'),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty('rgb(89,89,89)'),
  vertexColorProperty: new PaintColorProperty('rgb(119,119,119)'),
  xColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  blackLineColorProperty: new PaintColorProperty('rgb(170,170,170)'),
  redLineColorProperty: new PaintColorProperty('rgba(255,255,255,0.27000000000000001776)'),
  whiteLineColorProperty: new PaintColorProperty('rgb(85,85,85)'),
  selectedFaceColorHighlightColorProperty: new PaintColorProperty('rgba(255,255,255,0.5)'),
  selectedSectorEditColorProperty: new PaintColorProperty('rgba(255,255,255,0.80000000000000004441)'),
  simpleRegionTargetColorProperty: new PaintColorProperty('rgba(207,80,128,0)'),
  faceColorBasicTargetColorProperty: new PaintColorProperty('rgba(74,18,18,0)'),
  faceColorLightTargetColorProperty: new PaintColorProperty('rgba(101,43,40,0)'),
  faceColorDarkTargetColorProperty: new PaintColorProperty('rgba(74,18,18,0)'),
  faceColorOutsideColorProperty: new PaintColorProperty('rgb(13,13,13)'),
  faceColorInsideColorProperty: new PaintColorProperty('rgb(64,64,64)'),
  faceColorDefaultColorProperty: new PaintColorProperty('rgb(38,38,38)'),
  sectorOnlyOneColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  sectorNotOneColorProperty: new PaintColorProperty('rgb(8,164,217)'),
  sectorNotZeroColorProperty: new PaintColorProperty('rgb(42,137,42)'),
  sectorNotTwoColorProperty: new PaintColorProperty('rgb(224,124,31)'),
  sectorOtherColorProperty: new PaintColorProperty('rgb(153,0,224)'),
  vertexStateLineProperty: new PaintColorProperty('rgb(255,119,41)'),
  vertexStateBackgroundProperty: new PaintColorProperty('rgb(0,0,0)'),
  vertexStateOutlineProperty: new PaintColorProperty('rgb(56,56,56)'),
  vertexStatePointProperty: new PaintColorProperty('rgb(209,209,209)'),
  faceValueColorProperty: new PaintColorProperty('rgb(204,204,204)'),
  faceValueCompletedColorProperty: new PaintColorProperty('rgba(217,217,217,0.14000000000000001332)'),
  faceValueErrorColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  faceValueRatioColorProperty: new PaintColorProperty('rgba(204,204,204,0.2999999999999999889)'),
  edgeWeirdColorProperty: new PaintColorProperty('rgb(255,0,0)'),
  incorrectEdgeColorProperty: new PaintColorProperty('rgba(255,0,0,0.3)'),
  incorrectFaceColorProperty: new PaintColorProperty('rgba(255,0,0,0.3)'),
  uiForegroundColorProperty: new PaintColorProperty('rgb(204,204,204)'),
  uiBackgroundColorProperty: new PaintColorProperty('rgb(34,34,34)'),
  uiButtonForegroundProperty: new PaintColorProperty('rgb(0,0,0)'),
  uiButtonInvertedForegroundProperty: new PaintColorProperty('rgb(255,255,255)'),
  uiButtonBaseColorProperty: new PaintColorProperty('rgb(206,119,67)'),
  uiButtonDisabledColorProperty: new PaintColorProperty('rgb(128,128,128)'),
  uiButtonSelectedStrokeColorProperty: new PaintColorProperty('rgb(255,255,255)'),
  uiButtonDeselectedStrokeColorProperty: new PaintColorProperty('rgb(200,200,200)'),
  uiButtonFaceOutsideColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  uiButtonFaceInsideColorProperty: new PaintColorProperty('rgb(200,200,200)'),
  barrierColorProperty: new PaintColorProperty('rgba(60,60,60,0.69999999999999995559)'),
  generateAddedFaceColorProperty: new PaintColorProperty('rgb(92,42,123)'),
  generateMinimizedFaceColorProperty: new PaintColorProperty('rgb(33,68,126)'),
  patternAnnotationBackgroundColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  timerColorProperty: new PaintColorProperty('rgb(204,204,204)'),
});

export const fadeLightTheme = addThemeLUT({
  ...lightTheme,
  name: 'Fade Light',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty('rgb(33,33,33)'),
  playAreaBackgroundColorProperty: new PaintColorProperty('rgb(204,204,204)'),
  playAreaLinearTopColorProperty: new PaintColorProperty('rgba(255,102,0,0.36999999999999999556)'),
  playAreaLinearMiddleColorProperty: new PaintColorProperty('rgba(255,0,200,0.3499999999999999778)'),
  playAreaLinearBottomColorProperty: new PaintColorProperty('rgba(0,17,255,0.34000000000000002442)'),
  playAreaRadialInsideColorProperty: new PaintColorProperty('rgba(255,255,255,0)'),
  playAreaRadialOutsideColorProperty: new PaintColorProperty('rgba(255,255,255,0.79000000000000003553)'),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty('rgb(148,148,148)'),
  timerColorProperty: new PaintColorProperty('rgb(204,204,204)'),
});

export const fadeDarkTheme = addThemeLUT({
  ...darkTheme,
  name: 'Fade Dark',
  isEditable: true,
  navbarBackgroundColorProperty: new PaintColorProperty('rgb(17,17,17)'),
  playAreaBackgroundColorProperty: new PaintColorProperty('rgb(255,255,255)'),
  playAreaLinearTopColorProperty: new PaintColorProperty('rgba(255,102,0,0.64000000000000001332)'),
  playAreaLinearMiddleColorProperty: new PaintColorProperty('rgba(255,0,208,0.54000000000000003553)'),
  playAreaLinearBottomColorProperty: new PaintColorProperty('rgba(4,0,255,0.42999999999999999334)'),
  playAreaRadialInsideColorProperty: new PaintColorProperty('rgba(0,0,0,0.46999999999999997335)'),
  playAreaRadialOutsideColorProperty: new PaintColorProperty('rgb(0,0,0)'),
  puzzleBackgroundColorProperty: new PaintColorProperty('rgb(24,23,22)'),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty('rgb(92,51,40)'),
  whiteLineColorProperty: new PaintColorProperty('rgb(78,73,70)'),
});

export const autoTheme = {
  name: 'Auto',
  isEditable: false,
  ...themeFromProperty(new DerivedProperty([isOSDarkModeProperty], (isDark) => (isDark ? darkTheme : lightTheme))),
} as TFullTheme; // we pretend, it has read-only Properties though;

// Mostly so we get type checking
export const availableThemes: TFullTheme[] = [lightTheme, darkTheme, autoTheme, fadeLightTheme, fadeDarkTheme];

export const themeProperty = new LocalStorageProperty<TFullTheme>('theme', {
  serialize: (theme) => theme.name,
  deserialize: (name) => availableThemes.find((theme) => theme.name === name) ?? autoTheme,
});

export const themeToJS = (theme: TTheme) => {
  const keyValueStringMap: Record<string, string> = {};

  keyValueStringMap.name = `'${theme.name}'`;
  keyValueStringMap.isEditable = `${theme.isEditable}`;
  themeColorPropertyNames.forEach((key) => {
    keyValueStringMap[key] = `new PaintColorProperty( '${theme[key].value.toCSS()}' )`;
  });

  return `{\n${Object.keys(keyValueStringMap)
    .map((key) => `  ${key}: ${keyValueStringMap[key]}`)
    .join(',\n')}\n}`;
};

export const popupColorEditor = (theme: TTheme) => {
  const div = document.createElement('div');
  // @ts-expect-error
  div.style.zoom = '0.5';
  div.style.backgroundColor = 'rgba(127,127,127,0.3)';

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(div);
  });
  div.appendChild(closeButton);

  const colorContainer = document.createElement('div');

  // Toggle view button (toggles colorContainer)
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Toggle Visibility';
  toggleButton.addEventListener('click', () => {
    colorContainer.style.display = colorContainer.style.display === 'none' ? 'block' : 'none';
  });
  div.appendChild(toggleButton);

  // Copy to clipboard
  const copyToClipboardButton = document.createElement('button');
  copyToClipboardButton.textContent = 'Copy to Clipboard';
  copyToClipboardButton.addEventListener('click', () => {
    copyToClipboard(themeToJS(theme));
  });
  div.appendChild(copyToClipboardButton);

  div.appendChild(colorContainer);

  Object.keys(theme).forEach((key) => {
    const prop = theme[key as keyof TTheme];
    if (prop instanceof PaintColorProperty) {
      const section = document.createElement('div');

      const input = document.createElement('input');
      input.type = 'color';
      input.value = prop.value.withAlpha(1).toHexString();

      input.style.margin = '1px';
      input.style.marginRight = '10px';

      const initialAlpha = prop.value.alpha;

      const alphaSlider = document.createElement('input');
      const alphaSliderReadout = document.createElement('span');

      alphaSlider.style.width = '100px';
      alphaSlider.type = 'range';
      alphaSlider.min = '0';
      alphaSlider.max = '1';
      alphaSlider.step = '0.01';
      alphaSlider.value = `${initialAlpha}`;
      alphaSlider.style.marginRight = '10px';
      alphaSliderReadout.innerText = initialAlpha.toFixed(2);

      const updateColor = () => {
        const alpha = alphaSlider.valueAsNumber;
        alphaSliderReadout.innerText = alpha.toFixed(2);
        prop.value = new Color(input.value).withAlpha(alpha);
      };
      input.addEventListener('input', updateColor);
      alphaSlider.addEventListener('input', updateColor);

      section.appendChild(input);
      section.appendChild(alphaSliderReadout);
      section.appendChild(alphaSlider);
      section.appendChild(document.createTextNode(key));

      colorContainer.appendChild(section);
    }
  });

  document.body.appendChild(div);
  div.style.position = 'absolute';
  div.style.zIndex = '100000';
};

export const currentTheme: TRuntimeTheme = themeFromProperty(themeProperty);

const useFlatButtons = true;
export const rectangularButtonAppearanceStrategy =
  useFlatButtons ? RectangularButton.FlatAppearanceStrategy : RectangularButton.ThreeDAppearanceStrategy;

// TODO: why such bad font metrics on Firefox?
export const uiFontFamily = platform.firefox ? 'Arial, sans-serif' : 'Helvetica, Arial, sans-serif';
export const monospacedFontFamily =
  'Menlo, Inconsolata, Bitstream Vera Sans Mono, Consolas, DejaVu Sans Mono, Droid Sans Mono, Lucida Console, Monaco, Noto Mono, Roboto Mono, monospace';

export const controlBarFont = new Font({
  family: uiFontFamily,
  size: 15,
});

export const uiFont = new Font({
  family: uiFontFamily,
  size: 16,
});

export const uiHeaderFont = new Font({
  family: uiFontFamily,
  size: 16,
  weight: 'bold',
});

export const puzzleFont = new Font({
  family: uiFontFamily,
  size: 25,
});

export const generateButtonFont = new Font({
  family: uiFontFamily,
  size: 25,
});

export const tooltipFont = new Font({
  family: uiFontFamily,
  size: 12,
});

export const timerFont = new Font({
  family: monospacedFontFamily,
  size: 14,
});

export const customAllowEdgeEditProperty = new LocalStorageBooleanProperty('customAllowEdgeEditProperty', true);
export const customAllowAbsoluteFaceColorEditProperty = new LocalStorageBooleanProperty(
  'customAllowAbsoluteFaceColorEditProperty',
  true,
);
export const customAllowFaceColorEditProperty = new LocalStorageBooleanProperty(
  'customAllowFaceColorEditProperty',
  true,
);
export const customAllowSectorEditProperty = new LocalStorageBooleanProperty('customAllowSectorEditProperty', true);

export const edgesVisibleProperty = new LocalStorageBooleanProperty('edgesVisibleProperty', true);
export const edgesHaveColorsProperty = new LocalStorageBooleanProperty('edgesHaveColorsProperty', true);
export const faceColorsVisibleProperty = new LocalStorageBooleanProperty('faceColorsVisibleProperty', true);
export const sectorsVisibleProperty = new LocalStorageBooleanProperty('sectorsVisibleProperty', false);
export const sectorsNextToEdgesVisibleProperty = new LocalStorageBooleanProperty(
  'sectorsNextToEdgesVisibleProperty',
  false,
);
export const sectorsTrivialVisibleProperty = new LocalStorageBooleanProperty('sectorsTrivialVisibleProperty', false);
export const vertexStateVisibleProperty = new LocalStorageBooleanProperty('vertexStateVisibleProperty', false);
export const allVertexStateVisibleProperty = new LocalStorageBooleanProperty('allVertexStateVisibleProperty', false);
export const faceStateVisibleProperty = new LocalStorageBooleanProperty('faceStateVisibleProperty', false);
export const redLineVisibleProperty = new LocalStorageBooleanProperty('redLineVisibleProperty', false);
export const whiteLineVisibleProperty = new LocalStorageBooleanProperty('whiteLineVisibleProperty', true);
export const verticesVisibleProperty = new LocalStorageBooleanProperty('verticesVisibleProperty', false);
export const redXsVisibleProperty = new LocalStorageBooleanProperty('redXsVisibleProperty', false);
export const redXsAlignedProperty = new LocalStorageBooleanProperty('redXsAlignedProperty', false);

export const faceColorThresholdProperty = new LocalStorageNumberProperty(
  'faceColorThresholdProperty',
  Number.POSITIVE_INFINITY,
);

export const lineJoins = ['miter', 'round', 'bevel'] as const;
export type TLineJoin = (typeof lineJoins)[number];
export const joinedLinesJoinProperty = new LocalStorageStringProperty<TLineJoin>('joinedLinesJoinProperty', 'round');

// TODO: add a value for "cut out" (based on the other line segments going into it)
// TODO: name "faceted"?
// TODO: actually, we can have "faceted exclude" and "faceted include" (include has all the parts of a faceted vertex)
export const lineCaps = ['butt', 'round', 'square'] as const;
export type TLineCap = (typeof lineCaps)[number];
export const joinedLinesCapProperty = new LocalStorageStringProperty<TLineCap>('joinedLinesCapProperty', 'round');

// TODO: add a "faceted" option (which will be... SQUARE for square puzzles)
export const vertexStyles = ['round', 'square'] as const;
export type TVertexStyle = (typeof vertexStyles)[number];
export const vertexStyleProperty = new LocalStorageStringProperty<TVertexStyle>('vertexStyleProperty', 'round');

export const redLineStyles = ['full', 'gap', 'middle'] as const;
export type TRedLineStyle = (typeof redLineStyles)[number];
export const redLineStyleProperty = new LocalStorageStringProperty<TRedLineStyle>('redLineStyleProperty', 'middle');

export const faceValueStyles = ['static', 'remaining', 'ratio'] as const;
export type TFaceValueStyle = (typeof faceValueStyles)[number];
export const faceValueStyleProperty = new LocalStorageStringProperty<TFaceValueStyle>(
  'faceValueStyleProperty',
  'static',
);

export const smallVertexProperty = new LocalStorageBooleanProperty('smallVertexProperty', true);

export const controlBarMargin = 5;
