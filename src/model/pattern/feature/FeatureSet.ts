import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { default as assert, assertEnabled } from '../../../workarounds/assert.ts';
import { filterRedundantFeatures } from './filterRedundantFeatures.ts';
import { Embedding } from '../Embedding.ts';
import { FaceColorDualFeature } from './FaceColorDualFeature.ts';
import { arrayRemove, optionize } from 'phet-lib/phet-core';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { deserializeEmbeddableFeature } from './deserializeEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';
import { PatternBoardSolver } from '../PatternBoardSolver.ts';
import { coalesceEdgeFeatures } from '../coalesceEdgeFeatures.ts';
import { coalesceFaceColorFeatures } from '../coalesceFaceColorFeatures.ts';
import { coalesceSectorFeatures } from '../coalesceSectorFeatures.ts';
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

export class FeatureSet {

  public map: Map<string, TEmbeddableFeature> = new Map();

  private constructor(
    // TODO: can we make this NOT public, so we can change things in the future?
    public features: TEmbeddableFeature[]
  ) {
    assertEnabled() && assert( filterRedundantFeatures( features ).length === features.length );

    for ( const feature of features ) {
      this.map.set( feature.toCanonicalString(), feature );
    }

    assertEnabled() && assert( this.map.size === features.length );
  }

  public static fromFeatures( features: TEmbeddableFeature[] ): FeatureSet {
    return new FeatureSet( features );
  }

  public static fromSolution( patternBoard: TPatternBoard, edgeSolution: TPatternEdge[] ): FeatureSet {
    return FeatureSet.fromFeatures( [
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
    return FeatureSet.fromFeatures( this.features.slice() );
  }

  public hasExactFeature( feature: TEmbeddableFeature ): boolean {
    return this.map.has( feature.toCanonicalString() );
  }

  public impliesFeature( feature: TEmbeddableFeature ): boolean {
    if ( feature instanceof FaceColorDualFeature ) {
      return this.features.some( otherFeature => feature.isSubsetOf( otherFeature ) );
    }
    else {
      return this.hasExactFeature( feature );
    }
  }

  // returns null if the embedding is incompatible with the features (e.g. invalid face coloring of exit faces)
  public embedded( embedding: Embedding ): FeatureSet | null {
    const mappedFeatures = this.features.flatMap( feature => feature.applyEmbedding( embedding ) );

    const faceColorFeatures = mappedFeatures.filter( feature => feature instanceof FaceColorDualFeature ) as FaceColorDualFeature[];
    const nonFaceColorFeatures = mappedFeatures.filter( feature => !( feature instanceof FaceColorDualFeature ) );

    // TODO: we'll want to detect cases where the features are... inconsistent/incompatible, no?

    // NOTE: exit edges can overlap, but we only mark them as "red" so they won't cause incompatibility.
    // NOTE: exit faces can overlap, and we'll need to handle cases where they are just incompatible.

    const nonoverlappingFaceColorFeatures: FaceColorDualFeature[] = [];

    for ( const faceColorFeature of faceColorFeatures ) {
      const overlappingFeature = nonoverlappingFaceColorFeatures.find( otherFeature => faceColorFeature.overlapsWith( otherFeature ) );

      if ( overlappingFeature ) {
        const feature = faceColorFeature.union( overlappingFeature );

        if ( feature ) {
          arrayRemove( nonoverlappingFaceColorFeatures, overlappingFeature );
          nonoverlappingFaceColorFeatures.push( feature );
        }
        else {
          // No embedding, invalid overlap!
          return null;
        }
      }
      else {
        nonoverlappingFaceColorFeatures.push( faceColorFeature );
      }
    }

    return FeatureSet.fromFeatures( filterRedundantFeatures( [
      ...nonFaceColorFeatures,
      ...nonoverlappingFaceColorFeatures
    ] ) );
  }

  // Whether it has the same number of rules, and same number of features for each type
  public hasSameShapeAs( other: FeatureSet ): boolean {
    if ( this.features.length !== other.features.length ) {
      return false;
    }

    let numBlack = 0;
    let numRed = 0;
    let numSectorNotZero = 0;
    let numSectorNotOne = 0;
    let numSectorNotTwo = 0;
    let numSectorOnlyOne = 0;
    let numFaceColorDual = 0;
    let numFace = 0;

    for ( const feature of this.features ) {
      if ( feature instanceof BlackEdgeFeature ) {
        numBlack++;
      }
      else if ( feature instanceof RedEdgeFeature ) {
        numRed++;
      }
      else if ( feature instanceof SectorNotZeroFeature ) {
        numSectorNotZero++;
      }
      else if ( feature instanceof SectorNotOneFeature ) {
        numSectorNotOne++;
      }
      else if ( feature instanceof SectorNotTwoFeature ) {
        numSectorNotTwo++;
      }
      else if ( feature instanceof SectorOnlyOneFeature ) {
        numSectorOnlyOne++;
      }
      else if ( feature instanceof FaceColorDualFeature ) {
        numFaceColorDual++;
      }
      else if ( feature instanceof FaceFeature ) {
        numFace++;
      }
    }

    for ( const feature of other.features ) {
      if ( feature instanceof BlackEdgeFeature ) {
        numBlack--;
      }
      else if ( feature instanceof RedEdgeFeature ) {
        numRed--;
      }
      else if ( feature instanceof SectorNotZeroFeature ) {
        numSectorNotZero--;
      }
      else if ( feature instanceof SectorNotOneFeature ) {
        numSectorNotOne--;
      }
      else if ( feature instanceof SectorNotTwoFeature ) {
        numSectorNotTwo--;
      }
      else if ( feature instanceof SectorOnlyOneFeature ) {
        numSectorOnlyOne--;
      }
      else if ( feature instanceof FaceColorDualFeature ) {
        numFaceColorDual--;
      }
      else if ( feature instanceof FaceFeature ) {
        numFace--;
      }
    }

    return numBlack === 0 && numRed === 0 && numSectorNotZero === 0 && numSectorNotOne === 0 && numSectorNotTwo === 0 && numSectorOnlyOne === 0 && numFaceColorDual === 0 && numFace === 0;
  }

  // TODO: embeddings and consolidation of features

  public isSubsetOf( other: FeatureSet ): boolean {
    for ( const feature of this.features ) {
      if ( !other.impliesFeature( feature ) ) {
        return false;
      }
    }

    return true;
  }

  public equals( other: FeatureSet ): boolean {
    return this.features.length === other.features.length && this.isSubsetOf( other );
  }

  public hasFeature( feature: TEmbeddableFeature ): boolean {
    return this.map.has( feature.toCanonicalString() );
  }

  // null if they can't be compatibly combined
  public union( other: FeatureSet ): FeatureSet | null {
    // Allow our set to be bigger, so we can optimize a few things
    if ( this.features.length < other.features.length ) {
      return other.union( this );
    }

    // TODO: see if there's a more "filter based on edges" way of doing this, that isn't O(n^2).
    // TODO: have each feature added to a map (edges as keys), and filter based on that?
    const nonFaceFeatures = filterRedundantFeatures( [
      ...this.features.filter( feature => !( feature instanceof FaceColorDualFeature ) ),
      ...other.features.filter( feature => !( feature instanceof FaceColorDualFeature ) )
    ] );

    const faceFeatures: FaceColorDualFeature[] = this.features.filter( feature => feature instanceof FaceColorDualFeature ) as FaceColorDualFeature[];

    for ( const feature of other.features ) {
      if ( feature instanceof FaceColorDualFeature ) {
        let faceFeature = feature;

        for ( let i = 0; i < faceFeatures.length; i++ ) {
          const otherFaceFeature = faceFeatures[ i ];

          if ( faceFeature.overlapsWith( otherFaceFeature ) ) {
            const potentialFaceFeature = faceFeature.union( otherFaceFeature );

            if ( potentialFaceFeature === null ) {
              return null;
            }
            else {
              faceFeature = potentialFaceFeature;
              arrayRemove( faceFeatures, otherFaceFeature );
              i--;
            }
          }
        }

        faceFeatures.push( faceFeature );
      }
    }

    return FeatureSet.fromFeatures( [
      ...nonFaceFeatures,
      ...faceFeatures
    ] );
  }

  // TODO: this doesn't vet full compatibility, but tries to rule things out nicely
  // NOTE: Not the fastest, but hopefully speeds up computations
  public isCompatibleWith( other: FeatureSet ): boolean {

    // TODO: OMG performance?

    for ( const feature of this.features ) {
      for ( const otherFeature of other.features ) {
        if ( feature instanceof FaceColorDualFeature && otherFeature instanceof FaceColorDualFeature ) {
          if ( !feature.isCompatibleWith( otherFeature ) ) {
            return false;
          }
        }

        if ( feature instanceof RedEdgeFeature && otherFeature instanceof BlackEdgeFeature && feature.edge === otherFeature.edge ) {
          return false;
        }

        if ( feature instanceof BlackEdgeFeature && otherFeature instanceof RedEdgeFeature && feature.edge === otherFeature.edge ) {
          return false;
        }

      }
    }

    // Sector checks
    // TODO: sector checks? That could be... somewhat more expensive (BUT might save us a lot of computation)
    // TODO: this will require a sector in one, and two edges in another
    const checkSectors = ( a: FeatureSet, b: FeatureSet ): boolean => {
      for ( const feature of a.features ) {
        if ( feature instanceof SectorNotZeroFeature ) {
          if ( b.hasFeature( new RedEdgeFeature( feature.sector.edges[ 0 ] ) ) && other.hasFeature( new RedEdgeFeature( feature.sector.edges[ 1 ] ) ) ) {
            return false;
          }
        }

        if ( feature instanceof SectorNotZeroFeature || feature instanceof SectorNotOneFeature || feature instanceof SectorNotTwoFeature || feature instanceof SectorOnlyOneFeature ) {
          const edgeA = feature.sector.edges[ 0 ];

          const redA = b.hasFeature( new RedEdgeFeature( edgeA ) );
          const blackA = b.hasFeature( new BlackEdgeFeature( edgeA ) );

          if ( !redA && !blackA ) {
            continue;
          }

          const edgeB = feature.sector.edges[ 1 ];
          const redB = b.hasFeature( new RedEdgeFeature( edgeB ) );
          const blackB = b.hasFeature( new BlackEdgeFeature( edgeB ) );

          if ( !redB && !blackB ) {
            continue;
          }

          const blackCount = ( blackA ? 1 : 0 ) + ( blackB ? 1 : 0 );

          if ( feature instanceof SectorNotZeroFeature && blackCount === 0 ) {
            return false;
          }
          if ( feature instanceof SectorNotOneFeature && blackCount === 1 ) {
            return false;
          }
          if ( feature instanceof SectorNotTwoFeature && blackCount === 2 ) {
            return false;
          }
          if ( feature instanceof SectorOnlyOneFeature && blackCount !== 1 ) {
            return false;
          }
        }
      }

      return true;
    };
    if ( !checkSectors( this, other ) ) {
      return false;
    }
    if ( !checkSectors( other, this ) ) {
      return false;
    }

    return true;
  }

  public isFaceSubsetOf( other: FeatureSet ): boolean {
    for ( const feature of this.features ) {
      if ( feature instanceof FaceFeature ) {
        const matchingFaceFeature = ( other.features.find( otherFeature => otherFeature instanceof FaceFeature && feature.face === otherFeature.face ) ?? null ) as FaceFeature | null;

        if ( !matchingFaceFeature || feature.value !== matchingFaceFeature.value ) {
          return false;
        }
      }
    }

    return true;
  }

  public toCanonicalString(): string {
    return `feat:${_.sortBy( this.map.keys() ).join( '/' )}`;
  }

  public serialize(): TSerializedFeatureSet {
    return {
      features: this.features.map( feature => feature.serialize() )
    };
  }

  public static deserialize( serialized: TSerializedFeatureSet, patternBoard: TPatternBoard ): FeatureSet {
    return FeatureSet.fromFeatures( serialized.features.map( feature => deserializeEmbeddableFeature( feature, patternBoard ) ) );
  }

  // TODO: Figure out best "Pattern" representation (FeatureSet, no? mapping or no?)
  // null if there is no solution
  public static getBasicSolve( patternBoard: TPatternBoard, inputFeatureSet: FeatureSet, providedOptions?: BasicSolveOptions ): FeatureSet | null {

    // TODO: is this too much performance loss?
    const options = optionize<BasicSolveOptions>()( {
      solveEdges: true,
      solveFaceColors: false,
      solveSectors: false,
      highlander: false
    }, providedOptions );

    let solutions = PatternBoardSolver.getSolutions( patternBoard, inputFeatureSet.features );

    if ( solutions.length === 0 ) {
      return null;
    }

    if ( options.highlander ) {
      const indeterminateEdges = getIndeterminateEdges( patternBoard, inputFeatureSet.features );
      const exitVertices = patternBoard.vertices.filter( v => v.isExit );

      solutions = filterHighlanderSolutions( solutions, indeterminateEdges, exitVertices ).highlanderSolutions;
    }

    const addedEdgeFeatures = options.solveEdges ? coalesceEdgeFeatures( patternBoard, solutions ) : [];
    const addedFaceColorFeatures = options.solveFaceColors ? coalesceFaceColorFeatures( patternBoard, solutions ) : [];
    const addedSectorFeatures = options.solveSectors ? coalesceSectorFeatures( patternBoard, solutions ) : [];

    return FeatureSet.fromFeatures( filterRedundantFeatures( [
      // Strip face color duals, because we can't vet redundancy (we generate a new set)
      ...( options.solveFaceColors ? inputFeatureSet.features.filter( feature => !( feature instanceof FaceColorDualFeature ) ) : inputFeatureSet.features ),
      ...addedEdgeFeatures,
      ...addedFaceColorFeatures,
      ...addedSectorFeatures
    ] ) );
  }
}

export type BasicSolveOptions = {
  solveEdges?: boolean;
  solveFaceColors?: boolean;
  solveSectors?: boolean;
  highlander?: boolean;
};

export type TSerializedFeatureSet = {
  features: TSerializedEmbeddableFeature[];
};