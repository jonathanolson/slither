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

export class FeatureSet {

  public map: Map<string, TEmbeddableFeature> = new Map();

  public constructor(
    // TODO: can we make this NOT public, so we can change things in the future?
    public features: TEmbeddableFeature[]
  ) {
    assertEnabled() && assert( filterRedundantFeatures( features ).length === features.length );

    for ( const feature of features ) {
      this.map.set( feature.getCanonicalString(), feature );
    }

    assertEnabled() && assert( this.map.size === features.length );
  }

  public hasExactFeature( feature: TEmbeddableFeature ): boolean {
    return this.map.has( feature.getCanonicalString() );
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

    return new FeatureSet( filterRedundantFeatures( [
      ...nonFaceColorFeatures,
      ...nonoverlappingFaceColorFeatures
    ] ) );
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

    return new FeatureSet( [
      ...nonFaceFeatures,
      ...faceFeatures
    ] );
  }

  public serialize(): TSerializedFeatureSet {
    return {
      features: this.features.map( feature => feature.serialize() )
    };
  }

  public static deserialize( serialized: TSerializedFeatureSet, patternBoard: TPatternBoard ): FeatureSet {
    return new FeatureSet( serialized.features.map( feature => deserializeEmbeddableFeature( feature, patternBoard ) ) );
  }

  // TODO: Figure out best "Pattern" representation (FeatureSet, no? mapping or no?)
  public static getBasicSolve( patternBoard: TPatternBoard, inputFeatureSet: FeatureSet, providedOptions?: BasicSolveOptions ): FeatureSet {

    // TODO: is this too much performance loss?
    const options = optionize<BasicSolveOptions>()( {
      solveEdges: true,
      solveFaceColors: false,
      solveSectors: false,
      highlander: false
    }, providedOptions );

    let solutions = PatternBoardSolver.getSolutions( patternBoard, inputFeatureSet.features );

    if ( options.highlander ) {
      const indeterminateEdges = getIndeterminateEdges( patternBoard, inputFeatureSet.features );
      const exitVertices = patternBoard.vertices.filter( v => v.isExit );

      solutions = filterHighlanderSolutions( solutions, indeterminateEdges, exitVertices ).highlanderSolutions;
    }

    const addedEdgeFeatures = options.solveEdges ? coalesceEdgeFeatures( patternBoard, solutions ) : [];
    const addedFaceColorFeatures = options.solveFaceColors ? coalesceFaceColorFeatures( patternBoard, solutions ) : [];
    const addedSectorFeatures = options.solveSectors ? coalesceSectorFeatures( patternBoard, solutions ) : [];

    return new FeatureSet( filterRedundantFeatures( [
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