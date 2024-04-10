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
    public features: TEmbeddableFeature[]
  ) {
    assertEnabled() && assert( filterRedundantFeatures( features ).length === features.length );

    for ( const feature of features ) {
      this.map.set( feature.getCanonicalString(), feature );
    }

    assertEnabled() && assert( this.map.size === features.length );
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

    const hasOverlap = ( a: FaceColorDualFeature, b: FaceColorDualFeature ): boolean => {
      for ( const face of a.allFaces ) {
        if ( b.allFaces.has( face ) ) {
          return true;
        }
      }
      return false;
    };

    const resolveOverlap = ( a: FaceColorDualFeature, b: FaceColorDualFeature ): FaceColorDualFeature | null => {
      const hasSameOverlap = a.primaryFaces.some( face => b.primaryFaces.includes( face ) ) || a.secondaryFaces.some( face => b.secondaryFaces.includes( face ) );
      const hasOppositeOverlap = a.primaryFaces.some( face => b.secondaryFaces.includes( face ) ) || a.secondaryFaces.some( face => b.primaryFaces.includes( face ) );

      assertEnabled() && assert( hasSameOverlap || hasOppositeOverlap );

      if ( hasSameOverlap && hasOppositeOverlap ) {
        return null;
      }
      else if ( hasSameOverlap ) {
        return FaceColorDualFeature.fromPrimarySecondaryFaces( [ ...a.primaryFaces, ...b.primaryFaces ], [ ...a.secondaryFaces, ...b.secondaryFaces ] );
      }
      else {
        return FaceColorDualFeature.fromPrimarySecondaryFaces( [ ...a.primaryFaces, ...b.secondaryFaces ], [ ...a.secondaryFaces, ...b.primaryFaces ] );
      }
    };

    for ( const faceColorFeature of faceColorFeatures ) {
      const overlappingFeature = nonoverlappingFaceColorFeatures.find( otherFeature => hasOverlap( faceColorFeature, otherFeature ) );

      if ( overlappingFeature ) {
        const feature = resolveOverlap( faceColorFeature, overlappingFeature );

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
      if ( !other.map.has( feature.getCanonicalString() ) ) {
        return false;
      }
    }

    return true;
  }

  public equals( other: FeatureSet ): boolean {
    return this.features.length === other.features.length && this.isSubsetOf( other );
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