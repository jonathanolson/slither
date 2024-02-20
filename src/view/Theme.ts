import { DerivedProperty, DynamicProperty, Property, TReadOnlyProperty } from 'phet-lib/axon';
import { Color, PaintColorProperty } from 'phet-lib/scenery';

export interface TTheme {
  name: string;
  navbarBackgroundColorProperty: PaintColorProperty;
  playAreaBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundColorProperty: PaintColorProperty;
  puzzleBackgroundStrokeColorProperty: PaintColorProperty;
}

export const lightTheme = {
  name: 'Light',
  navbarBackgroundColorProperty: new PaintColorProperty( '#eee' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( '#ccc' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( '#fff' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( '#888' )
};

export const darkTheme = {
  name: 'Dark',
  navbarBackgroundColorProperty: new PaintColorProperty( '#111' ),
  playAreaBackgroundColorProperty: new PaintColorProperty( '#333' ),
  puzzleBackgroundColorProperty: new PaintColorProperty( '#222' ),
  puzzleBackgroundStrokeColorProperty: new PaintColorProperty( '#777' )
};

// Mostly so we get type checking
export const availableThemes: TTheme[] = [
  lightTheme,
  darkTheme
];

// TODO: auto theme based on system settings (keep EVERYTHING basically a Property)

export const themeProperty = new Property<TTheme>( lightTheme );

export const themeWithPropertiesProperty = new DerivedProperty( [ themeProperty ], theme => {

} );

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