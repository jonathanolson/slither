import { TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../../puzzle/PuzzleModel.ts';
import { Node } from 'phet-lib/scenery';
import { scene } from '../../../view/scene.ts';
import { TBoard } from '../core/TBoard.ts';
import { TState } from '../../data/core/TState.ts';
import { TFaceData } from '../../data/face/TFaceData.ts';
import { TEdgeData } from '../../data/edge/TEdgeData.ts';
import { TSimpleRegionData } from '../../data/simple-region/TSimpleRegionData.ts';
import { LayoutPuzzle } from './LayoutPuzzle.ts';
import { LayoutDerivative } from './LayoutDerivative.ts';
import { showLayoutTestProperty } from './layout.ts';

export const layoutTest = ( puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null> ) => {

  const layoutTestNode = new Node( {
    scale: 0.4
  } );
  scene.addChild( layoutTestNode );

  const showPuzzleLayout = ( board: TBoard, state: TState<TFaceData & TEdgeData & TSimpleRegionData> ) => {

    // Don't show once solved?
    if ( state.getSimpleRegions().some( sr => sr.isSolved ) ) {
      return;
    }

    const layoutPuzzle = new LayoutPuzzle( board, state );

    // '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'

    layoutPuzzle.simplify();
    // layoutPuzzle.layout();

    // const barycentricDerivative = LayoutDerivative.getBarycentricDeltas( layoutPuzzle ).getAreaCorrectedDerivative();
    // const angularDerivative = LayoutDerivative.getAngularDeltas( layoutPuzzle ).getAreaCorrectedDerivative();
    // const angularDerivative = LayoutDerivative.getAngularDeltas( layoutPuzzle );

    // TODO: show multiple generations worth?

    // for ( let i = 0; i < 0; i++ ) {
    //   layoutPuzzle.applyDerivative( LayoutDerivative.getBarycentricDeltas( layoutPuzzle ).getAreaCorrectedDerivative().timesScalar( 0.1 ) );
    // }



    const getDerivative = () => {
      return LayoutDerivative.getAngularDeltas( layoutPuzzle )
        .plus( LayoutDerivative.getHookesAttraction( layoutPuzzle, 1, 0.25 ) )
        .plus( LayoutDerivative.getRegularPolygonDeltas( layoutPuzzle, 1, true ).timesScalar( 0.5 ) )
        .getAreaCorrectedDerivative();
    };

    let amount = 0.2;
    for ( let i = 0; i < 200; i++ ) {
      if ( i % 10 === 0 ) {
        amount *= 0.90;
      }
      layoutPuzzle.applyDerivative( getDerivative().timesScalar( amount ) );
      // layoutPuzzle.applyDerivative( LayoutDerivative.getAngularDeltas( layoutPuzzle ).getAreaCorrectedDerivative().timesScalar( 0.1 ) );
    }

    // const angularDerivative = LayoutDerivative.getAngularDeltas( layoutPuzzle ).getAreaCorrectedDerivative();
    // const hookesDerivative = LayoutDerivative.getHookesAttraction( layoutPuzzle, 1, 0.2 ).getAreaCorrectedDerivative();

    const debugNode = new Node( {
      children: [
        layoutPuzzle.getDebugNode(),
        getDerivative().getDebugNode(),
        // angularDerivative.getDebugNode(),
        // barycentricDerivative.getDebugNode(),
      ]
    } );

    const size = 600;

    debugNode.scale( Math.min( size / debugNode.width, size / debugNode.height ) );

    debugNode.left = 20;
    debugNode.top = 130;

    layoutTestNode.children = [
      debugNode
    ];
  };

  const puzzleStateListener = () => {
    layoutTestNode.children = [];

    if ( showLayoutTestProperty.value && puzzleModelProperty.value ) {
      showPuzzleLayout( puzzleModelProperty.value.puzzle.board, puzzleModelProperty.value.puzzle.stateProperty.value );
    }
  };
  puzzleModelProperty.lazyLink( puzzleStateListener );
  showLayoutTestProperty.lazyLink( puzzleStateListener );
  puzzleStateListener();

  puzzleModelProperty.link( ( newPuzzleModel, oldPuzzleModel ) => {
    if ( oldPuzzleModel ) {
      oldPuzzleModel.puzzle.stateProperty.unlink( puzzleStateListener );
    }
    if ( newPuzzleModel ) {
      newPuzzleModel.puzzle.stateProperty.link( puzzleStateListener );
    }
  } );
};