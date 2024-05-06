import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import { PatternRule } from '../pattern/PatternRule.ts';
import { TPatternBoard } from '../pattern/TPatternBoard.ts';
import { Embedding } from '../pattern/Embedding.ts';
import { getEmbeddings } from '../pattern/getEmbeddings.ts';
import { BoardPatternBoard } from '../pattern/BoardPatternBoard.ts';
import { BoardFeatureData } from '../pattern/BoardFeatureData.ts';
import FeatureSetMatchState from '../pattern/FeatureSetMatchState.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TAction } from '../data/core/TAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { BlackEdgeFeature } from '../pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from '../pattern/feature/RedEdgeFeature.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { SectorNotZeroFeature } from '../pattern/feature/SectorNotZeroFeature.ts';
import { SectorNotOneFeature } from '../pattern/feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../pattern/feature/SectorNotTwoFeature.ts';
import { SectorOnlyOneFeature } from '../pattern/feature/SectorOnlyOneFeature.ts';
import { SectorStateSetAction } from '../data/sector-state/SectorStateSetAction.ts';
import { FaceColorDualFeature } from '../pattern/feature/FaceColorDualFeature.ts';
import { FaceFeature } from '../pattern/feature/FaceFeature.ts';
import _ from '../../workarounds/_.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import { getFaceColorPointer } from '../data/face-color/FaceColorPointer.ts';
import { TPatternFace } from '../pattern/TPatternFace.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { AnnotatedFaceColorDual, AnnotatedFaceValue } from '../data/core/TAnnotation.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TSector } from '../data/sector-state/TSector.ts';
import { TFace } from '../board/core/TFace.ts';

type Data = TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData;

export class ScanPatternSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private nextIndex: number;
  private readonly boardPatternBoard: BoardPatternBoard;

  private readonly dirtyListener: () => void;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly rules: PatternRule[],
    initialIndex = 0
  ) {
    this.nextIndex = initialIndex;

    this.dirtyListener = () => {
      this.nextIndex = 0;
    };

    this.state.faceValueChangedEmitter.addListener( this.dirtyListener );
    this.state.edgeStateChangedEmitter.addListener( this.dirtyListener );
    this.state.sectorStateChangedEmitter.addListener( this.dirtyListener );
    this.state.faceColorsChangedEmitter.addListener( this.dirtyListener );

    // TODO: HOW CAN WE CACHE THIS, it might memory leak getEmbeddings?
    // TODO: We can side-step this and NOT use getEmbeddings(!)
    this.boardPatternBoard = new BoardPatternBoard( board );
  }

  public get dirty(): boolean {
    return this.nextIndex < this.rules.length;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    const boardFeatureData = new BoardFeatureData( this.boardPatternBoard, this.state );

    let lastEmbeddings: Embedding[] = [];
    let lastPatternBoard: TPatternBoard | null = null;

    while ( this.nextIndex < this.rules.length ) {
      const rule = this.rules[ this.nextIndex ];
      this.nextIndex++; // increment here, so if we return early, we'll be pointed to the next one.

      if ( rule.patternBoard !== lastPatternBoard ) {
        lastPatternBoard = rule.patternBoard;
        // TODO: this is a memory leak, don't use it
        lastEmbeddings = getEmbeddings( rule.patternBoard, this.boardPatternBoard );
      }

      for ( const embedding of lastEmbeddings ) {
        // Does our input match
        if ( rule.inputFeatureSet.getBoardMatchState( boardFeatureData, embedding, true ) === FeatureSetMatchState.MATCH ) {

          // Is our output not fully satisfied!
          if ( rule.outputFeatureSet.getBoardMatchState( boardFeatureData, embedding, true ) !== FeatureSetMatchState.MATCH ) {

            const embeddedInputFeatureSet = rule.inputFeatureSet.embedded( this.boardPatternBoard, embedding )!;

            if ( embeddedInputFeatureSet ) {
              const embeddedOutputFeatureSet = rule.outputFeatureSet.embedded( this.boardPatternBoard, embedding )!;
              assertEnabled() && assert( embeddedOutputFeatureSet );

              const inputFeatures = embeddedInputFeatureSet.getFeaturesArray();
              const outputFeatures = embeddedOutputFeatureSet.getFeaturesArray();

              const actions: TAction<Data>[] = [];

              const affectedEdges = new Set<TEdge>();
              const affectedSectors = new Set<TSector>();
              const affectedFaces = new Set<TFace>();

              // Prep the actions
              for ( const feature of outputFeatures ) {
                if ( feature instanceof BlackEdgeFeature || feature instanceof RedEdgeFeature ) {
                  const isBlack = feature instanceof BlackEdgeFeature;
                  const edge = this.boardPatternBoard.getEdge( feature.edge );

                  const currentEdgeState = this.state.getEdgeState( edge );

                  if ( currentEdgeState === EdgeState.WHITE ) {
                    actions.push( new EdgeStateSetAction( edge, isBlack ? EdgeState.BLACK : EdgeState.RED ) );
                    affectedEdges.add( edge );
                  }
                  else if ( ( currentEdgeState === EdgeState.BLACK ) !== isBlack ) {
                    throw new InvalidStateError( 'Edge is not in the correct state' );
                  }
                }
                else if ( feature instanceof SectorNotZeroFeature || feature instanceof SectorNotOneFeature || feature instanceof SectorNotTwoFeature || feature instanceof SectorOnlyOneFeature ) {
                  const sector = this.boardPatternBoard.getSector( feature.sector );
                  const currentSectorState = this.state.getSectorState( sector );

                  if ( feature instanceof SectorNotZeroFeature ) {
                    if ( currentSectorState.zero ) {
                      if ( !currentSectorState.one && !currentSectorState.two ) {
                        throw new InvalidStateError( 'Sector cannot be made impossible' );
                      }

                      actions.push( new SectorStateSetAction( sector, currentSectorState.withDisallowZero() ) );
                      affectedSectors.add( sector );
                    }
                  }
                  else if ( feature instanceof SectorNotOneFeature ) {
                    if ( currentSectorState.one ) {
                      if ( !currentSectorState.zero && !currentSectorState.two ) {
                        throw new InvalidStateError( 'Sector cannot be made impossible' );
                      }

                      actions.push( new SectorStateSetAction( sector, currentSectorState.withDisallowOne() ) );
                      affectedSectors.add( sector );
                    }
                  }
                  else if ( feature instanceof SectorNotTwoFeature ) {
                    if ( currentSectorState.two ) {
                      if ( !currentSectorState.zero && !currentSectorState.one ) {
                        throw new InvalidStateError( 'Sector cannot be made impossible' );
                      }

                      actions.push( new SectorStateSetAction( sector, currentSectorState.withDisallowTwo() ) );
                      affectedSectors.add( sector );
                    }
                  }
                  else if ( feature instanceof SectorOnlyOneFeature ) {
                    if ( currentSectorState.zero || currentSectorState.two ) {
                      if ( !currentSectorState.one ) {
                        throw new InvalidStateError( 'Sector cannot be made impossible' );
                      }

                      actions.push( new SectorStateSetAction( sector, currentSectorState.withDisallowZero().withDisallowTwo() ) );
                      affectedSectors.add( sector );
                    }
                  }
                }
                else if ( feature instanceof FaceColorDualFeature ) {
                  const getUniqueColors = ( patternFaces: TPatternFace[] ): TFaceColor[] => _.uniq( patternFaces.map( patternFace => {
                    const face = this.boardPatternBoard.getFace( patternFace );
                    return face ? this.state.getFaceColor( face ) : this.state.getOutsideColor();
                  } ) );

                  const primaryFaceColors = getUniqueColors( feature.primaryFaces );
                  const secondaryFaceColors = getUniqueColors( feature.secondaryFaces );

                  const primaryOppositeFaceColors = primaryFaceColors.map( color => this.state.getOppositeFaceColor( color ) );
                  const secondaryOppositeFaceColors = secondaryFaceColors.map( color => this.state.getOppositeFaceColor( color ) );

                  // General invalidity checks
                  for ( const color of primaryFaceColors ) {
                    if ( secondaryFaceColors.includes( color ) ) {
                      throw new InvalidStateError( 'Cannot make primary and secondary colors the same' );
                    }
                    if ( primaryOppositeFaceColors.includes( color ) ) {
                      throw new InvalidStateError( 'Cannot make primary and opposite colors the same' );
                    }
                  }
                  for ( const color of secondaryFaceColors ) {
                    if ( secondaryOppositeFaceColors.includes( color ) ) {
                      throw new InvalidStateError( 'Cannot make secondary and opposite colors the same' );
                    }
                  }

                  const addAffectedFaces = ( colorA: TFaceColor, colorB: TFaceColor ): void => {
                    [ ...feature.allFaces ].forEach( patternFace => {
                      const face = this.boardPatternBoard.getFace( patternFace );
                      const color = face ? this.state.getFaceColor( face ) : this.state.getOutsideColor();
                      if ( face && ( color === colorA || color === colorB ) ) {
                        affectedFaces.add( face );
                      }
                    } );
                  };

                  // Set up colors to be the same
                  for ( const sameColors of [ primaryFaceColors, secondaryFaceColors ] ) {
                    if ( sameColors.length > 1 ) {
                      for ( let i = 1; i < sameColors.length; i++ ) {
                        const colorA = sameColors[ 0 ];
                        const colorB = sameColors[ i ];

                        actions.push( new FaceColorMakeSameAction( getFaceColorPointer( this.state, colorA ), getFaceColorPointer( this.state, colorB ) ) );
                        addAffectedFaces( colorA, colorB );
                      }
                    }
                  }

                  // Set up one to be the opposite
                  if ( secondaryFaceColors.length && primaryFaceColors[ 0 ] !== secondaryOppositeFaceColors[ 0 ] ) {
                    actions.push( new FaceColorMakeOppositeAction( getFaceColorPointer( this.state, primaryFaceColors[ 0 ] ), getFaceColorPointer( this.state, secondaryFaceColors[ 0 ] ) ) );
                    addAffectedFaces( primaryFaceColors[ 0 ], secondaryFaceColors[ 0 ] );
                  }
                }
                else {
                  assertEnabled() && assert( feature instanceof FaceFeature );
                }
              }

              assertEnabled() && assert( actions.length, 'We should not need a guard, right?' );
              if ( actions.length ) {

                const inputFaceValues: AnnotatedFaceValue[] = ( inputFeatures.filter( feature => feature instanceof FaceFeature ) as FaceFeature[] ).map( feature => {
                  return {
                    face: this.boardPatternBoard.getFace( feature.face ),
                    value: feature.value
                  };
                } );
                const outputFaceValues: AnnotatedFaceValue[] = ( outputFeatures.filter( feature => feature instanceof FaceFeature ) as FaceFeature[] ).map( feature => {
                  return {
                    face: this.boardPatternBoard.getFace( feature.face ),
                    value: feature.value
                  };
                } );

                // TODO: could improve performance, this is lazy
                const inputBlackEdges = ( inputFeatures.filter( feature => feature instanceof BlackEdgeFeature ) as BlackEdgeFeature[] ).map( feature => this.boardPatternBoard.getEdge( feature.edge ) );
                const outputBlackEdges = ( outputFeatures.filter( feature => feature instanceof BlackEdgeFeature ) as BlackEdgeFeature[] ).map( feature => this.boardPatternBoard.getEdge( feature.edge ) );

                const inputRedEdges = ( inputFeatures.filter( feature => feature instanceof RedEdgeFeature ) as RedEdgeFeature[] ).map( feature => this.boardPatternBoard.getEdge( feature.edge ) );
                const outputRedEdges = ( outputFeatures.filter( feature => feature instanceof RedEdgeFeature ) as RedEdgeFeature[] ).map( feature => this.boardPatternBoard.getEdge( feature.edge ) );

                const inputSectorsNotZero = ( inputFeatures.filter( feature => feature instanceof SectorNotZeroFeature ) as SectorNotZeroFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );
                const outputSectorsNotZero = ( outputFeatures.filter( feature => feature instanceof SectorNotZeroFeature ) as SectorNotZeroFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );

                const inputSectorsNotOne = ( inputFeatures.filter( feature => feature instanceof SectorNotOneFeature ) as SectorNotOneFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );
                const outputSectorsNotOne = ( outputFeatures.filter( feature => feature instanceof SectorNotOneFeature ) as SectorNotOneFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );

                const inputSectorsNotTwo = ( inputFeatures.filter( feature => feature instanceof SectorNotTwoFeature ) as SectorNotTwoFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );
                const outputSectorsNotTwo = ( outputFeatures.filter( feature => feature instanceof SectorNotTwoFeature ) as SectorNotTwoFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );

                const inputSectorsOnlyOne = ( inputFeatures.filter( feature => feature instanceof SectorOnlyOneFeature ) as SectorOnlyOneFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );
                const outputSectorsOnlyOne = ( outputFeatures.filter( feature => feature instanceof SectorOnlyOneFeature ) as SectorOnlyOneFeature[] ).map( feature => this.boardPatternBoard.getSector( feature.sector ) );

                const inputFaceColorDualFeatures = ( inputFeatures.filter( feature => feature instanceof FaceColorDualFeature ) as FaceColorDualFeature[] );
                const outputFaceColorDualFeatures = ( outputFeatures.filter( feature => feature instanceof FaceColorDualFeature ) as FaceColorDualFeature[] );

                const toDual = ( feature: FaceColorDualFeature ): AnnotatedFaceColorDual => {
                  return {
                    primaryFaces: feature.primaryFaces.map( patternFace => this.boardPatternBoard.getFace( patternFace ) ),
                    secondaryFaces: feature.secondaryFaces.map( patternFace => this.boardPatternBoard.getFace( patternFace ) )
                  };
                };

                const inputFaceColorDuals = inputFaceColorDualFeatures.map( toDual );
                const outputFaceColorDuals = outputFaceColorDualFeatures.map( toDual );

                // TODO: we'll want to create a new annotation for this (add to the output display)
                return new AnnotatedAction( new CompositeAction( actions ), {
                  type: 'Pattern',
                  rule: rule,
                  embedding: embedding,
                  boardPatternBoard: this.boardPatternBoard,
                  input: {
                    faceValues: inputFaceValues,
                    blackEdges: inputBlackEdges,
                    redEdges: inputRedEdges,
                    sectorsNotZero: inputSectorsNotZero,
                    sectorsNotOne: inputSectorsNotOne,
                    sectorsNotTwo: inputSectorsNotTwo,
                    sectorsOnlyOne: inputSectorsOnlyOne,
                    faceColorDuals: inputFaceColorDuals,
                  },
                  output: {
                    faceValues: outputFaceValues,
                    blackEdges: outputBlackEdges,
                    redEdges: outputRedEdges,
                    sectorsNotZero: outputSectorsNotZero,
                    sectorsNotOne: outputSectorsNotOne,
                    sectorsNotTwo: outputSectorsNotTwo,
                    sectorsOnlyOne: outputSectorsOnlyOne,
                    faceColorDuals: outputFaceColorDuals,
                  },
                  affectedEdges: affectedEdges,
                  affectedSectors: affectedSectors,
                  affectedFaces: affectedFaces,
                } );
              }
            }
          }
        }
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): ScanPatternSolver {
    return new ScanPatternSolver( this.board, equivalentState, this.rules, this.nextIndex );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener( this.dirtyListener );
    this.state.edgeStateChangedEmitter.removeListener( this.dirtyListener );
    this.state.sectorStateChangedEmitter.removeListener( this.dirtyListener );
    this.state.faceColorsChangedEmitter.removeListener( this.dirtyListener );
  }
}
