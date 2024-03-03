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

    const layoutPuzzle = new LayoutPuzzle( board, state );

    layoutPuzzle.simplify();
    // layoutPuzzle.layout();

    console.log( 'signed area', layoutPuzzle.getSignedArea() );

    const barycentricDerivative = LayoutDerivative.getBarycentricDeltas( layoutPuzzle ).getAreaCorrectedDerivative();

    console.log( barycentricDerivative.getAreaDerivative() );

    // TODO: show multiple generations worth?

    for ( let i = 0; i < 0; i++ ) {
      layoutPuzzle.applyDerivative( LayoutDerivative.getBarycentricDeltas( layoutPuzzle ).getAreaCorrectedDerivative().timesScalar( 0.1 ) );
    }

    const debugNode = new Node( {
      children: [
        layoutPuzzle.getDebugNode(),
        barycentricDerivative.getDebugNode()
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