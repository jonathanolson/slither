import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';
import { deserializePlanarMappedPatternBoard } from './model/pattern/TPlanarMappedPatternBoard.ts';
import { basicPatternBoards, standardCairoBoardGenerations, standardHexagonalBoardGenerations, standardRhombilleBoardGenerations, standardSnubSquareBoardGenerations, standardSquareBoardGenerations, standardTriangularBoardGenerations, standardTrihexagonalBoardGenerations } from './model/pattern/patternBoards.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';

// Load with `http://localhost:5173/pattern-boards.html?debugger`

// @ts-expect-error
window.assertions.enableAssert();

const scene = new Node();

const rootNode = new Node( {
  renderer: 'svg',
  children: [ scene ]
} );

const display = new Display( rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false
} );
document.body.appendChild( display.domElement );

display.setWidthHeight( window.innerWidth, window.innerHeight );

( async () => {

  const container = new VBox( {
    x: 10,
    y: 10,
    align: 'left'
  } );
  scene.addChild( container );

  const getGenerationNode = ( generation: TPatternBoard[] ): Node => {
    return new AlignBox( new HBox( {
      spacing: 10,
      children: generation.map( patternBoard => new PlanarMappedPatternBoardNode( {
        patternBoard: patternBoard,
        planarPatternMap: planarPatternMaps.get( patternBoard )!
      } ) )
    } ), { margin: 5 } );
  };

  const getGenerationsNode = ( generations: TPatternBoard[][] ): Node => {
    return new VBox( {
      spacing: 10,
      align: 'left',
      children: generations.map( generation => getGenerationNode( generation ) )
    } );
  };

  container.addChild( getGenerationsNode( [ basicPatternBoards ] ) );

  container.addChild( getGenerationsNode( standardSquareBoardGenerations ) );

  container.addChild( getGenerationsNode( standardHexagonalBoardGenerations ) );

  container.addChild( getGenerationsNode( standardRhombilleBoardGenerations ) );

  container.addChild( getGenerationsNode( standardCairoBoardGenerations ) );

  container.addChild( getGenerationsNode( standardTriangularBoardGenerations ) );

  container.addChild( getGenerationsNode( standardSnubSquareBoardGenerations ) );

  container.addChild( getGenerationsNode( standardTrihexagonalBoardGenerations ) );

  // TODO: terminology omg!
  const a = deserializePlanarMappedPatternBoard( "{\"patternBoard\":\"[0,9,\\\"faces\\\",[[0,1,2,3],[4,5,0,6],[1,7,8,2]]]\",\"planarPatternMap\":\"[[[9,9],[10,9],[10,10],[9,10],[8,8],[9,8],[8,9],[11,9],[11,10]],[[0,1],[1,2],[2,3],[0,3],[4,5],[0,5],[0,6],[4,6],[1,7],[7,8],[2,8]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]],[[8,8],[9,8],[9,9]],[[9,8],[9,9],[8,9]],[[9,9],[8,9],[8,8]],[[8,9],[8,8],[9,8]],[[10,9],[11,9],[11,10]],[[11,9],[11,10],[10,10]],[[11,10],[10,10],[10,9]],[[10,10],[10,9],[11,9]]],[[[9,9],[10,9],[10,10],[9,10]],[[8,8],[9,8],[9,9],[8,9]],[[10,9],[11,9],[11,10],[10,10]],[[9,9],[10,9],[9.5,8.75]],[[10,10],[9,10],[9.5,10.25]],[[9,9],[9,10],[8.75,9.5]],[[8,8],[9,8],[8.5,7.75]],[[9,9],[9,8],[9.25,8.5]],[[9,9],[8,9],[8.5,9.25]],[[8,8],[8,9],[7.75,8.5]],[[10,9],[11,9],[10.5,8.75]],[[11,9],[11,10],[11.25,9.5]],[[10,10],[11,10],[10.5,10.25]]]]\"}" );
  const b = deserializePlanarMappedPatternBoard( "{\"patternBoard\":\"[0,9,\\\"faces\\\",[[0,1,2,3],[4,5,0,6],[3,2,7,8]]]\",\"planarPatternMap\":\"[[[9,9],[10,9],[10,10],[9,10],[8,8],[9,8],[8,9],[10,11],[9,11]],[[0,1],[1,2],[2,3],[0,3],[4,5],[0,5],[0,6],[4,6],[2,7],[7,8],[3,8]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]],[[8,8],[9,8],[9,9]],[[9,8],[9,9],[8,9]],[[9,9],[8,9],[8,8]],[[8,9],[8,8],[9,8]],[[9,10],[10,10],[10,11]],[[10,10],[10,11],[9,11]],[[10,11],[9,11],[9,10]],[[9,11],[9,10],[10,10]]],[[[9,9],[10,9],[10,10],[9,10]],[[8,8],[9,8],[9,9],[8,9]],[[9,10],[10,10],[10,11],[9,11]],[[9,9],[10,9],[9.5,8.75]],[[10,9],[10,10],[10.25,9.5]],[[9,9],[9,10],[8.75,9.5]],[[8,8],[9,8],[8.5,7.75]],[[9,9],[9,8],[9.25,8.5]],[[9,9],[8,9],[8.5,9.25]],[[8,8],[8,9],[7.75,8.5]],[[10,10],[10,11],[10.25,10.5]],[[10,11],[9,11],[9.5,11.25]],[[9,10],[9,11],[8.75,10.5]]]]\"}" );

  container.addChild( new HBox( {
    spacing: 10,
    children: [
      new PlanarMappedPatternBoardNode( a, { labels: true } ),
      new PlanarMappedPatternBoardNode( b, { labels: true } )
    ]
  } ) );

  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();

} )();
