import QUnit from 'qunit';
import { PatternBoardSolver } from '../../PatternBoardSolver.ts';
import { standardSquareBoardGenerations } from '../../pattern-board/patternBoards.ts';
import { RichSolution } from '../RichSolution.ts';
import { BinaryFeatureMap } from '../BinaryFeatureMap.ts';
import { BlackEdgeFeature } from '../../feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from '../../feature/RedEdgeFeature.ts';

QUnit.module( 'RichSolution', () => {
  QUnit.test( 'Basic Edge/Sector Construction', assert => {
    const squareBoard = standardSquareBoardGenerations[ 0 ][ 0 ];

    const solutionOptions = {
      solveEdges: true,
      solveSectors: true, // TODO: done for ease of test
      solveFaceColors: false,
      highlander: true,
    } as const;

    const binaryFeatureMap = new BinaryFeatureMap( squareBoard, solutionOptions );

    const solutions = PatternBoardSolver.getSolutions( squareBoard, [] );
    const richSolutions = solutions.map( solution => new RichSolution( squareBoard, binaryFeatureMap, solution, solutionOptions.highlander ) );

    for ( const richSolution of richSolutions ) {
      console.log( richSolution.toDebugString() );

      const primaryFeatures = binaryFeatureMap.getBitsPrimaryFeatures( richSolution.solutionAttributeSet.data );
      const optionalFeatures = binaryFeatureMap.getBitsPrimaryFeatures( richSolution.solutionAttributeSet.optionalData );

      for ( const edge of squareBoard.edges ) {
        if ( !edge.isExit ) {
          if ( richSolution.solutionSet.has( edge ) ) {
            assert.ok( primaryFeatures.some( feature => feature instanceof BlackEdgeFeature && feature.edge === edge ), 'has non-exit black edge' );
          }
          else {
            assert.ok( primaryFeatures.some( feature => feature instanceof RedEdgeFeature && feature.edge === edge ), 'has non-exit red edge' );
          }
        }
        else {
          if ( richSolution.solutionSet.has( edge ) ) {
            assert.ok( !primaryFeatures.some( feature => feature instanceof BlackEdgeFeature && feature.edge === edge ), 'should not have black exit edge' );
            assert.ok( !primaryFeatures.some( feature => feature instanceof RedEdgeFeature && feature.edge === edge ), 'should not have red exit edge' );
          }
          else {
            const hasBlackOnExitVertex = edge.exitVertex!.edges.some( e => richSolution.solutionSet.has( e ) );

            if ( hasBlackOnExitVertex ) {
              assert.ok( primaryFeatures.some( feature => feature instanceof RedEdgeFeature && feature.edge === edge ), 'has HARD red exit' );
            }
            else {
              assert.ok( !primaryFeatures.some( feature => feature instanceof RedEdgeFeature && feature.edge === edge ), 'has soft red exit' );
              assert.ok( optionalFeatures.some( feature => feature instanceof RedEdgeFeature && feature.edge === edge ), 'supports optional red' );
            }
          }
        }
      }

      const feature = binaryFeatureMap.getBitsFeatureSet( richSolution.solutionAttributeSet.data );
      assert.ok( feature !== null, 'valid feature set' );

      console.log( feature!.toCanonicalString() );
    }

    assert.equal( richSolutions.length, 15 );
  } );

  QUnit.test( 'Basic Face Construction', assert => {
    const squareBoard = standardSquareBoardGenerations[ 0 ][ 0 ];

    const solutionOptions = {
      solveEdges: false,
      solveSectors: false,
      solveFaceColors: true,
      highlander: false,
    } as const;

    const binaryFeatureMap = new BinaryFeatureMap( squareBoard, solutionOptions );

    const solutions = PatternBoardSolver.getSolutions( squareBoard, [] );
    const richSolutions = solutions.map( solution => new RichSolution( squareBoard, binaryFeatureMap, solution, solutionOptions.highlander ) );

    for ( const richSolution of richSolutions ) {
      console.log( richSolution.toDebugString() );

      const feature = binaryFeatureMap.getBitsFeatureSet( richSolution.solutionAttributeSet.data );
      assert.ok( feature !== null, 'valid feature set' );

      console.log( feature!.toCanonicalString() );
    }

    assert.equal( richSolutions.length, 15 );
  } );
} );
