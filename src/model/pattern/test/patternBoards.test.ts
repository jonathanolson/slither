import QUnit from 'qunit';
import { standardSquareBoardGenerations } from '../pattern-board/patternBoards.ts';

QUnit.module( 'patternBoards', () => {
  QUnit.test( 'square pattern sanity', assert => {
    assert.equal( standardSquareBoardGenerations[ 0 ][ 0 ].vertices.length, 4 );

    for ( const generation of standardSquareBoardGenerations ) {
      for ( const board of generation ) {
        const nonExitFaces = board.faces.filter( face => !face.isExit );

        for ( const face of nonExitFaces ) {
          assert.equal( face.edges.length, 4 );
        }
      }
    }
  } );
} );
