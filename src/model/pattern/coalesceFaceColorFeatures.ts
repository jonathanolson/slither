import { FaceColorDualFeature } from './feature/FaceColorDualFeature.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { arrayRemove } from 'phet-lib/phet-core';
import { FaceConnectivity } from './FaceConnectivity.ts';

// TODO: performance!!!!
export const coalesceFaceColorFeatures = ( patternBoard: TPatternBoard, solutions: TPatternEdge[][] ): FaceColorDualFeature[] => {
  // TODO: a more efficient way! THIS IS PRETTY LAZY CODING

  const sameColorDuals: FaceColorDualFeature[] = [];
  const oppositeColorDuals: FaceColorDualFeature[] = [];

  const edgeConnectedComponentFaces = FaceConnectivity.get( patternBoard ).connectedComponents;
  const getComponentIndex = ( face: TPatternFace ) => edgeConnectedComponentFaces.findIndex( component => component.includes( face ) );
  const sameComponent = ( faceA: TPatternFace, faceB: TPatternFace ) => getComponentIndex( faceA ) === getComponentIndex( faceB );

  for ( let i = 0; i < patternBoard.faces.length; i++ ) {
    const faceA = patternBoard.faces[ i ];
    for ( let j = i + 1; j < patternBoard.faces.length; j++ ) {
      const faceB = patternBoard.faces[ j ];

      if ( sameComponent( faceA, faceB ) ) {
        sameColorDuals.push( FaceColorDualFeature.fromPrimarySecondaryFaces( [ faceA, faceB ], [] ) );
        oppositeColorDuals.push( FaceColorDualFeature.fromPrimarySecondaryFaces( [ faceA ], [ faceB ] ) );
      }
    }
  }

  const duals = new Set( [ ...sameColorDuals, ...oppositeColorDuals ] );

  solutions.forEach( solution => {
    const solutionSet = new Set( solution );

    for ( const dual of [ ...duals ] ) {
      if ( !dual.isPossibleWith( edge => solutionSet.has( edge ) ) ) {
        duals.delete( dual );
      }
    }
  } );

  // TODO: omg efficiency, and code duplication
  const candidateDuals = patternBoard.faces.map( face => new CandidateDual( [ face ], [] ) );
  const getDual = ( face: TPatternFace ) => candidateDuals.find( candidate => candidate.primaryFaces.includes( face ) || candidate.secondaryFaces.includes( face ) )!;
  duals.forEach( dual => {
    if ( dual.primaryFaces.length === 2 ) {
      const faceA = dual.primaryFaces[ 0 ];
      const faceB = dual.primaryFaces[ 1 ];

      const dualA = getDual( faceA );
      const dualB = getDual( faceB );

      if ( dualA !== dualB ) {
        const areSameSide = dualA.primaryFaces.includes( faceA ) === dualB.primaryFaces.includes( faceB );

        const dual = areSameSide
                     ? new CandidateDual( [ ...dualA.primaryFaces, ...dualB.primaryFaces ], [ ...dualA.secondaryFaces, ...dualB.secondaryFaces ] )
                     : new CandidateDual( [ ...dualA.primaryFaces, ...dualB.secondaryFaces ], [ ...dualA.secondaryFaces, ...dualB.primaryFaces ] );

        arrayRemove( candidateDuals, dualA );
        arrayRemove( candidateDuals, dualB );
        candidateDuals.push( dual );
      }
    }
    else {
      const faceA = dual.primaryFaces[ 0 ];
      const faceB = dual.secondaryFaces[ 0 ];

      const dualA = getDual( faceA );
      const dualB = getDual( faceB );

      if ( dualA !== dualB ) {
        const areSameSide = dualA.primaryFaces.includes( faceA ) !== dualB.primaryFaces.includes( faceB );

        const dual = areSameSide
                     ? new CandidateDual( [ ...dualA.primaryFaces, ...dualB.primaryFaces ], [ ...dualA.secondaryFaces, ...dualB.secondaryFaces ] )
                     : new CandidateDual( [ ...dualA.primaryFaces, ...dualB.secondaryFaces ], [ ...dualA.secondaryFaces, ...dualB.primaryFaces ] );

        arrayRemove( candidateDuals, dualA );
        arrayRemove( candidateDuals, dualB );
        candidateDuals.push( dual );
      }
    }
  } );

  // TODO: ideally don't have to recompute everything
  return candidateDuals.filter( dual => dual.primaryFaces.length + dual.secondaryFaces.length > 1 ).map( dual => FaceColorDualFeature.fromPrimarySecondaryFaces( dual.primaryFaces, dual.secondaryFaces ) );
};

class CandidateDual {
  public constructor(
    public readonly primaryFaces: TPatternFace[],
    public readonly secondaryFaces: TPatternFace[],
  ) {}
}