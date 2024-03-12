import { Color, Node, Path, TPaint } from 'phet-lib/scenery';
import FaceColorState, { TFaceColor, TFaceColorData } from '../../model/data/face-color/TFaceColorData.ts';
import { Shape } from 'phet-lib/kite';
import { TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { arrayDifference } from 'phet-lib/phet-core';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { faceColorDefaultColorProperty, faceColorInsideColorProperty, faceColorOutsideColorProperty, faceColorTargetColorProperty, faceColorThresholdProperty } from '../Theme.ts';
import { okhslToRGBString, parseToOKHSL } from '../../util/color.ts';
import { dotRandom, Vector2 } from 'phet-lib/dot';
import _ from '../../workarounds/_.ts';
import { TFace } from '../../model/board/core/TFace.ts';
import { TBoard } from '../../model/board/core/TBoard.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';

// Look-up table, but also support color shifts and matching a target color
const hueLUT = _.range( 0, 360 ).map( hue => okhslToRGBString( hue, 0.7, 0.55 ) );
faceColorTargetColorProperty.link( () => {
  const targetColor = faceColorTargetColorProperty.value;
  const okhsl = parseToOKHSL( targetColor.toHexString() );

  const hueForce = targetColor.alpha;
  const targetHue = okhsl.h;

  // Depending on the alpha of our target color, control the amount we are pulled to the hue of the target color
  const mapHueDegree = ( hue: number ) => {
    let hueDelta = hue - targetHue;

    // sanity check wrap
    if ( hueDelta > 180 ) {
      hueDelta -= 360;
    }
    if ( hueDelta < -180 ) {
      hueDelta += 360;
    }
    hueDelta *= ( 1 - hueForce );
    hueDelta = Math.round( hueDelta );

    return ( hueDelta + targetHue + 360 ) % 360;
  };

  for ( let i = 0; i < hueLUT.length; i++ ) {
    hueLUT[ i ] = okhslToRGBString( mapHueDegree( i ), okhsl.s, okhsl.l );
  }
} );

export class FaceColorViewNode extends Node {

  private readonly faceColorNodeMap: Map<TFaceColor, FaceColorNode> = new Map();
  private readonly faceColorIdMap: Map<number, TFaceColor> = new Map();

  private readonly adjacentFacesMap = new Map<TFace, TFace[]>;

  private readonly faceColorNodeContainer: Node;

  public constructor(
    public readonly board: TBoard,
    private readonly stateProperty: TReadOnlyProperty<TState<TFaceColorData>>
  ) {
    const faceColorNodeContainer = new Node();

    super( {
      pickable: false,
      children: [ faceColorNodeContainer ]
    } );

    this.faceColorNodeContainer = faceColorNodeContainer;

    board.faces.forEach( face => {
      this.adjacentFacesMap.set( face, face.edges.map( edge => edge.getOtherFace( face ) ).filter( face => face !== null ) as TFace[] );
    } );

    stateProperty.value.getFaceColors().forEach( faceColor => this.addFaceColor( faceColor, stateProperty.value.getFacesWithColor( faceColor ) ) );
    this.updateHues();

    // TODO: see if we're getting performance loss with the clone?
    let previousState = stateProperty.value.clone();

    const stateListener = ( state: TState<TFaceColorData> ) => {

      // NOTE: We weren't getting the correct old state. Going to be overly-cautious here
      const oldState = previousState;
      // TODO: see if we're getting performance loss with the clone?
      previousState = state.clone();

      const oldFaceColors = oldState.getFaceColors();
      const newFaceColors = state.getFaceColors();

      const onlyOldFaceColors: TFaceColor[] = [];
      const onlyNewFaceColors: TFaceColor[] = [];
      const inBothFaceColors: TFaceColor[] = [];

      arrayDifference( oldFaceColors, newFaceColors, onlyOldFaceColors, onlyNewFaceColors, inBothFaceColors );

      const removals = new Set( onlyOldFaceColors );

      // Handle additions first, so we can abuse our faceColorIdMap to handle replacements
      for ( const faceColor of onlyNewFaceColors ) {
        if ( this.faceColorIdMap.has( faceColor.id ) ) {
          const oldFaceColor = this.faceColorIdMap.get( faceColor.id )!;
          this.replaceFaceColor( oldFaceColor, faceColor, state.getFacesWithColor( faceColor ) );
          removals.delete( oldFaceColor ); // don't remove it!
        }
        else {
          this.addFaceColor( faceColor, state.getFacesWithColor( faceColor ) );
        }
      }

      for ( const faceColor of inBothFaceColors ) {
        this.updateFaceColor( faceColor, state.getFacesWithColor( faceColor ) );
      }

      for ( const region of removals ) {
        this.removeFaceColor( region );
      }

      if ( onlyNewFaceColors.length || onlyOldFaceColors.length ) {
        this.updateHues();
      }
    };
    stateProperty.lazyLink( stateListener );
    this.disposeEmitter.addListener( () => stateProperty.unlink( stateListener ) );

    this.disposeEmitter.addListener( () => {
      while ( this.faceColorNodeMap.size ) {
        this.removeFaceColor( this.faceColorNodeMap.keys().next().value );
      }
    } );

    const updateHueListener = () => this.updateHues();
    faceColorTargetColorProperty.lazyLink( updateHueListener );
    faceColorInsideColorProperty.lazyLink( updateHueListener );
    faceColorOutsideColorProperty.lazyLink( updateHueListener );
    faceColorThresholdProperty.lazyLink( updateHueListener );
    faceColorDefaultColorProperty.lazyLink( updateHueListener ); // TODO: might not need this link
    this.updateHues();
    this.disposeEmitter.addListener( () => {
      faceColorTargetColorProperty.unlink( updateHueListener );
      faceColorInsideColorProperty.unlink( updateHueListener );
      faceColorOutsideColorProperty.unlink( updateHueListener );
      faceColorThresholdProperty.unlink( updateHueListener );
      faceColorDefaultColorProperty.unlink( updateHueListener );
    } );
  }

  private addFaceColor( faceColor: TFaceColor, faces: TFace[] ): void {
    const faceColorNode = new FaceColorNode( faceColor, faces );
    this.faceColorNodeMap.set( faceColor, faceColorNode );
    this.faceColorIdMap.set( faceColor.id, faceColor );
    this.faceColorNodeContainer.addChild( faceColorNode );
  }

  private replaceFaceColor( oldFaceColor: TFaceColor, newFaceColor: TFaceColor, faces: TFace[] ): void {
    assertEnabled() && assert( oldFaceColor.id === newFaceColor.id );

    const faceColorNode = this.faceColorNodeMap.get( oldFaceColor );
    faceColorNode!.updateFaceColor( newFaceColor, faces );
    this.faceColorNodeMap.delete( oldFaceColor );
    this.faceColorNodeMap.set( newFaceColor, faceColorNode! );
    this.faceColorIdMap.delete( oldFaceColor.id ); // OR we could just immediately replace it. This seems safer
    this.faceColorIdMap.set( newFaceColor.id, newFaceColor );
  }

  private updateFaceColor( faceColor: TFaceColor, faces: TFace[] ): void {
    const faceColorNode = this.faceColorNodeMap.get( faceColor )!;

    let hasChanged = faceColorNode.faces.length !== faces.length;
    if ( !hasChanged ) {
      for ( let i = 0; i < faces.length; i++ ) {
        const oldFace = faceColorNode.faces[ i ];
        const newFace = faces[ i ];

        if ( oldFace !== newFace ) {
          hasChanged = true;
          break;
        }
      }
    }

    if ( hasChanged ) {
      faceColorNode.updateFaceColor( faceColor, faces );
    }
  }

  private removeFaceColor( faceColor: TFaceColor ): void {
    const faceColorNode = this.faceColorNodeMap.get( faceColor )!;
    this.faceColorNodeContainer.removeChild( faceColorNode );
    this.faceColorNodeMap.delete( faceColor );
    this.faceColorIdMap.delete( faceColor.id );
    faceColorNode.dispose();
  }

  // Force-directed balancing of hues.
  // TODO: This is super similar to the setup in SimpleRegionViewNode. factor this out!!!
  // TODO: we only changed how to get the faces out of a primitive
  private updateHues(): void {

    const state = this.stateProperty.value;

    // TODO: improve perf?
    const faceColorNodes = [ ...this.faceColorNodeMap.values() ].filter( faceColorNode => faceColorNode.faceCount >= faceColorThresholdProperty.value );

    const oppositeMap = new Map<FaceColorNode, FaceColorNode | null>();
    for ( const faceColorNode of faceColorNodes ) {
      const oppositeFaceColor = state.getOppositeFaceColor( faceColorNode.faceColor );
      oppositeMap.set( faceColorNode, oppositeFaceColor ? this.faceColorNodeMap.get( oppositeFaceColor )! : null );
    }

    if ( faceColorNodes.length >= 2 ) {
      const scratchHue = new Vector2( 0, 0 );

      const renormalizeHues = () => {
        // Weighted hue normalize (in prep for other actions?)
        for ( const faceColorNode of faceColorNodes ) {
          if ( faceColorNode.hueVector.getMagnitude() > 1e-6 ) {
            faceColorNode.hueVector.normalize();
          }
          else {
            faceColorNode.hueVector.setXY( dotRandom.nextDouble() - 0.5, dotRandom.nextDouble() - 0.5 ).normalize();
          }
        }
      };

      // TODO: cache this data? (hah, does it really not matter for performance?)
      const faceToFaceColorMap = new Map<TFace, FaceColorNode[]>();
      const pairWeights: { a: FaceColorNode; b: FaceColorNode; weight: number }[] = [];
      this.board.faces.forEach( face => {
        faceToFaceColorMap.set( face, [] );
      } );
      for ( const faceColorNode of faceColorNodes ) {
        const primaryFaceSet = new Set<TFace>();
        for ( const face of faceColorNode.faces ) {
          primaryFaceSet.add( face );
        }
        const finalSet = new Set<TFace>();
        for ( const face of primaryFaceSet ) {
          finalSet.add( face );
          for ( const adjacentFace of this.adjacentFacesMap.get( face )! ) {
            finalSet.add( adjacentFace );
          }
        }
        for ( const face of finalSet ) {
          const faceColorNodes = faceToFaceColorMap.get( face )!;

          if ( faceColorNodes.length ) {
            for ( const otherFaceColorNode of faceColorNodes ) {
              let found = false;
              for ( const pairWeight of pairWeights ) {
                if ( pairWeight.a === otherFaceColorNode && pairWeight.b === faceColorNode ) {
                  pairWeight.weight++;
                  found = true;
                  break;
                }
              }
              if ( !found ) {
                pairWeights.push( {
                  a: otherFaceColorNode,
                  b: faceColorNode,
                  weight: 1
                } );
              }
            }
          }

          faceColorNodes.push( faceColorNode );
        }
      }

      // Initialize forces
      const forces = new Map<FaceColorNode, Vector2>();
      for ( const faceColorNode of faceColorNodes ) {
        forces.set( faceColorNode, Vector2.ZERO.copy() );
      }

      const repulse = ( a: FaceColorNode, b: FaceColorNode, multiplier: number ) => {
        const forceA = forces.get( a )!;
        const forceB = forces.get( b )!;

        const dot = a.hueVector.dot( b.hueVector );
        // TODO: don't we want to normalize this?
        const diff = scratchHue.set( b.hueVector ).subtract( a.hueVector ).normalize();

        const isOpposite = oppositeMap.get( a ) === b;

        const oppositeMultiplier = 1;

        if ( isOpposite ) {
          const zero = -0.3;
          const power = oppositeMultiplier * multiplier * ( ( ( Math.max( zero, dot ) - zero ) / ( 1 - zero ) ) ** 3 );
          diff.multiplyScalar( power );

          forceA.subtract( diff );
          forceB.add( diff );
        }
        else {
          const zero = 0.2;
          const absDot = Math.abs( dot );
          const power = multiplier * ( ( ( Math.max( zero, absDot ) - zero ) / ( 1 - zero ) ) ** 3 );
          diff.multiplyScalar( power );

          forceA.subtract( diff );
          forceB.add( diff );
        }
      };

      let amount = 1;
      for ( let i = 0; i < 100; i++ ) {
        amount *= 0.99;

        // Clear forces
        for ( const faceColorNode of faceColorNodes ) {
          forces.get( faceColorNode )!.setXY( 0, 0 );
        }

        // Location-based forces
        for ( const pairWeight of pairWeights ) {
          const a = pairWeight.a;
          const b = pairWeight.b;
          const weight = pairWeight.weight;
          repulse( a, b, weight );
        }

        // All-region repulsion (if we don't have that many)
        if ( faceColorNodes.length < 8 ) {
          for ( let i = 0; i < faceColorNodes.length; i++ ) {
            const a = faceColorNodes[ i ];
            for ( let j = i + 1; j < faceColorNodes.length; j++ ) {
              repulse( a, faceColorNodes[ j ], 0.2 );
            }
          }
        }

        // Apply forces
        for ( const faceColorNode of faceColorNodes ) {
          const force = forces.get( faceColorNode )!;

          // TODO: maybe avoid this?
          force.multiplyScalar( amount / faceColorNode.faceCount );

          faceColorNode.hueVector.add( force );
          forces.get( faceColorNode )!.setXY( 0, 0 );
        }

        renormalizeHues();
      }
    }

    for ( const faceColorNode of this.faceColorNodeMap.values() ) {
      faceColorNode.updateHue();
    }
  }
}

class FaceColorNode extends Path {

  public readonly hueVector: Vector2;
  public faceCount: number;

  public constructor(
    public faceColor: TFaceColor,
    public faces: TFace[]
  ) {
    const hueVector = Vector2.createPolar( 1, dotRandom.nextDoubleBetween( 0, 2 * Math.PI ) );

    super( FaceColorNode.toShape( faces ), {
      fill: FaceColorNode.hueVectorToPaint( hueVector, faceColor.colorState )
    } );

    this.hueVector = hueVector;
    this.faceCount = faces.length;
  }

  public updateHue(): void {
    const passesThreshold = this.faceCount >= faceColorThresholdProperty.value;
    if ( passesThreshold || this.faceColor.colorState !== FaceColorState.UNDECIDED ) {
      // if we have effectively zero magnitude, just use the x-axis
      this.fill = FaceColorNode.hueVectorToPaint( this.hueVector.getMagnitude() > 1e-6 ? this.hueVector : Vector2.X_UNIT, this.faceColor.colorState );
    }
    else {
      this.fill = faceColorDefaultColorProperty; // TODO: should we just use the value, because we are linked?
    }
  }

  public updateFaceColor( faceColor: TFaceColor, faces: TFace[] ): void {
    this.faceColor = faceColor;
    this.faces = faces;
    this.shape = FaceColorNode.toShape( faces );
    this.faceCount = faces.length;
  }

  public static hueVectorToPaint( hueVector: Vector2, faceColorState: FaceColorState ): TPaint {
    const index = ( Math.round( hueVector.getAngle() * 180 / Math.PI ) + 360 ) % 360;
    assertEnabled() && assert( index >= 0 && index < hueLUT.length );

    const paint = hueLUT[ index ];

    if ( faceColorState === FaceColorState.UNDECIDED ) {
      return paint;
    }
    else {
      const colorProperty = faceColorState === FaceColorState.INSIDE ? faceColorInsideColorProperty : faceColorOutsideColorProperty;
      const color = colorProperty.value;
      const ratio = color.alpha;
      const paintColor = new Color( paint );
      const blended = new Color(
        ( 1 - ratio ) * paintColor.red + ratio * color.red,
        ( 1 - ratio ) * paintColor.green + ratio * color.green,
        ( 1 - ratio ) * paintColor.blue + ratio * color.blue
      );

      return blended.toCSS();
    }
  }

  public static toShape( faces: MultiIterable<TFace> ): Shape {
    const shape = new Shape();

    // TODO: do we encounter conflation with this?
    for ( const face of faces ) {
      shape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) );
    }

    return shape.makeImmutable();
  }
}