// Copyright 2015-2024, University of Colorado Boulder

/**
 * NOTE: This is copied, since I don't have scenery-phet yet (and had to make some tweaks)
 *
 * NumberControl is a control for changing a Property<number>, with flexible layout. It consists of a labeled value,
 * slider, and arrow buttons.
 *
 * NumberControl provides accessible content exclusively through the Slider. Please pass accessibility related
 * customizations to the Slider through options.sliderOptions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { AlignBox, extendsWidthSizable, Font, HBox, isWidthSizable, Node, NodeOptions, PaintColorProperty, Text, TextOptions, VBox, WidthSizable } from 'phet-lib/scenery';
import NumberDisplay, { NumberDisplayOptions } from './SunNumberDisplay.ts';
import { ArrowButton, ArrowButtonOptions, HSlider, Slider, SliderOptions } from 'phet-lib/sun';
import { Dimension2, DotUtils, Range } from 'phet-lib/dot';
import { DerivedProperty, PhetioProperty, Property, TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions, optionize, Orientation } from 'phet-lib/phet-core';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import _ from '../../workarounds/_.ts';

// constants
const SPECIFIC_COMPONENT_CALLBACK_OPTIONS = [
  'startDrag',
  'endDrag',
  'leftStart',
  'leftEnd',
  'rightStart',
  'rightEnd'
];

const DEFAULT_HSLIDER_TRACK_SIZE = new Dimension2( 180, 3 );
const DEFAULT_HSLIDER_THUMB_SIZE = new Dimension2( 17, 34 );

export type LayoutFunction = ( titleNode: Node, numberDisplay: NumberDisplay, slider: Slider, decrementButton: ArrowButton | null, incrementButton: ArrowButton | null ) => Node;

// description of a major tick
type NumberControlMajorTick = {
  value: number; // value that the tick corresponds to
  label?: Node; // optional label that appears at the tick mark
};

// other slider options that are specific to NumberControl
export type NumberControlSliderOptions = Omit<SliderOptions, 'enabledRangeProperty'> & {

  // description of major ticks
  majorTicks?: NumberControlMajorTick[];

  // zero indicates no minor ticks
  minorTickSpacing?: number;
};

type WithMinMaxSelfOptions = {
  tickLabelFont?: Font;
};
export type WithMinMaxOptions = NumberControlOptions & WithMinMaxSelfOptions;

export type NumberControlLayoutFunction1Options = {
  // horizontal alignment of rows, 'left'|'right'|'center'
  align?: 'center' | 'left' | 'right';

  // horizontal spacing between title and number
  titleXSpacing?: number;

  // horizontal spacing between arrow buttons and slider
  arrowButtonsXSpacing?: number;

  // vertical spacing between rows
  ySpacing?: number;
};

export type NumberControlLayoutFunction2Options = {
  // horizontal alignment of rows, 'left'|'right'|'center'
  align?: 'center' | 'left' | 'right';

  // horizontal spacing in top row
  xSpacing?: number;

  // vertical spacing between rows
  ySpacing?: number;
};

export type NumberControlLayoutFunction3Options = {
  // horizontal alignment of title, relative to slider, 'left'|'right'|'center'
  alignTitle?: 'center' | 'left' | 'right';

  // horizontal alignment of number display, relative to slider, 'left'|'right'|'center'
  alignNumber?: 'center' | 'left' | 'right';

  // if provided, indent the title on the left to push the title to the right
  titleLeftIndent?: number;

  // horizontal spacing between arrow buttons and slider
  xSpacing?: number;

  // vertical spacing between rows
  ySpacing?: number;
};

export type NumberControlLayoutFunction4Options = {
  // adds additional horizontal space between title and NumberDisplay
  sliderPadding?: number;

  // vertical spacing between slider and title/NumberDisplay
  verticalSpacing?: number;

  // spacing between slider and arrow buttons
  arrowButtonSpacing?: number;

  hasReadoutProperty?: TReadOnlyProperty<boolean> | null;

  // Supports Pendulum Lab's questionText where a question is substituted for the slider
  createBottomContent?: ( ( box: HBox ) => Node ) | null;

  // Whether invisible increment/decrement buttons (or the slider itself) should be laid out as if they were there
  layoutInvisibleButtons?: boolean;
};

type SelfOptions = {
  // called when interaction begins, default value set in validateCallbacks()
  startCallback?: () => void;

  // called when interaction ends, default value set in validateCallbacks()
  endCallback?: () => void;

  delta?: number;

  // opacity used to make the control look disabled
  disabledOpacity?: number;

  // If set to true, then increment/decrement arrow buttons will be added to the NumberControl
  includeArrowButtons?: boolean;

  // Subcomponent options objects
  numberDisplayOptions?: NumberDisplayOptions;
  sliderOptions?: NumberControlSliderOptions;

  // fireOnDown is buggy, so omit it, see https://github.com/phetsims/scenery-phet/issues/825
  arrowButtonOptions?: Omit<ArrowButtonOptions, 'fireOnDown'> & {
    // We stuffed enabledEpsilon here
    enabledEpsilon?: number;

    leftStart?: () => void;
    leftEnd?: ( over: boolean ) => void;

    rightStart?: () => void;
    rightEnd?: ( over: boolean ) => void;
  };
  titleNodeOptions?: TextOptions;

  // If provided, this will be provided to the slider and arrow buttons in order to
  // constrain the range of actual values to within this range.
  enabledRangeProperty?: SliderOptions[ 'enabledRangeProperty' ];

  // A {function} that handles layout of subcomponents.
  // It has signature function( titleNode, numberDisplay, slider, decrementButton, incrementButton )
  // and returns a Node. If you want to customize the layout, use one of the predefined creators
  // (see createLayoutFunction*) or create your own function. Arrow buttons will be null if `includeArrowButtons:false`
  layoutFunction?: LayoutFunction;
};

export type NumberControlOptions = SelfOptions & Omit<NodeOptions, 'children'>;

export default class NumberControl extends WidthSizable( Node ) {

  public readonly slider: HSlider; // for a11y API

  private readonly thumbFillProperty?: PaintColorProperty;
  // @ts-expect-error
  private readonly numberDisplay: NumberDisplay;
  private readonly disposeNumberControl: () => void;

  public constructor( title: string | TReadOnlyProperty<string>, numberProperty: PhetioProperty<number>, numberRange: Range, providedOptions?: NumberControlOptions ) {

    // Make sure that general callbacks (for all components) and specific callbacks (for a specific component) aren't
    // used in tandem. This must be called before defaults are set.
    validateCallbacks( providedOptions || {} );

    // Omit enabledRangeProperty from top-level, so that we don't need to provide a default.
    // Then add enabledRangeProperty to sliderOptions, so that if we are given providedOptions.enabledRangeProperty,
    // we can pass it to super via options.sliderOptions.enabledRangeProperty.
    type RevisedSelfOptions = Omit<SelfOptions, 'enabledRangeProperty'> & {
      sliderOptions?: Partial<Pick<SliderOptions, 'enabledRangeProperty'>>;
    };

    // Extend NumberControl options before merging nested options because some nested defaults use these options.
    const initialOptions = optionize<NumberControlOptions, RevisedSelfOptions, NodeOptions>()( {

      numberDisplayOptions: {},
      sliderOptions: {},
      arrowButtonOptions: {},
      titleNodeOptions: {},

      // General Callbacks
      startCallback: _.noop, // called when interaction begins, default value set in validateCallbacks()
      endCallback: _.noop, // called when interaction ends, default value set in validateCallbacks()

      delta: 1,

      disabledOpacity: 0.5, // {number} opacity used to make the control look disabled

      // A {function} that handles layout of subcomponents.
      // It has signature function( titleNode, numberDisplay, slider, decrementButton, incrementButton )
      // and returns a Node. If you want to customize the layout, use one of the predefined creators
      // (see createLayoutFunction*) or create your own function. Arrow buttons will be null if `includeArrowButtons:false`
      layoutFunction: NumberControl.createLayoutFunction1(),

      // {boolean} If set to true, then increment/decrement arrow buttons will be added to the NumberControl
      includeArrowButtons: true
    }, providedOptions );

    // A groupFocusHighlight is only included if using arrowButtons. When there are arrowButtons it is important
    // to indicate that the whole control is only one stop in the traversal order. This is set by NumberControl.
    assertEnabled() && assert( initialOptions.groupFocusHighlight === undefined, 'NumberControl sets groupFocusHighlight' );

    super();

    // If the arrow button scale is not provided, the arrow button height will match the number display height
    const arrowButtonScaleProvided = initialOptions.arrowButtonOptions && initialOptions.arrowButtonOptions.hasOwnProperty( 'scale' );

    const getCurrentRange = () => {
      return options.enabledRangeProperty ? options.enabledRangeProperty.value : numberRange;
    };

    // Create a function that will be used to constrain the slider value to the provided range and the same delta as
    // the arrow buttons, see https://github.com/phetsims/scenery-phet/issues/384.
    const constrainValue = ( value: number ) => {
      assertEnabled() && assert( options.delta !== undefined );
      const newValue = DotUtils.roundToInterval( value, options.delta );
      return getCurrentRange().constrainValue( newValue );
    };

    // Merge all nested options in one block.
    const options: typeof initialOptions = combineOptions<typeof initialOptions>( {

      // Options propagated to ArrowButton
      arrowButtonOptions: {

        // Values chosen to match previous behavior, see https://github.com/phetsims/scenery-phet/issues/489.
        // touchAreaXDilation is 1/2 of its original value because touchArea is shifted.
        touchAreaXDilation: 3.5,
        touchAreaYDilation: 7,
        mouseAreaXDilation: 0,
        mouseAreaYDilation: 0,

        // If the value is within this amount of the respective min/max, it will be treated as if it was at that value
        // (for determining whether the arrow button is enabled).
        enabledEpsilon: 0,

        // callbacks
        leftStart: initialOptions.startCallback, // called when left arrow is pressed
        leftEnd: initialOptions.endCallback, // called when left arrow is released
        rightStart: initialOptions.startCallback, // called when right arrow is pressed
        rightEnd: initialOptions.endCallback, // called when right arrow is released

        // phet-io
        enabledPropertyOptions: {
          phetioReadOnly: true,
          phetioFeatured: false
        }
      },

      // Options propagated to Slider
      sliderOptions: {
        orientation: Orientation.HORIZONTAL,
        startDrag: initialOptions.startCallback, // called when dragging starts on the slider
        endDrag: initialOptions.endCallback, // called when dragging ends on the slider

        // With the exception of startDrag and endDrag (use startCallback and endCallback respectively),
        // all HSlider options may be used. These are the ones that NumberControl overrides:
        majorTickLength: 20,
        minorTickStroke: 'rgba( 0, 0, 0, 0.3 )',

        // other slider options that are specific to NumberControl
        majorTicks: [],
        minorTickSpacing: 0, // zero indicates no minor ticks

        // constrain the slider value to the provided range and the same delta as the arrow buttons,
        // see https://github.com/phetsims/scenery-phet/issues/384
        constrainValue: constrainValue,
      },

      // Options propagated to NumberDisplay
      numberDisplayOptions: {
        textOptions: {
          font: new Font( { size: 12, family: 'sans-serif' } ),
          stringPropertyOptions: { phetioFeatured: true }
        }
      },

      // Options propagated to the title Text Node
      titleNodeOptions: {
        font: new Font( { size: 12, family: 'sans-serif' } ),
        maxWidth: null, // {null|number} maxWidth to use for title, to constrain width for i18n
        fill: 'black',
      }
    }, initialOptions );

    // validate options
    assertEnabled() && assert( !( options as any ).startDrag, 'use options.startCallback instead of options.startDrag' );
    assertEnabled() && assert( !( options as any ).endDrag, 'use options.endCallback instead of options.endDrag' );
    assertEnabled() && assert( !options.tagName,
      'Provide accessibility through options.sliderOptions which will be applied to the NumberControl Node.' );

    if ( options.enabledRangeProperty ) {
      options.sliderOptions.enabledRangeProperty = options.enabledRangeProperty;
    }

    // pdom - for alternative input, the number control is accessed entirely through slider interaction and these
    // arrow buttons are not tab navigable
    assertEnabled() && assert( options.arrowButtonOptions.tagName === undefined,
      'NumberControl\'s accessible content is just the slider, do not set accessible content on the buttons. Instead ' +
      'set a11y through options.sliderOptions.' );
    options.arrowButtonOptions.tagName = null;

    // pdom - if we include arrow buttons, use a groupFocusHighlight to surround the NumberControl to make it clear
    // that it is a composite component and there is only one stop in the traversal order.
    this.groupFocusHighlight = options.includeArrowButtons;

    // Slider options for track (if not specified as trackNode)
    if ( !options.sliderOptions.trackNode ) {
      options.sliderOptions = combineOptions<NumberControlSliderOptions>( {
        trackSize: ( options.sliderOptions.orientation === Orientation.HORIZONTAL ) ? DEFAULT_HSLIDER_TRACK_SIZE : DEFAULT_HSLIDER_TRACK_SIZE.swapped()
      }, options.sliderOptions );
    }

    // Slider options for thumb (if n ot specified as thumbNode)
    if ( !options.sliderOptions.thumbNode ) {
      options.sliderOptions = combineOptions<NumberControlSliderOptions>( {
        thumbSize: ( options.sliderOptions.orientation === Orientation.HORIZONTAL ) ? DEFAULT_HSLIDER_THUMB_SIZE : DEFAULT_HSLIDER_THUMB_SIZE.swapped(),
        thumbTouchAreaXDilation: 6
      }, options.sliderOptions );
    }

    assertEnabled() && assert( !options.sliderOptions.hasOwnProperty( 'phetioType' ), 'NumberControl sets phetioType' );

    // slider options set by NumberControl, note this may not be the long term pattern, see https://github.com/phetsims/phet-info/issues/96
    options.sliderOptions = combineOptions<NumberControlSliderOptions>( {

      // pdom - by default, shiftKeyboardStep should most likely be the same as clicking the arrow buttons.
      shiftKeyboardStep: options.delta,

      // Make sure Slider gets created with the right IOType
      phetioType: Slider.SliderIO
    }, options.sliderOptions );

    // highlight color for thumb defaults to a brighter version of the thumb color
    if ( options.sliderOptions.thumbFill && !options.sliderOptions.thumbFillHighlighted ) {

      this.thumbFillProperty = new PaintColorProperty( options.sliderOptions.thumbFill );

      // Reference to the DerivedProperty not needed, since we dispose what it listens to above.
      options.sliderOptions.thumbFillHighlighted = new DerivedProperty( [ this.thumbFillProperty ], color => color.brighterColor() );
    }

    const titleNode = new Text( title, options.titleNodeOptions );

    const numberDisplay = new NumberDisplay( numberProperty, numberRange, options.numberDisplayOptions );

    this.slider = new Slider( numberProperty, numberRange, options.sliderOptions );

    // set below, see options.includeArrowButtons
    let decrementButton: ArrowButton | null = null;
    let incrementButton: ArrowButton | null = null;
    let arrowEnabledListener: ( () => void ) | null = null;

    if ( options.includeArrowButtons ) {

      const touchAreaXDilation = options.arrowButtonOptions.touchAreaXDilation!;
      const mouseAreaXDilation = options.arrowButtonOptions.mouseAreaXDilation!;
      assertEnabled() && assert( touchAreaXDilation !== undefined && mouseAreaXDilation !== undefined,
        'Should be defined, since we have defaults above' );

      decrementButton = new ArrowButton( 'left', () => {
        const oldValue = numberProperty.get();
        let newValue = numberProperty.get() - options.delta;
        newValue = DotUtils.roundToInterval( newValue, options.delta ); // constrain to multiples of delta, see #384
        newValue = Math.max( newValue, getCurrentRange().min ); // constrain to range
        numberProperty.set( newValue );
        this.slider.voicingOnEndResponse( oldValue );
      }, combineOptions<ArrowButtonOptions>( {
        startCallback: options.arrowButtonOptions.leftStart,
        endCallback: options.arrowButtonOptions.leftEnd,
        touchAreaXShift: -touchAreaXDilation,
        mouseAreaXShift: -mouseAreaXDilation
      }, options.arrowButtonOptions ) );

      incrementButton = new ArrowButton( 'right', () => {
        const oldValue = numberProperty.get();
        let newValue = numberProperty.get() + options.delta;
        newValue = DotUtils.roundToInterval( newValue, options.delta ); // constrain to multiples of delta, see #384
        newValue = Math.min( newValue, getCurrentRange().max ); // constrain to range
        numberProperty.set( newValue );
        this.slider.voicingOnEndResponse( oldValue );
      }, combineOptions<ArrowButtonOptions>( {
        startCallback: options.arrowButtonOptions.rightStart,
        endCallback: options.arrowButtonOptions.rightEnd,
        touchAreaXShift: touchAreaXDilation,
        mouseAreaXShift: mouseAreaXDilation
      }, options.arrowButtonOptions ) );

      // By default, scale the ArrowButtons to have the same height as the NumberDisplay, but ignoring
      // the NumberDisplay's maxWidth (if any)
      if ( !arrowButtonScaleProvided ) {

        // Remove the current button scaling so we can determine the desired final scale factor
        decrementButton.setScaleMagnitude( 1 );

        // Set the tweaker button height to match the height of the numberDisplay. Lengthy text can shrink a numberDisplay
        // with maxWidth--if we match the scaled height of the numberDisplay the arrow buttons would shrink too, as
        // depicted in https://github.com/phetsims/scenery-phet/issues/513#issuecomment-517897850
        // Instead, to keep the tweaker buttons a uniform and reasonable size, we match their height to the unscaled
        // height of the numberDisplay (ignores maxWidth and scale).
        const numberDisplayHeight = numberDisplay.localBounds.height;
        const arrowButtonsScale = numberDisplayHeight / decrementButton.height;

        decrementButton.setScaleMagnitude( arrowButtonsScale );
        incrementButton.setScaleMagnitude( arrowButtonsScale );
      }

      // Disable the arrow buttons if the slider currently has focus
      arrowEnabledListener = () => {
        const value = numberProperty.value;
        assertEnabled() && assert( options.arrowButtonOptions.enabledEpsilon !== undefined );
        decrementButton!.enabled = ( value - options.arrowButtonOptions.enabledEpsilon! > getCurrentRange().min && !this.slider.isFocused() );
        incrementButton!.enabled = ( value + options.arrowButtonOptions.enabledEpsilon! < getCurrentRange().max && !this.slider.isFocused() );
      };
      numberProperty.lazyLink( arrowEnabledListener );
      options.enabledRangeProperty && options.enabledRangeProperty.lazyLink( arrowEnabledListener );
      arrowEnabledListener();

      this.slider.addInputListener( {
        focus: () => {
          decrementButton!.enabled = false;
          incrementButton!.enabled = false;
        },
        blur: () => arrowEnabledListener!() // recompute if the arrow buttons should be enabled
      } );
    }

    // major ticks for the slider
    const majorTicks = options.sliderOptions.majorTicks!;
    assertEnabled() && assert( majorTicks );
    for ( let i = 0; i < majorTicks.length; i++ ) {
      this.slider.addMajorTick( majorTicks[ i ].value, majorTicks[ i ].label );
    }

    // minor ticks, exclude values where we already have major ticks
    assertEnabled() && assert( options.sliderOptions.minorTickSpacing !== undefined );
    if ( options.sliderOptions.minorTickSpacing! > 0 ) {
      for ( let minorTickValue = numberRange.min; minorTickValue <= numberRange.max; ) {
        if ( !_.find( majorTicks, majorTick => majorTick.value === minorTickValue ) ) {
          this.slider.addMinorTick( minorTickValue );
        }
        minorTickValue += options.sliderOptions.minorTickSpacing!;
      }
    }

    const child = options.layoutFunction( titleNode, numberDisplay, this.slider, decrementButton, incrementButton );

    // Set up default sizability
    this.widthSizable = isWidthSizable( child );

    // Forward minimum/preferred width Properties to the child, so each layout is responsible for its dynamic layout
    if ( extendsWidthSizable( child ) ) {
      const minimumListener = ( minimumWidth: number | null ) => {
        this.localMinimumWidth = minimumWidth;
      };
      child.minimumWidthProperty.link( minimumListener );

      const preferredListener = ( localPreferredWidth: number | null ) => {
        child.preferredWidth = localPreferredWidth;
      };
      this.localPreferredWidthProperty.link( preferredListener );

      this.disposeEmitter.addListener( () => {
        child.minimumWidthProperty.unlink( minimumListener );
        this.localPreferredWidthProperty.unlink( preferredListener );
      } );
    }

    options.children = [ child ];

    this.mutate( options );

    this.numberDisplay = numberDisplay;

    this.disposeNumberControl = () => {
      titleNode.dispose(); // may be linked to a string Property
      numberDisplay.dispose();
      this.slider.dispose();

      this.thumbFillProperty && this.thumbFillProperty.dispose();

      // only defined if options.includeArrowButtons
      decrementButton && decrementButton.dispose();
      incrementButton && incrementButton.dispose();
      arrowEnabledListener && numberProperty.unlink( arrowEnabledListener );
      arrowEnabledListener && options.enabledRangeProperty && options.enabledRangeProperty.unlink( arrowEnabledListener );
    };
  }

  public override dispose(): void {
    this.disposeNumberControl();
    super.dispose();
  }

  /**
   * Creates a NumberControl with default tick marks for min and max values.
   */
  public static withMinMaxTicks( label: string, property: Property<number>, range: Range,
                                 providedOptions?: WithMinMaxOptions ): NumberControl {

    const options = optionize<WithMinMaxOptions, WithMinMaxSelfOptions, NumberControlOptions>()( {
      tickLabelFont: new Font( { size: 12, family: 'sans-serif' } )
    }, providedOptions );

    options.sliderOptions = combineOptions<NumberControlSliderOptions>( {
      majorTicks: [
        { value: range.min, label: new Text( range.min, { font: options.tickLabelFont } ) },
        { value: range.max, label: new Text( range.max, { font: options.tickLabelFont } ) }
      ]
    }, options.sliderOptions );

    return new NumberControl( label, property, range, options );
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title number
   *  < ------|------ >
   *
   */
  public static createLayoutFunction1( providedOptions?: NumberControlLayoutFunction1Options ): LayoutFunction {

    const options = optionize<NumberControlLayoutFunction1Options>()( {
      align: 'center',
      titleXSpacing: 5,
      arrowButtonsXSpacing: 15,
      ySpacing: 5
    }, providedOptions );

    return ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {
      assertEnabled() && assert( decrementButton, 'There is no decrementButton!' );
      assertEnabled() && assert( incrementButton, 'There is no incrementButton!' );

      slider.mutateLayoutOptions( {
        grow: 1
      } );

      return new VBox( {
        align: options.align,
        spacing: options.ySpacing,
        children: [
          new HBox( {
            spacing: options.titleXSpacing,
            children: [ titleNode, numberDisplay ]
          } ),
          new HBox( {
            layoutOptions: {
              stretch: true
            },
            spacing: options.arrowButtonsXSpacing,
            children: [ decrementButton!, slider, incrementButton! ]
          } )
        ]
      } );
    };
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title < number >
   *  ------|------
   */
  public static createLayoutFunction2( providedOptions?: NumberControlLayoutFunction2Options ): LayoutFunction {

    const options = optionize<NumberControlLayoutFunction2Options>()( {
      align: 'center',
      xSpacing: 5,
      ySpacing: 5
    }, providedOptions );

    return ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {
      assertEnabled() && assert( decrementButton );
      assertEnabled() && assert( incrementButton );

      slider.mutateLayoutOptions( {
        stretch: true
      } );

      return new VBox( {
        align: options.align,
        spacing: options.ySpacing,
        children: [
          new HBox( {
            spacing: options.xSpacing,
            children: [ titleNode, decrementButton!, numberDisplay, incrementButton! ]
          } ),
          slider
        ]
      } );
    };
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title
   *  < number >
   *  -------|-------
   */
  public static createLayoutFunction3( providedOptions?: NumberControlLayoutFunction3Options ): LayoutFunction {

    const options = optionize<NumberControlLayoutFunction3Options>()( {
      alignTitle: 'center',
      alignNumber: 'center',
      titleLeftIndent: 0,
      xSpacing: 5,
      ySpacing: 5
    }, providedOptions );

    return ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {
      assertEnabled() && assert( decrementButton );
      assertEnabled() && assert( incrementButton );

      slider.mutateLayoutOptions( {
        stretch: true
      } );

      const titleAndContentVBox = new VBox( {
        spacing: options.ySpacing,
        align: options.alignTitle,
        children: [
          new AlignBox( titleNode, { leftMargin: options.titleLeftIndent } ),
          new VBox( {
            layoutOptions: {
              stretch: true
            },
            spacing: options.ySpacing,
            align: options.alignNumber,
            children: [
              new HBox( {
                spacing: options.xSpacing,
                children: [ decrementButton!, numberDisplay, incrementButton! ]
              } ),
              slider
            ]
          } )
        ]
      } );

      // When the text of the title changes recompute the alignment between the title and content
      titleNode.boundsProperty.lazyLink( () => {
        titleAndContentVBox.updateLayout();
      } );
      return titleAndContentVBox;
    };
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Like createLayoutFunction1, but the title and value go all the way to the edges.
   */
  public static createLayoutFunction4( providedOptions?: NumberControlLayoutFunction4Options ): LayoutFunction {

    const options = optionize<NumberControlLayoutFunction4Options>()( {

      // adds additional horizontal space between title and NumberDisplay
      sliderPadding: 0,

      // vertical spacing between slider and title/NumberDisplay
      verticalSpacing: 5,

      // spacing between slider and arrow buttons
      arrowButtonSpacing: 5,
      hasReadoutProperty: null,

      layoutInvisibleButtons: false,

      createBottomContent: null // Supports Pendulum Lab's questionText where a question is substituted for the slider
    }, providedOptions );

    return ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {

      slider.mutateLayoutOptions( {
        grow: 1
      } );

      const includeArrowButtons = !!decrementButton; // if there aren't arrow buttons, then exclude them
      const bottomBox = new HBox( {
        spacing: options.arrowButtonSpacing,
        children: !includeArrowButtons ? [ slider ] : [
          decrementButton,
          slider,
          incrementButton!
        ],
        excludeInvisibleChildrenFromBounds: !options.layoutInvisibleButtons
      } );

      const bottomContent = options.createBottomContent ? options.createBottomContent( bottomBox ) : bottomBox;

      bottomContent.mutateLayoutOptions( {
        stretch: true,
        xMargin: options.sliderPadding
      } );

      // Dynamic layout supported
      return new VBox( {
        spacing: options.verticalSpacing,
        children: [
          new HBox( {
            spacing: options.sliderPadding,
            children: [
              titleNode,
              new Node( {
                children: [ numberDisplay ],
                visibleProperty: options.hasReadoutProperty || null,
                excludeInvisibleChildrenFromBounds: true
              } )
            ],
            layoutOptions: { stretch: true }
          } ),
          bottomContent
        ]
      } );
    };
  }
}

/**
 * Validate all of the callback related options. There are two types of callbacks. The "start/endCallback" pair
 * are passed into all components in the NumberControl. The second set are start/end callbacks for each individual
 * component. This was added to support multitouch in Rutherford Scattering as part of
 * https://github.com/phetsims/rutherford-scattering/issues/128.
 *
 * This function mutates the options by initializing general callbacks from null (in the extend call) to a no-op
 * function.
 *
 * Only general or specific callbacks are allowed, but not both.
 */
function validateCallbacks( options: NumberControlOptions ): void {
  const normalCallbacksPresent = !!( options.startCallback ||
                                     options.endCallback );
  let arrowCallbacksPresent = false;
  let sliderCallbacksPresent = false;

  if ( options.arrowButtonOptions ) {
    arrowCallbacksPresent = specificCallbackKeysInOptions( options.arrowButtonOptions );
  }

  if ( options.sliderOptions ) {
    sliderCallbacksPresent = specificCallbackKeysInOptions( options.sliderOptions );
  }

  const specificCallbacksPresent = arrowCallbacksPresent || sliderCallbacksPresent;

  // only general or component specific callbacks are supported
  assertEnabled() && assert( !( normalCallbacksPresent && specificCallbacksPresent ),
    'Use general callbacks like "startCallback" or specific callbacks like "sliderOptions.startDrag" but not both.' );
}

/**
 * Check for an intersection between the array of callback option keys and those
 * passed in the options object. These callback options are only the specific component callbacks, not the general
 * start/end that are called for every component's interaction
 */
function specificCallbackKeysInOptions( options: Record<string, unknown> ): boolean {
  const optionKeys = Object.keys( options );
  const intersection = SPECIFIC_COMPONENT_CALLBACK_OPTIONS.filter( x => _.includes( optionKeys, x ) );
  return intersection.length > 0;
}