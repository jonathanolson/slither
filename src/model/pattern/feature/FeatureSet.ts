import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { assertEnabled, default as assert } from '../../../workarounds/assert.ts';
import { Embedding } from '../Embedding.ts';
import { FaceColorDualFeature } from './FaceColorDualFeature.ts';
import { optionize3 } from 'phet-lib/phet-core';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';
import { PatternBoardSolver } from '../PatternBoardSolver.ts';
import { filterHighlanderSolutions } from '../filterHighlanderSolutions.ts';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';
import _ from '../../../workarounds/_.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { SectorNotOneFeature } from './SectorNotOneFeature.ts';
import { SectorNotZeroFeature } from './SectorNotZeroFeature.ts';
import { SectorNotTwoFeature } from './SectorNotTwoFeature.ts';
import { SectorOnlyOneFeature } from './SectorOnlyOneFeature.ts';
import { FaceFeature } from './FaceFeature.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { TPatternFace } from '../TPatternFace.ts';
import FaceValue from '../../data/face-value/FaceValue.ts';
import { TPatternSector } from '../TPatternSector.ts';
import { IncompatibleFeatureError } from './IncompatibleFeatureError.ts';
import FeatureCompatibility from './FeatureCompatibility.ts';
import { ConnectedFacePair, FaceConnectivity } from '../FaceConnectivity.ts';
import { getEmbeddings } from '../getEmbeddings.ts';
import { SolutionSet } from '../SolutionSet.ts';

// TODO: check code with onlyOne / notOne, make sure we haven't reversed it.
export class FeatureSet {
  // Used for quick comparisons to see which "way" would be more efficient
  public size: number;

  private constructor(
    public readonly patternBoard: TPatternBoard,
    private readonly faceValueMap: Map<TPatternFace, FaceValue> = new Map(),

    private readonly blackEdges: Set<TPatternEdge> = new Set(),
    private readonly redEdges: Set<TPatternEdge> = new Set(),

    private readonly sectorsNotZero: Set<TPatternSector> = new Set(),
    private readonly sectorsNotOne: Set<TPatternSector> = new Set(),
    private readonly sectorsNotTwo: Set<TPatternSector> = new Set(),
    private readonly sectorsOnlyOne: Set<TPatternSector> = new Set(),

    private readonly faceColorDualFeatures: Set<FaceColorDualFeature> = new Set(),

    private readonly faceToColorDualMap: Map<TPatternFace, FaceColorDualFeature> = new Map(),
    private readonly sectors: Set<TPatternSector> = new Set(),
    private readonly edgeToSectorsMap: Map<TPatternEdge, Set<TPatternSector>> = new Map(),
  ) {
    this.size = this.computeSize();
  }

  public addFaceValue( face: TPatternFace, value: FaceValue ): void {
    const existingValue = this.faceValueMap.get( face );
    if ( existingValue ) {
      if ( existingValue !== value ) {
        throw new IncompatibleFeatureError( new FaceFeature( face, value ), [ new FaceFeature( face, existingValue ) ] );
      }
    }
    else {
      this.faceValueMap.set( face, value );
      this.size++;
    }

    assertEnabled() && this.verifySize();
  }

  // TODO: optimize this (so we're not creating things and replacing)
  public addSameColorFaces( faceA: TPatternFace, faceB: TPatternFace ): void {
    this.addFaceColorDual( FaceColorDualFeature.fromPrimarySecondaryFaces( [ faceA, faceB ], [] ) );
  }

  // TODO: optimize this (so we're not creating things and replacing)
  public addOppositeColorFaces( faceA: TPatternFace, faceB: TPatternFace ): void {
    this.addFaceColorDual( FaceColorDualFeature.fromPrimarySecondaryFaces( [ faceA ], [ faceB ] ) );
  }

  public addFaceColorDual( feature: FaceColorDualFeature ): void {
    assertEnabled() && assert( feature );

    const originalFeature = feature;

    // Copy to array for concurrent modification (sanity check)
    for ( const otherFeature of [ ...this.faceColorDualFeatures ] ) {
      if ( feature.overlapsWith( otherFeature ) ) {
        const potentialFaceFeature = feature.union( otherFeature );
        if ( potentialFaceFeature ) {
          feature = potentialFaceFeature!;
          this.faceColorDualFeatures.delete( otherFeature );
          this.size -= otherFeature.allFaces.size - 1;
        }
        else {
          throw new IncompatibleFeatureError( originalFeature, [ otherFeature ] );
        }
      }
    }

    this.faceColorDualFeatures.add( feature );
    this.size += feature.allFaces.size - 1;

    // Update all faces attached to the "new" feature (this will be all of the new ones, plus changed ones from previous features).
    for ( const face of feature.allFaces ) {
      this.faceToColorDualMap.set( face, feature );
    }

    assertEnabled() && this.verifySize();
  }

  public addBlackEdge( edge: TPatternEdge ): void {
    assertEnabled() && assert( edge );

    if ( this.redEdges.has( edge ) ) {
      throw new IncompatibleFeatureError( new BlackEdgeFeature( edge ), [ new RedEdgeFeature( edge ) ] );
    }

    if ( !this.blackEdges.has( edge ) ) {
      this.size++;
    }
    this.blackEdges.add( edge );

    // Handle sector removals (and assertions
    const sectors = this.edgeToSectorsMap.get( edge );
    if ( sectors ) {
      for ( const sector of sectors ) {
        const otherEdge = edge === sector.edges[ 0 ] ? sector.edges[ 1 ] : sector.edges[ 0 ];
        assertEnabled() && assert( otherEdge );

        let remainingSectorCount = 0;

        if ( this.sectorsNotZero.has( sector ) ) {
          this.sectorsNotZero.delete( sector );
          this.size--;
        }

        if ( this.sectorsNotOne.has( sector ) ) {
          if ( this.blackEdges.has( otherEdge ) ) {
            this.sectorsNotOne.delete( sector );
            this.size--;
          }
          else {
            if ( this.redEdges.has( otherEdge ) ) {
              throw new IncompatibleFeatureError( new BlackEdgeFeature( edge ), [ new RedEdgeFeature( otherEdge ), new SectorNotOneFeature( sector ) ] );
            }
            remainingSectorCount++;
          }
        }

        if ( this.sectorsNotTwo.has( sector ) ) {
          if ( this.redEdges.has( otherEdge ) ) {
            this.sectorsNotTwo.delete( sector );
            this.size--;
          }
          else {
            if ( this.blackEdges.has( otherEdge ) ) {
              throw new IncompatibleFeatureError( new BlackEdgeFeature( edge ), [ new BlackEdgeFeature( otherEdge ), new SectorNotTwoFeature( sector ) ] );
            }
            remainingSectorCount++;
          }
        }

        if ( this.sectorsOnlyOne.has( sector ) ) {
          if ( this.redEdges.has( otherEdge ) ) {
            this.sectorsOnlyOne.delete( sector );
            this.size--;
          }
          else {
            if ( this.blackEdges.has( otherEdge ) ) {
              throw new IncompatibleFeatureError( new BlackEdgeFeature( edge ), [ new BlackEdgeFeature( otherEdge ), new SectorOnlyOneFeature( sector ) ] );
            }
            remainingSectorCount++;
          }
        }


        if ( remainingSectorCount === 0 ) {
          this.removeSector( sector );
        }
      }
    }

    assertEnabled() && this.verifySize();
  }

  public addRedEdge( edge: TPatternEdge ): void {
    assertEnabled() && assert( edge );

    if ( this.blackEdges.has( edge ) ) {
      throw new IncompatibleFeatureError( new RedEdgeFeature( edge ), [ new BlackEdgeFeature( edge ) ] );
    }

    if ( !this.redEdges.has( edge ) ) {
      this.size++;
    }
    this.redEdges.add( edge );

    // Handle sector removals (and assertions
    const sectors = this.edgeToSectorsMap.get( edge );
    if ( sectors ) {
      for ( const sector of sectors ) {
        const otherEdge = edge === sector.edges[ 0 ] ? sector.edges[ 1 ] : sector.edges[ 0 ];
        assertEnabled() && assert( otherEdge );

        let remainingSectorCount = 0;

        if ( this.sectorsNotTwo.has( sector ) ) {
          this.sectorsNotTwo.delete( sector );
          this.size--;
        }

        if ( this.sectorsNotOne.has( sector ) ) {
          if ( this.redEdges.has( otherEdge ) ) {
            this.sectorsNotOne.delete( sector );
            this.size--;
          }
          else {
            if ( this.blackEdges.has( otherEdge ) ) {
              throw new IncompatibleFeatureError( new RedEdgeFeature( edge ), [ new BlackEdgeFeature( otherEdge ), new SectorNotOneFeature( sector ) ] );
            }
            remainingSectorCount++;
          }
        }

        if ( this.sectorsNotZero.has( sector ) ) {
          if ( this.blackEdges.has( otherEdge ) ) {
            this.sectorsNotZero.delete( sector );
            this.size--;
          }
          else {
            if ( this.redEdges.has( otherEdge ) ) {
              throw new IncompatibleFeatureError( new RedEdgeFeature( edge ), [ new RedEdgeFeature( otherEdge ), new SectorNotZeroFeature( sector ) ] );
            }
            remainingSectorCount++;
          }
        }

        if ( this.sectorsOnlyOne.has( sector ) ) {
          if ( this.blackEdges.has( otherEdge ) ) {
            this.sectorsOnlyOne.delete( sector );
            this.size--;
          }
          else {
            if ( this.redEdges.has( otherEdge ) ) {
              throw new IncompatibleFeatureError( new RedEdgeFeature( edge ), [ new RedEdgeFeature( otherEdge ), new SectorOnlyOneFeature( sector ) ] );
            }
            remainingSectorCount++;
          }
        }


        if ( remainingSectorCount === 0 ) {
          this.removeSector( sector );
        }
      }
    }

    assertEnabled() && this.verifySize();
  }

  public addSectorNotZero( sector: TPatternSector ): void {
    assertEnabled() && assert( sector );

    const edgeA = sector.edges[ 0 ];
    const edgeB = sector.edges[ 1 ];
    assertEnabled() && assert( edgeA && edgeB );

    if ( this.redEdges.has( edgeA ) ) {
      throw new IncompatibleFeatureError( new SectorNotZeroFeature( sector ), [ new RedEdgeFeature( edgeA ) ] );
    }
    if ( this.redEdges.has( edgeB ) ) {
      throw new IncompatibleFeatureError( new SectorNotZeroFeature( sector ), [ new RedEdgeFeature( edgeB ) ] );
    }

    // We can skip adding this sector if we have a black edge
    if ( this.blackEdges.has( edgeA ) || this.blackEdges.has( edgeB ) ) {
      return;
    }

    // NOTE: not-zero + not-two = only-one, BUT we'll rely on rules to do that transformation

    if ( !this.sectorsNotZero.has( sector ) ) {
      this.size++;
    }
    this.sectorsNotZero.add( sector );
    this.ensureSector( sector );

    assertEnabled() && this.verifySize();
  }

  public addSectorNotOne( sector: TPatternSector ): void {
    assertEnabled() && assert( sector );

    const edgeA = sector.edges[ 0 ];
    const edgeB = sector.edges[ 1 ];
    assertEnabled() && assert( edgeA && edgeB );

    if ( this.blackEdges.has( edgeA ) && this.redEdges.has( edgeB ) ) {
      throw new IncompatibleFeatureError( new SectorNotOneFeature( sector ), [ new BlackEdgeFeature( edgeA ), new RedEdgeFeature( edgeB ) ] );
    }
    if ( this.blackEdges.has( edgeB ) && this.redEdges.has( edgeA ) ) {
      throw new IncompatibleFeatureError( new SectorNotOneFeature( sector ), [ new BlackEdgeFeature( edgeB ), new RedEdgeFeature( edgeA ) ] );
    }
    if ( this.sectorsOnlyOne.has( sector ) ) {
      throw new IncompatibleFeatureError( new SectorNotOneFeature( sector ), [ new SectorOnlyOneFeature( sector ) ] );
    }

    // See if we would be redundant
    if (
      ( this.blackEdges.has( edgeA ) && this.blackEdges.has( edgeB ) ) ||
      ( this.redEdges.has( edgeA ) && this.redEdges.has( edgeB ) )
    ) {
      return;
    }

    if ( !this.sectorsNotOne.has( sector ) ) {
      this.size++;
    }
    this.sectorsNotOne.add( sector );
    this.ensureSector( sector );

    assertEnabled() && this.verifySize();
  }

  public addSectorNotTwo( sector: TPatternSector ): void {
    assertEnabled() && assert( sector );

    const edgeA = sector.edges[ 0 ];
    const edgeB = sector.edges[ 1 ];
    assertEnabled() && assert( edgeA && edgeB );

    if ( this.blackEdges.has( edgeA ) && this.blackEdges.has( edgeB ) ) {
      throw new IncompatibleFeatureError( new SectorNotTwoFeature( sector ), [ new BlackEdgeFeature( edgeA ), new BlackEdgeFeature( edgeB ) ] );
    }

    // See if we would be redundant
    if ( this.redEdges.has( edgeA ) || this.redEdges.has( edgeB ) ) {
      return;
    }

    // NOTE: not-zero + not-two = only-one, BUT we'll rely on rules to do that transformation

    if ( !this.sectorsNotTwo.has( sector ) ) {
      this.size++;
    }
    this.sectorsNotTwo.add( sector );
    this.ensureSector( sector );

    assertEnabled() && this.verifySize();
  }

  public addSectorOnlyOne( sector: TPatternSector ): void {
    assertEnabled() && assert( sector );

    const edgeA = sector.edges[ 0 ];
    const edgeB = sector.edges[ 1 ];
    assertEnabled() && assert( edgeA && edgeB );

    if ( this.blackEdges.has( edgeA ) && this.blackEdges.has( edgeB ) ) {
      throw new IncompatibleFeatureError( new SectorOnlyOneFeature( sector ), [ new BlackEdgeFeature( edgeA ), new BlackEdgeFeature( edgeB ) ] );
    }
    if ( this.redEdges.has( edgeA ) && this.redEdges.has( edgeB ) ) {
      throw new IncompatibleFeatureError( new SectorOnlyOneFeature( sector ), [ new RedEdgeFeature( edgeA ), new RedEdgeFeature( edgeB ) ] );
    }
    if ( this.sectorsNotOne.has( sector ) ) {
      throw new IncompatibleFeatureError( new SectorOnlyOneFeature( sector ), [ new SectorNotOneFeature( sector ) ] );
    }

    // See if we would be redundant
    if (
      ( this.blackEdges.has( edgeA ) && this.redEdges.has( edgeB ) ) ||
      ( this.blackEdges.has( edgeB ) && this.redEdges.has( edgeA ) )
    ) {
      return;
    }

    if ( !this.sectorsOnlyOne.has( sector ) ) {
      this.size++;
    }
    this.sectorsOnlyOne.add( sector );
    this.ensureSector( sector );

    assertEnabled() && this.verifySize();
  }

  // Mutates by adding a feature
  public addFeature( feature: TEmbeddableFeature ): void {
    if ( feature instanceof FaceFeature ) {
      this.addFaceValue( feature.face, feature.value );
    }
    else if ( feature instanceof FaceColorDualFeature ) {
      this.addFaceColorDual( feature );
    }
    else if ( feature instanceof BlackEdgeFeature ) {
      this.addBlackEdge( feature.edge );
    }
    else if ( feature instanceof RedEdgeFeature ) {
      this.addRedEdge( feature.edge );
    }
    else if ( feature instanceof SectorNotZeroFeature ) {
      this.addSectorNotZero( feature.sector );
    }
    else if ( feature instanceof SectorNotOneFeature ) {
      this.addSectorNotOne( feature.sector );
    }
    else if ( feature instanceof SectorNotTwoFeature ) {
      this.addSectorNotTwo( feature.sector );
    }
    else if ( feature instanceof SectorOnlyOneFeature ) {
      this.addSectorOnlyOne( feature.sector );
    }
    else {
      throw new Error( `unimplemented type of feature for FeatureSet: ${feature}` );
    }

    assertEnabled() && this.verifySize();
  }

  private ensureSector( sector: TPatternSector ): void {
    if ( !this.sectors.has( sector ) ) {
      this.sectors.add( sector );

      const edgeA = sector.edges[ 0 ];
      const edgeB = sector.edges[ 1 ];
      assertEnabled() && assert( edgeA && edgeB );

      let sectorsA = this.edgeToSectorsMap.get( edgeA );
      if ( sectorsA ) {
        sectorsA.add( sector );
      }
      else {
        sectorsA = new Set( [ sector ] );
        this.edgeToSectorsMap.set( edgeA, sectorsA );
      }

      let sectorsB = this.edgeToSectorsMap.get( edgeB );
      if ( sectorsB ) {
        sectorsB.add( sector );
      }
      else {
        sectorsB = new Set( [ sector ] );
        this.edgeToSectorsMap.set( edgeB, sectorsB );
      }
    }
  }

  private removeSector( sector: TPatternSector ): void {
    if ( this.sectors.has( sector ) ) {
      this.sectors.delete( sector );

      const edgeA = sector.edges[ 0 ];
      const edgeB = sector.edges[ 1 ];
      assertEnabled() && assert( edgeA && edgeB );

      const sectorsA = this.edgeToSectorsMap.get( edgeA );
      if ( sectorsA ) {
        sectorsA.delete( sector );
        if ( sectorsA.size === 0 ) {
          this.edgeToSectorsMap.delete( edgeA );
        }
      }

      const sectorsB = this.edgeToSectorsMap.get( edgeB );
      if ( sectorsB ) {
        sectorsB.delete( sector );
        if ( sectorsB.size === 0 ) {
          this.edgeToSectorsMap.delete( edgeB );
        }
      }
    }
  }

  public computeSize(): number {
    let size = this.faceValueMap.size + this.blackEdges.size + this.redEdges.size + this.sectorsNotZero.size + this.sectorsNotOne.size + this.sectorsNotTwo.size + this.sectorsOnlyOne.size;
    for ( const feature of this.faceColorDualFeatures ) {
      size += feature.allFaces.size - 1;
    }
    return size;
  }

  private verifySize(): void {
    assertEnabled() && assert( this.size === this.computeSize(), 'size mismatch' );
  }

  public getInputDifficultyScoreA(): number {
    let score = 0;

    score += this.faceValueMap.size * 0.5;
    score += this.blackEdges.size * 1.0;
    for ( const redEdge of this.redEdges ) {
      score += redEdge.isExit ? 2.5 : 1.2;
    }
    score += this.sectorsOnlyOne.size * 3;
    score += this.sectorsNotOne.size * 4;
    score += this.sectorsNotTwo.size * 4.1;
    score += this.sectorsNotZero.size * 4.2;
    for ( const feature of this.faceColorDualFeatures ) {
      score += feature.allFaces.size - 1;
    }

    return score;
  };

  // TODO: eventually other feature types

  public static empty( patternBoard: TPatternBoard ): FeatureSet {
    return new FeatureSet( patternBoard );
  }

  public static fromFeatures( patternBoard: TPatternBoard, features: TEmbeddableFeature[] ): FeatureSet {
    const featureSet = new FeatureSet( patternBoard );

    for ( const feature of features ) {
      featureSet.addFeature( feature );
    }

    return featureSet;
  }

  public static fromSolution( patternBoard: TPatternBoard, edgeSolution: TPatternEdge[] ): FeatureSet {
    return FeatureSet.fromFeatures( patternBoard, [
      ...patternBoard.edges.filter( edge => {
        const isBlack = edgeSolution.includes( edge );

        return !isBlack || !edge.isExit;
      } ).map( edge => {
        const isBlack = edgeSolution.includes( edge );

        return isBlack ? new BlackEdgeFeature( edge ) : new RedEdgeFeature( edge );
      } )
    ] );
  }

  public clone(): FeatureSet {
    return new FeatureSet(
      this.patternBoard,
      new Map( this.faceValueMap ),
      new Set( this.blackEdges ),
      new Set( this.redEdges ),
      new Set( this.sectorsNotZero ),
      new Set( this.sectorsNotOne ),
      new Set( this.sectorsNotTwo ),
      new Set( this.sectorsOnlyOne ),
      new Set( this.faceColorDualFeatures ),
      new Map( this.faceToColorDualMap ),
      new Set( this.sectors ),
      new Map( this.edgeToSectorsMap ),
    );
  }

  public getFeaturesArray(): TEmbeddableFeature[] {
    return [
      ...[ ...this.faceValueMap.entries() ].map( ( [ face, value ] ) => new FaceFeature( face, value ) ),
      ...this.faceColorDualFeatures,
      ...[ ...this.blackEdges ].map( edge => new BlackEdgeFeature( edge ) ),
      ...[ ...this.redEdges ].map( edge => new RedEdgeFeature( edge ) ),
      ...[ ...this.sectorsNotZero ].map( sector => new SectorNotZeroFeature( sector ) ),
      ...[ ...this.sectorsNotOne ].map( sector => new SectorNotOneFeature( sector ) ),
      ...[ ...this.sectorsNotTwo ].map( sector => new SectorNotTwoFeature( sector ) ),
      ...[ ...this.sectorsOnlyOne ].map( sector => new SectorOnlyOneFeature( sector ) )
    ];
  }

  public getFaceValue( face: TPatternFace ): FaceValue | undefined {
    return this.faceValueMap.get( face );
  }

  public impliesFaceValue( face: TPatternFace, value: FaceValue ): boolean {
    const existingValue = this.faceValueMap.get( face );
    return existingValue !== undefined && existingValue === value;
  }

  public impliesBlackEdge( edge: TPatternEdge ): boolean {
    return this.blackEdges.has( edge );
  }

  public impliesRedEdge( edge: TPatternEdge ): boolean {
    return this.redEdges.has( edge );
  }

  public impliesSectorNotZero( sector: TPatternSector ): boolean {
    return this.sectorsNotZero.has( sector ) || this.blackEdges.has( sector.edges[ 0 ] ) || this.blackEdges.has( sector.edges[ 1 ] );
  }

  public impliesSectorNotOne( sector: TPatternSector ): boolean {
    return this.sectorsNotOne.has( sector ) ||
      ( this.blackEdges.has( sector.edges[ 0 ] ) && this.blackEdges.has( sector.edges[ 1 ] ) ) ||
      ( this.redEdges.has( sector.edges[ 0 ] ) && this.redEdges.has( sector.edges[ 1 ] ) );
  }

  public impliesSectorNotTwo( sector: TPatternSector ): boolean {
    return this.sectorsNotTwo.has( sector ) || this.redEdges.has( sector.edges[ 0 ] ) || this.redEdges.has( sector.edges[ 1 ] );
  }

  public impliesSectorOnlyOne( sector: TPatternSector ): boolean {
    return this.sectorsNotOne.has( sector ) ||
      ( this.blackEdges.has( sector.edges[ 0 ] ) && this.redEdges.has( sector.edges[ 1 ] ) ) ||
      ( this.redEdges.has( sector.edges[ 0 ] ) && this.blackEdges.has( sector.edges[ 1 ] ) );
  }

  public impliesFaceColorDualFeature( feature: FaceColorDualFeature ): boolean {
    for ( const otherFeature of this.faceColorDualFeatures ) {
      if ( feature.isSubsetOf( otherFeature ) ) {
        return true;
      }
    }

    return false;
  }

  public impliesFeature( feature: TEmbeddableFeature ): boolean {
    if ( feature instanceof FaceColorDualFeature ) {
      return this.impliesFaceColorDualFeature( feature );
    }
    else if ( feature instanceof BlackEdgeFeature ) {
      return this.impliesBlackEdge( feature.edge );
    }
    else if ( feature instanceof RedEdgeFeature ) {
      return this.impliesRedEdge( feature.edge );
    }
    else if ( feature instanceof SectorNotZeroFeature ) {
      return this.impliesSectorNotZero( feature.sector );
    }
    else if ( feature instanceof SectorNotOneFeature ) {
      return this.impliesSectorNotOne( feature.sector );
    }
    else if ( feature instanceof SectorNotTwoFeature ) {
      return this.impliesSectorNotTwo( feature.sector );
    }
    else if ( feature instanceof SectorOnlyOneFeature ) {
      return this.impliesSectorOnlyOne( feature.sector );
    }
    else if ( feature instanceof FaceFeature ) {
      return this.impliesFaceValue( feature.face, feature.value );
    }
    else {
      throw new Error( `unimplemented type of feature for FeatureSet: ${feature}` );
    }
  }

  public getAffectedEdges(): Set<TPatternEdge> {
    return new Set( [
      ...this.blackEdges,
      ...this.redEdges,
      ...this.edgeToSectorsMap.keys()
    ] );
  }

  public getAffectedSectors(): Set<TPatternSector> {
    return new Set( [
      ...this.sectorsNotZero.values(),
      ...this.sectorsNotOne.values(),
      ...this.sectorsNotTwo.values(),
      ...this.sectorsOnlyOne.values()
    ] );
  }

  public getAffectedFaces(): Set<TPatternFace> {
    return new Set( [
      ...this.faceValueMap.keys()
    ] );
  }

  public isIsomorphicTo( other: FeatureSet ): boolean {
    if ( this.patternBoard !== other.patternBoard ) {
      return false;
    }

    if ( !this.hasSameShapeAs( other ) ) {
      return false;
    }

    const automorphisms = getEmbeddings( this.patternBoard, this.patternBoard );

    for ( const automorphism of automorphisms ) {
      try {
        const embeddedFeatureSet = this.embedded( this.patternBoard, automorphism );
        if ( embeddedFeatureSet && embeddedFeatureSet.equals( other ) ) {
          return true;
        }
      }
      catch ( e ) {
        // ignore incompatible feature embeddings (just in case)
        if ( !( e instanceof IncompatibleFeatureError ) ) {
          throw e;
        }
      }
    }

    return false;
  }

  public isCanonicalWith( embeddings: Embedding[] ): boolean {
    const canonicalString = this.toCanonicalString();

    // TODO: can we speed this up?
    for ( const embedding of embeddings ) {
      const embeddedFeatureSet = this.embedded( this.patternBoard, embedding );
      if ( embeddedFeatureSet && embeddedFeatureSet.toCanonicalString() < canonicalString ) {
        return false;
      }
    }

    return true;
  }

  // returns null if the embedding is incompatible with the features (e.g. invalid face coloring of exit faces)
  public embedded( patternBoard: TPatternBoard, embedding: Embedding ): FeatureSet | null {
    try {
      // NOTE: exit edges can overlap, but we only mark them as "red" so they won't cause incompatibility.
      // NOTE: exit faces can overlap, and we'll need to handle cases where they are just incompatible.
      return FeatureSet.fromFeatures( patternBoard, this.getFeaturesArray().flatMap( feature => feature.embedded( embedding ) ) );
    }
    catch ( e ) {
      if ( e instanceof IncompatibleFeatureError ) {
        return null;
      }
      else {
        throw e;
      }
    }
  }

  // Whether it has the same number of rules, and same number of features for each type
  public hasSameShapeAs( other: FeatureSet ): boolean {
    return this.faceValueMap.size === other.faceValueMap.size &&
      this.blackEdges.size === other.blackEdges.size &&
      this.redEdges.size === other.redEdges.size &&
      this.sectorsNotZero.size === other.sectorsNotZero.size &&
      this.sectorsNotOne.size === other.sectorsNotOne.size &&
      this.sectorsNotTwo.size === other.sectorsNotTwo.size &&
      this.sectorsOnlyOne.size === other.sectorsOnlyOne.size &&
      this.faceColorDualFeatures.size === other.faceColorDualFeatures.size;
  }

  public getShapeString(): string {
    return `${this.faceValueMap.size} ${this.blackEdges.size} ${this.redEdges.size} ${this.sectorsNotZero.size} ${this.sectorsNotOne.size} ${this.sectorsNotTwo.size} ${this.sectorsOnlyOne.size} ${this.faceColorDualFeatures.size}`;
  }

  public isSubsetOf( other: FeatureSet ): boolean {
    for ( const [ face, value ] of this.faceValueMap ) {
      if ( !other.impliesFaceValue( face, value ) ) {
        return false;
      }
    }
    for ( const edge of this.blackEdges ) {
      if ( !other.impliesBlackEdge( edge ) ) {
        return false;
      }
    }
    for ( const edge of this.redEdges ) {
      if ( !other.impliesRedEdge( edge ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsNotZero ) {
      if ( !other.impliesSectorNotZero( sector ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsNotOne ) {
      if ( !other.impliesSectorNotOne( sector ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsNotTwo ) {
      if ( !other.impliesSectorNotTwo( sector ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsOnlyOne ) {
      if ( !other.impliesSectorOnlyOne( sector ) ) {
        return false;
      }
    }
    for ( const feature of this.faceColorDualFeatures ) {
      if ( !other.impliesFaceColorDualFeature( feature ) ) {
        return false;
      }
    }

    return true;
  }

  public equals( other: FeatureSet ): boolean {
    // First see if we have the same shape. Thus if we have one side matching the other, we can assume equality
    if ( !this.hasSameShapeAs( other ) ) {
      return false;
    }

    for ( const [ face, value ] of this.faceValueMap ) {
      if ( other.faceValueMap.get( face ) !== value ) {
        return false;
      }
    }
    for ( const edge of this.blackEdges ) {
      if ( !other.blackEdges.has( edge ) ) {
        return false;
      }
    }
    for ( const edge of this.redEdges ) {
      if ( !other.redEdges.has( edge ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsNotZero ) {
      if ( !other.sectorsNotZero.has( sector ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsNotOne ) {
      if ( !other.sectorsNotOne.has( sector ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsNotTwo ) {
      if ( !other.sectorsNotTwo.has( sector ) ) {
        return false;
      }
    }
    for ( const sector of this.sectorsOnlyOne ) {
      if ( !other.sectorsOnlyOne.has( sector ) ) {
        return false;
      }
    }

    // TODO: this is ideal for a large number of features, right?
    const canonicalKeys = new Set<string>();
    other.faceColorDualFeatures.forEach( feature => canonicalKeys.add( feature.toCanonicalString() ) );
    for ( const feature of this.faceColorDualFeatures ) {
      if ( !canonicalKeys.has( feature.toCanonicalString() ) ) {
        return false;
      }
    }

    return true;
  }

  // throws IncompatibleFeatureError if it doesn't work
  public applyFeaturesFrom( other: FeatureSet ): void {
    // TODO: optimize this (so we're not creating things and replacing)
    other.getFeaturesArray().forEach( feature => this.addFeature( feature ) );
  }

  // null if they can't be compatibly combined
  public union( other: FeatureSet ): FeatureSet | null {
    // Allow our set to be bigger, so we can optimize a few things
    if ( this.size < other.size ) {
      return other.union( this );
    }

    const featureSet = this.clone();

    try {
      featureSet.applyFeaturesFrom( other );
      return featureSet;
    }
    catch ( e ) {
      if ( e instanceof IncompatibleFeatureError ) {
        return null;
      }
      else {
        throw e;
      }
    }
  }

  public getQuickCompatibilityWith( other: FeatureSet ): FeatureCompatibility {

    let implied = true;

    for ( const edge of this.blackEdges ) {
      if ( other.impliesRedEdge( edge ) ) {
        return FeatureCompatibility.INCOMPATIBLE;
      }
      if ( implied && !other.impliesBlackEdge( edge ) ) {
        implied = false;
      }
    }

    for ( const edge of this.redEdges ) {
      if ( other.impliesBlackEdge( edge ) ) {
        return FeatureCompatibility.INCOMPATIBLE;
      }
      if ( implied && !other.impliesRedEdge( edge ) ) {
        implied = false;
      }
    }

    for ( const sector of this.sectorsNotZero ) {
      if ( implied && !other.impliesSectorNotZero( sector ) ) {
        implied = false;
      }
    }

    for ( const sector of this.sectorsNotOne ) {
      if ( other.impliesSectorOnlyOne( sector ) ) {
        return FeatureCompatibility.INCOMPATIBLE;
      }
      if ( implied && !other.impliesSectorNotOne( sector ) ) {
        implied = false;
      }
    }

    for ( const sector of this.sectorsNotTwo ) {
      if ( implied && !other.impliesSectorNotTwo( sector ) ) {
        implied = false;
      }
    }

    for ( const sector of this.sectorsOnlyOne ) {
      if ( other.impliesSectorNotOne( sector ) ) {
        return FeatureCompatibility.INCOMPATIBLE;
      }
      if ( implied && !other.impliesSectorOnlyOne( sector ) ) {
        implied = false;
      }
    }

    for ( const faceColorDual of this.faceColorDualFeatures ) {
      if ( implied && !other.impliesFaceColorDualFeature( faceColorDual ) ) {
        implied = false;
      }
    }

    let faceValuesMatch = true;

    for ( const [ face, value ] of this.faceValueMap ) {
      const otherValue = other.getFaceValue( face );

      if ( otherValue === undefined ) {
        faceValuesMatch = false;
      }
      else if ( otherValue !== value ) {
        return FeatureCompatibility.INCOMPATIBLE;
      }
    }

    if ( !faceValuesMatch ) {
      return FeatureCompatibility.NO_MATCH_NEEDS_FACE_VALUES;
    }
    else if ( !implied ) {
      return FeatureCompatibility.NO_MATCH_NEEDS_STATE;
    }
    else {
      return FeatureCompatibility.MATCH;
    }
  }

  public toCanonicalString(): string {
    return `feat:${_.sortBy( this.getFeaturesArray().map( f => f.toCanonicalString() ) ).join( '/' )}`;
  }

  public getSolutions( filterHighlander = false ): TPatternEdge[][] {
    const features = this.getFeaturesArray();

    let solutions = PatternBoardSolver.getSolutions( this.patternBoard, features );

    if ( solutions.length && filterHighlander ) {
      // TODO: switch getIndeterminateEdges to use FeatureSet?
      const indeterminateEdges = getIndeterminateEdges( this.patternBoard, features );
      const exitVertices = this.patternBoard.vertices.filter( v => v.isExit );

      solutions = filterHighlanderSolutions( solutions, indeterminateEdges, exitVertices ).highlanderSolutions;
    }

    return solutions;
  }

  public hasSolution( filterHighlander = false ): boolean {
    if ( filterHighlander ) {
      return this.getSolutions( filterHighlander ).length > 0;
    }
    else {
      return PatternBoardSolver.hasSolution( this.patternBoard, this.getFeaturesArray() );
    }
  }

  // null if there is no solution
  // TODO: @deprecated, but kept around because... our new solution is NOT well tested, and this would be good to use
  // TODO: for comparison.
  public solvedOldStyle( providedOptions?: BasicSolveOptions ): FeatureSet | null {
    // TODO: is this too much performance loss?
    const options = optionize3<BasicSolveOptions>()( {}, BASIC_SOLVE_DEFAULTS, providedOptions );

    const solutions = this.getSolutions( options.highlander );

    if ( solutions.length === 0 ) {
      return null;
    }

    const featureSet = this.clone();

    const solutionSets = solutions.map( solution => new Set( solution ) );

    if ( options.solveEdges ) {
      // TODO: should this be an instance method?
      featureSet.addSolvedEdgeFeatures( solutionSets );
    }

    if ( options.solveSectors ) {
      featureSet.addSolvedSectorFeatures( solutionSets );
    }

    if ( options.solveFaceColors ) {
      featureSet.addSolvedFaceColorDualFeatures( solutionSets );
    }

    if ( assertEnabled() ) {
      let solutionSet: SolutionSet | null = SolutionSet.fromFeatureSet( this, !!options.solveEdges, !!options.solveSectors, !!options.solveFaceColors, !!options.highlander );
      if ( solutionSet && options.highlander ) {
        solutionSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( this.patternBoard, this.getFeaturesArray() ) );
      }

      assertEnabled() && assert( solutionSet );
      const sanityFeatureSet = solutionSet!.addToFeatureSet( this.clone() )!;
      assertEnabled() && assert( sanityFeatureSet );

      assertEnabled() && assert( sanityFeatureSet.equals( featureSet ) );
    }

    return featureSet;
  }

  // null if there is no solution
  public solved( providedOptions?: BasicSolveOptions ): FeatureSet | null {
    // TODO: is this too much performance loss?
    const options = optionize3<BasicSolveOptions>()( {}, BASIC_SOLVE_DEFAULTS, providedOptions );

    let solutionSet: SolutionSet | null = SolutionSet.fromFeatureSet( this, !!options.solveEdges, !!options.solveSectors, !!options.solveFaceColors, !!options.highlander );

    if ( solutionSet && options.highlander ) {
      solutionSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( this.patternBoard, this.getFeaturesArray() ) );
    }

    if ( solutionSet ) {
      return solutionSet.addToFeatureSet( this.clone() );
    }
    else {
      return null;
    }
  }

  private addSolvedEdgeFeatures( solutions: Set<TPatternEdge>[] ): void {
    const hasBlack = new Array( this.patternBoard.edges.length ).fill( false );
    const hasRed = new Array( this.patternBoard.edges.length ).fill( false );

    const allEdges = new Set( this.patternBoard.edges );

    const redExitVertices = new Set( this.patternBoard.vertices.filter( vertex => vertex.isExit ) );

    for ( const solution of solutions ) {

      // TODO: faster... ways in the future? Performance?
      const edgesRemaining = new Set( allEdges );

      for ( const edge of solution ) {
        hasBlack[ edge.index ] = true;
        edgesRemaining.delete( edge );
      }

      for ( const edge of edgesRemaining ) {
        hasRed[ edge.index ] = true;
      }

      for ( const redExitVertex of [ ...redExitVertices ] ) {

        // TODO: these conditions could be collapsed together, the exit edge IS a black edge.

        // If we have a black edge in our exit, it can't be red

        // TODO: omg, improve performance here lol
        if ( solution.has( redExitVertex.exitEdge! ) ) {
          redExitVertices.delete( redExitVertex );
        }

        // If we have zero or one black edges to our exit vertex, it can't be red.
        // NOTE: if zero black edges, then we can't rule out exit edge matching to 2 edges that could both be black.

        // TODO: omg, improve performance here lol
        if ( redExitVertex.edges.filter( edge => solution.has( edge ) ).length < 2 ) {
          redExitVertices.delete( redExitVertex );
        }
      }
    }

    for ( const edge of this.patternBoard.edges ) {
      if ( !edge.isExit ) {
        const isBlack = hasBlack[ edge.index ];
        const isRed = hasRed[ edge.index ];

        if ( isBlack && !isRed ) {
          this.addBlackEdge( edge );
        }
        if ( !isBlack && isRed ) {
          this.addRedEdge( edge );
        }
      }
    }
    for ( const redExitVertex of redExitVertices ) {
      this.addRedEdge( redExitVertex.exitEdge! );
    }
  }

  private addSolvedSectorFeatures( solutions: Set<TPatternEdge>[] ): void {
    const hasZero = new Array( this.patternBoard.sectors.length ).fill( false );
    const hasOne = new Array( this.patternBoard.sectors.length ).fill( false );
    const hasTwo = new Array( this.patternBoard.sectors.length ).fill( false );

    for ( const solution of solutions ) {
      // TODO: performance here omg
      for ( const sector of this.patternBoard.sectors ) {
        const count = ( solution.has( sector.edges[ 0 ] ) ? 1 : 0 ) + ( solution.has( sector.edges[ 1 ] ) ? 1 : 0 );

        if ( count === 0 ) {
          hasZero[ sector.index ] = true;
        }
        else if ( count === 1 ) {
          hasOne[ sector.index ] = true;
        }
        else if ( count === 2 ) {
          hasTwo[ sector.index ] = true;
        }
      }
    }

    for ( const sector of this.patternBoard.sectors ) {
      const isZero = hasZero[ sector.index ];
      const isOne = hasOne[ sector.index ];
      const isTwo = hasTwo[ sector.index ];

      if ( isOne && !isZero && !isTwo ) {
        this.addSectorOnlyOne( sector );
      }
      else if ( isZero && isOne && !isTwo ) {
        this.addSectorNotTwo( sector );
      }
      else if ( isZero && isTwo && !isOne ) {
        this.addSectorNotOne( sector );
      }
      else if ( !isZero && isOne && isTwo ) {
        this.addSectorNotZero( sector );
      }
    }
  }

  private addSolvedFaceColorDualFeatures( solutions: Set<TPatternEdge>[] ): void {
    assertEnabled() && assert( solutions.length > 0 );

    const faceConnectivity = FaceConnectivity.get( this.patternBoard );

    const remainingDuals = new Set( faceConnectivity.connectedFacePairs.map( pair => new DualConnectedFacePair( pair ) ) );
    for ( const solution of solutions ) {

      // TODO: with iteration, don't make a copy anymore?
      for ( const dual of [ ...remainingDuals ] ) {
        let isSame = true;

        for ( const edge of dual.pair.shortestPath ) {
          if ( solution.has( edge ) ) {
            isSame = !isSame;
          }
        }

        if ( isSame ) {
          dual.isOnlyOpposite = false;
        }
        else {
          dual.isOnlySame = false;
        }

        if ( !dual.isOnlySame && !dual.isOnlyOpposite ) {
          remainingDuals.delete( dual );
        }
      }
    }

    for ( const dual of remainingDuals ) {
      if ( dual.isOnlySame ) {
        this.addSameColorFaces( dual.pair.a, dual.pair.b );
      }
      else if ( dual.isOnlyOpposite ) {
        this.addOppositeColorFaces( dual.pair.a, dual.pair.b );
      }
    }
  }

  public serialize(): TSerializedFeatureSet {
    const serialization: TSerializedFeatureSet = {};

    if ( this.faceValueMap.size > 0 ) {
      serialization.faceValues = [ ...this.faceValueMap.entries() ].map( ( [ face, value ] ) => ( { face: face.index, value: value } ) );
    }
    if ( this.blackEdges.size > 0 ) {
      serialization.blackEdges = [ ...this.blackEdges ].map( edge => edge.index );
    }
    if ( this.redEdges.size > 0 ) {
      serialization.redEdges = [ ...this.redEdges ].map( edge => edge.index );
    }
    if ( this.sectorsNotZero.size > 0 ) {
      serialization.sectorsNotZero = [ ...this.sectorsNotZero ].map( sector => sector.index );
    }
    if ( this.sectorsNotOne.size > 0 ) {
      serialization.sectorsNotOne = [ ...this.sectorsNotOne ].map( sector => sector.index );
    }
    if ( this.sectorsNotTwo.size > 0 ) {
      serialization.sectorsNotTwo = [ ...this.sectorsNotTwo ].map( sector => sector.index );
    }
    if ( this.sectorsOnlyOne.size > 0 ) {
      serialization.sectorsOnlyOne = [ ...this.sectorsOnlyOne ].map( sector => sector.index );
    }
    if ( this.faceColorDualFeatures.size > 0 ) {
      serialization.faceColorDualFeatures = [ ...this.faceColorDualFeatures ].map( f => f.serialize() );
    }

    return serialization;
  }

  public static deserialize( serialized: TSerializedFeatureSet, patternBoard: TPatternBoard ): FeatureSet {
    const featureSet = new FeatureSet( patternBoard );

    for ( const faceValue of serialized.faceValues || [] ) {
      featureSet.addFaceValue( patternBoard.faces[ faceValue.face ], faceValue.value );
    }
    for ( const blackEdge of serialized.blackEdges || [] ) {
      featureSet.addBlackEdge( patternBoard.edges[ blackEdge ] );
    }
    for ( const redEdge of serialized.redEdges || [] ) {
      featureSet.addRedEdge( patternBoard.edges[ redEdge ] );
    }
    for ( const sectorNotZero of serialized.sectorsNotZero || [] ) {
      featureSet.addSectorNotZero( patternBoard.sectors[ sectorNotZero ] );
    }
    for ( const sectorNotOne of serialized.sectorsNotOne || [] ) {
      featureSet.addSectorNotOne( patternBoard.sectors[ sectorNotOne ] );
    }
    for ( const sectorNotTwo of serialized.sectorsNotTwo || [] ) {
      featureSet.addSectorNotTwo( patternBoard.sectors[ sectorNotTwo ] );
    }
    for ( const sectorOnlyOne of serialized.sectorsOnlyOne || [] ) {
      featureSet.addSectorOnlyOne( patternBoard.sectors[ sectorOnlyOne ] );
    }
    for ( const faceColorDual of serialized.faceColorDualFeatures || [] ) {
      featureSet.addFaceColorDual( FaceColorDualFeature.deserialize( faceColorDual, patternBoard ) );
    }

    return featureSet;
  }
}

export type BasicSolveOptions = {
  solveEdges?: boolean;
  solveFaceColors?: boolean;
  solveSectors?: boolean;
  highlander?: boolean;
};

export const BASIC_SOLVE_DEFAULTS = {
  solveEdges: true,
  solveFaceColors: false,
  solveSectors: false,
  highlander: false
} as const;

export type TSerializedFeatureSet = {
  faceValues?: { face: number; value: number | null }[];
  blackEdges?: number[];
  redEdges?: number[];
  sectorsNotZero?: number[];
  sectorsNotOne?: number[];
  sectorsNotTwo?: number[];
  sectorsOnlyOne?: number[];
  faceColorDualFeatures?: ( TSerializedEmbeddableFeature & { type: 'face-color-dual' } )[];
};

class DualConnectedFacePair {

  public isOnlySame = true;
  public isOnlyOpposite = true;

  public constructor(
    public readonly pair: ConnectedFacePair
  ) {}
}
