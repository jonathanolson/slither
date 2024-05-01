import { PatternRule } from '../PatternRule.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { PatternAttributeSetMapping, SolutionSet } from '../SolutionSet.ts';
import { AttributeSet } from '../formal-concept/AttributeSet.ts';
import _ from '../../../workarounds/_.ts';
import { SolutionFormalContext } from '../formal-concept/SolutionFormalContext.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { optionize3 } from 'phet-lib/phet-core';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';

export type GetFeatureImpliedRulesOptions = {
  logModulo?: number;
};

export const GET_FEATURE_IMPLIED_RULES_DEFAULTS = {
  logModulo: 1000000,
};

export const getFeatureImpliedRules = (
  featureSet: FeatureSet,
  includeEdges: boolean,
  includeSectors: boolean,
  includeFaces: boolean,
  highlander: boolean,
  providedOptions?: GetFeatureImpliedRulesOptions
): PatternRule[] => {
  const options = optionize3<GetFeatureImpliedRulesOptions>()( {}, GET_FEATURE_IMPLIED_RULES_DEFAULTS, providedOptions );

  let initialSolutionSet = SolutionSet.fromFeatureSet(
    featureSet,
    includeEdges,
    includeSectors,
    includeFaces,
    highlander
  );

  // We might have faces that have no solutions!
  if ( !initialSolutionSet ) {
    return [];
  }

  console.log( 'solutions', initialSolutionSet.numSolutions );

  const solutionSet = initialSolutionSet;

  const mapping = new PatternAttributeSetMapping( solutionSet.patternBoard, solutionSet.shape );

  // let edgeHighlanderCodeMask = 0n;
  //
  // // Holds pairs that detect features (red exit edge features) in the attribute set, and then IF that matches, the
  // // bit pattern to & to the mask to get the (reduced) highlander mask.
  // const edgeHighlanderCodePairs: [ bigint, bigint ][] = [];
  //
  // if ( highlander ) {
  //   // TODO NOTE: if we fully rule out all solutions FROM THE START... we should potentially create a rule that says "all determinate edges are red?"
  //   // maybe NO: "everything red" will be a solution
  //   // TODO: if it is an "invalid" pattern for highlander, all will be filtered, including "everything red"
  //
  //   const indeterminateEdges = getIndeterminateEdges( featureSet.patternBoard, featureSet.getFeaturesArray() );
  //
  //   for ( const indeterminateEdge of indeterminateEdges ) {
  //     edgeHighlanderCodeMask |= 0x3n << BigInt( 2 * indeterminateEdge.index );
  //   }
  //
  //   // Attribute mask with all bits set
  //   const fullMask = ( 1n << BigInt( 2 * featureSet.patternBoard.edges.length ) ) - 1n;
  //
  //   for ( const edge of featureSet.patternBoard.edges ) {
  //     if ( edge.isExit ) {
  //       const redSolutionEdgeIndex = 3 * edge.index + 1;
  //       const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );
  //
  //       edgeHighlanderCodePairs.push( [
  //         // a mask to detect the presence of a red exit edge in an attribute set
  //         1n << BigInt( redAttributeEdgeIndex ),
  //
  //         // a mask with all bits set EXCEPT those that should be removed from the edgeHighlanderCodeMask when this
  //         // feature is present
  //         fullMask - ( 0x3n << BigInt( 2 * edge.index ) )
  //       ] );
  //     }
  //   }
  // }

  const solutionAttributeSets = _.range( 0, solutionSet.numSolutions ).map( solutionIndex => {
    // TODO: factor back in?
    const baseBigint = mapping.getBigint( solutionSet.bitData, solutionIndex );

    const simpleAttributeSet = AttributeSet.fromBinary( mapping.numBits, baseBigint );

    let redEdgeData = BigInt( 0 );
    let edgeHighlanderCode = BigInt( 0 );
    let vertexConnectionKey: string | null = null;

    if ( includeEdges ) {
      featureSet.patternBoard.edges.forEach( edge => {
        if ( !edge.isExit ) {
          return;
        }

        const redSolutionEdgeIndex = 3 * edge.index + 1;
        const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );

        // TODO: map directly from solutions ideally
        if ( simpleAttributeSet.hasAttribute( redAttributeEdgeIndex ) ) {
          return;
        }

        const hasNoBlackNonExitEdges = edge.exitVertex!.edges.every( edge => {
          return edge.isExit || !simpleAttributeSet.hasAttribute( mapping.mapBitIndex( 3 * edge.index ) );
        } );

        if ( hasNoBlackNonExitEdges ) {
          redEdgeData |= BigInt( 1 ) << BigInt( redAttributeEdgeIndex );
        }
      } );

      if ( highlander ) {
        vertexConnectionKey = solutionSet.vertexConnectionsKeys![ solutionIndex ];

        for ( let edgeIndex = 0; edgeIndex < featureSet.patternBoard.edges.length; edgeIndex++ ) {
          const edge = featureSet.patternBoard.edges[ edgeIndex ];

          const isBlack = solutionSet.hasSolutionEdge( solutionIndex, edge );

          // TODO: deduplicate the above information processing? we're copying some stuff
          const isRedOrExitDoubleBlack = edge.isExit && !isBlack && edge.exitVertex!.edges.every( otherEdge => {
            // Note the confusing terminology. We RETURN TRUE if all non-exit edges are RED.
            // This allows the EXIT EDGE to be either "red" or "double black"
            return otherEdge.isExit || !solutionSet.hasSolutionEdge( solutionIndex, otherEdge );
          } );

          edgeHighlanderCode |= ( isBlack ? 0x2n : ( isRedOrExitDoubleBlack ? 0x3n : 0x1n ) ) << BigInt( 2 * edgeIndex );
        }
      }
    }

    return SolutionAttributeSet.fromSolutionBinary( mapping.numBits, baseBigint, redEdgeData, edgeHighlanderCode, vertexConnectionKey );
  } );

  // TODO: omg this code
  let highlanderSolutionsMap: SolutionAttributeSet[][]; // highlanderSolutionsMap[ binary-exit-edges ] = pre-filtered solutions
  let highlanderExitEdgeMap: number[] | null; // arr[ exit-edge-index ] = map into attribute set
  // TODO: omg, don't try to hide all of this from SolutionFormalContext. This is a mess.
  if ( highlander ) {
    // TODO: can pack more efficiently for cases where we assume certain exit edges are red
    const exitEdges = featureSet.patternBoard.edges.filter( edge => edge.isExit );

    highlanderSolutionsMap = new Array<SolutionAttributeSet[]>( 1 << exitEdges.length );

    // TODO: in the future, we'll be able to prune based on "no solutions before? no solutions now"
    const recur = ( index: number, highlanderIndex: number, mask: bigint ) => {
      if ( index === exitEdges.length ) {
        const solutionMap = new Map<string, SolutionAttributeSet | null>();

        for ( const solution of solutionAttributeSets ) {
          const key = `${solution.edgeHighlanderCode & mask}/${solution.vertexConnectionKey}`;
          if ( !solutionMap.has( key ) ) {
            solutionMap.set( key, solution );
          }
          else {
            solutionMap.set( key, null );
          }
        }

        const solutions: SolutionAttributeSet[] = [];

        for ( const solution of solutionMap.values() ) {
          if ( solution ) {
            solutions.push( solution );
          }
        }

        highlanderSolutionsMap[ highlanderIndex ] = solutions;
      }
      else {
        recur( index + 1, highlanderIndex, mask );
        recur( index + 1, highlanderIndex | ( 1 << index ), mask - ( 0x3n << BigInt( 2 * exitEdges[ index ].index ) ) );
      }
    };
    // Initially set all bits
    let baseHighlanderMask = ( 1n << BigInt( 2 * featureSet.patternBoard.edges.length ) ) - 1n;

    // Remove determinate non-exit edges
    const indeterminateEdges = getIndeterminateEdges( featureSet.patternBoard, featureSet.getFeaturesArray() );
    for ( const edge of featureSet.patternBoard.edges ) {
      if ( !edge.isExit && !indeterminateEdges.includes( edge ) ) {
        baseHighlanderMask -= ( 0x3n << BigInt( 2 * edge.index ) );
      }
    }

    recur( 0, 0, baseHighlanderMask );

    highlanderExitEdgeMap = exitEdges.map( edge => {
      const redSolutionEdgeIndex = 3 * edge.index + 1;
      const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );
      return redAttributeEdgeIndex;
    } );
  }
  else {
    highlanderSolutionsMap = [];
    highlanderExitEdgeMap = null;
  }

  const formalContext = new SolutionFormalContext(
    mapping.numBits, solutionAttributeSets, highlander,
    highlanderSolutionsMap, highlanderExitEdgeMap
  );

  // console.log( featureSet.toCanonicalString() );
  // console.log( formalContext.toString() );
  //
  // if ( featureSet.getFeaturesArray().length === 0 ) {
  //   const input = AttributeSet.getEmpty( mapping.numBits ).withAttribute( 8 );
  //   const output = formalContext.getClosure( input );
  //
  //   console.log( 'input', input.toString() );
  //   console.log( 'output', output.toString() );
  //
  //   debugger;
  //   formalContext.getClosure( input );
  // }

  const invalidAttributeSet = AttributeSet.getFull( mapping.numBits );

  const rules: PatternRule[] = [];
  formalContext.forEachImplication( implication => {
    if ( implication.consequent.equals( invalidAttributeSet ) ) {
      return;
    }

    const inputFeatureSet = featureSet.clone();
    const inputNumbers = mapping.getNumbers( implication.antecedent.getBits() );
    SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, inputNumbers, inputFeatureSet );

    const outputFeatureSet = featureSet.clone();
    const outputNumbers = mapping.getNumbers( implication.consequent.getBits() );
    SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, outputNumbers, outputFeatureSet );

    // if ( assertEnabled() ) {
    //   for ( let i = 0; i < solutionSet.numSolutions; i++ ) {
    //     const offset = i * solutionSet.shape.numNumbersPerSolution;
    //     let inputMatches = true;
    //     let outputMatches = true;
    //
    //     for ( let j = 0; j < solutionSet.shape.numNumbersPerSolution; j++ ) {
    //       if ( ( inputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== inputNumbers[ j ] ) {
    //         inputMatches = false;
    //       }
    //       if ( ( outputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== outputNumbers[ j ] ) {
    //         outputMatches = false;
    //       }
    //     }
    //
    //     // Implication
    //     assert( !inputMatches || outputMatches );
    //   }
    // }

    if ( inputFeatureSet.equals( outputFeatureSet ) ) {
      return;
    }

    rules.push( new PatternRule( solutionSet.patternBoard, inputFeatureSet, outputFeatureSet ) );

  //   if ( inputFeatureSet.equals( FeatureSet.deserialize( {
  //     "faceValues": [
  //         {
  //             "face": 0,
  //             "value": 1
  //         },
  //         {
  //             "face": 1,
  //             "value": null
  //         },
  //         {
  //             "face": 6,
  //             "value": null
  //         },
  //         {
  //             "face": 7,
  //             "value": null
  //         },
  //         {
  //             "face": 8,
  //             "value": null
  //         },
  //         {
  //             "face": 9,
  //             "value": null
  //         }
  //     ],
  //     "blackEdges": [
  //         7
  //     ],
  //     "redEdges": [
  //         8,
  //         13
  //     ]
  // }, solutionSet.patternBoard ) ) ) {
  //     debugger;
  //   }

    // if ( JSON.stringify( inputFeatureSet.serialize() ) === `{"faceValues":[{"face":0,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[4]}` ) {
    //   debugger;
    // }
  }, {
    logModulo: options.logModulo
  } );

  return rules;
};