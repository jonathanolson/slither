import { TSquareBoard } from '../square/TSquareBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { validateBoard } from './validateBoard.ts';
import { TSquareEdge } from '../square/TSquareEdge.ts';
import { TSquareHalfEdge } from '../square/TSquareHalfEdge.ts';
import { CardinalDirection } from '../square/Direction.ts';
import { Orientation } from 'phet-lib/phet-core';

export const validateSquareBoard = ( board: TSquareBoard ): void => {

  if ( !assertEnabled() ) {
    return;
  }
  validateBoard( board );

  board.vertices.forEach( vertex => {
    const atTop = vertex.logicalCoordinates.y === 0;
    const atBottom = vertex.logicalCoordinates.y === board.height;
    const atLeft = vertex.logicalCoordinates.x === 0;
    const atRight = vertex.logicalCoordinates.x === board.width;

    assert( ( vertex.northIncomingHalfEdge === null ) === atTop );
    assert( ( vertex.eastIncomingHalfEdge === null ) === atRight );
    assert( ( vertex.southIncomingHalfEdge === null ) === atBottom );
    assert( ( vertex.westIncomingHalfEdge === null ) === atLeft );
    assert( ( vertex.northOutgoingHalfEdge === null ) === atTop );
    assert( ( vertex.eastOutgoingHalfEdge === null ) === atRight );
    assert( ( vertex.southOutgoingHalfEdge === null ) === atBottom );
    assert( ( vertex.westOutgoingHalfEdge === null ) === atLeft );
    assert( ( vertex.northEdge === null ) === atTop );
    assert( ( vertex.eastEdge === null ) === atRight );
    assert( ( vertex.southEdge === null ) === atBottom );
    assert( ( vertex.westEdge === null ) === atLeft );

    const checkEdges = (
      edge: TSquareEdge,
      incomingHalfEdge: TSquareHalfEdge,
      outgoingHalfEdge: TSquareHalfEdge,
      direction: CardinalDirection
    ) => {
      assert( edge.forwardHalf === incomingHalfEdge || edge.forwardHalf === outgoingHalfEdge );
      assert( edge.reversedHalf === incomingHalfEdge || edge.reversedHalf === outgoingHalfEdge );
      assert( incomingHalfEdge.reversed === outgoingHalfEdge );

      const coordinate = vertex.logicalCoordinates.plus( direction.delta );
      assert( incomingHalfEdge.start.logicalCoordinates.equals( coordinate ) );
      assert( outgoingHalfEdge.end.logicalCoordinates.equals( coordinate ) );
      assert( incomingHalfEdge.end.logicalCoordinates.equals( vertex.logicalCoordinates ) );
      assert( outgoingHalfEdge.start.logicalCoordinates.equals( vertex.logicalCoordinates ) );
    };
    if ( !atTop ) {
      checkEdges( vertex.northEdge!, vertex.northIncomingHalfEdge!, vertex.northOutgoingHalfEdge!, CardinalDirection.NORTH );
    }
    if ( !atRight ) {
      checkEdges( vertex.eastEdge!, vertex.eastIncomingHalfEdge!, vertex.eastOutgoingHalfEdge!, CardinalDirection.EAST );
    }
    if ( !atBottom ) {
      checkEdges( vertex.southEdge!, vertex.southIncomingHalfEdge!, vertex.southOutgoingHalfEdge!, CardinalDirection.SOUTH );
    }
    if ( !atLeft ) {
      checkEdges( vertex.westEdge!, vertex.westIncomingHalfEdge!, vertex.westOutgoingHalfEdge!, CardinalDirection.WEST );
    }

    assert( ( vertex.northeastFace === null ) === ( atTop || atRight ) );
    assert( ( vertex.southeastFace === null ) === ( atBottom || atRight ) );
    assert( ( vertex.southwestFace === null ) === ( atBottom || atLeft ) );
    assert( ( vertex.northwestFace === null ) === ( atTop || atLeft ) );
  } );

  board.edges.forEach( edge => {
    assert( edge.northVertex === edge.forwardHalf.northVertex );
    assert( edge.eastVertex === edge.forwardHalf.eastVertex );
    assert( edge.southVertex === edge.forwardHalf.southVertex );
    assert( edge.westVertex === edge.forwardHalf.westVertex );
    assert( edge.northVertex === edge.reversedHalf.northVertex );
    assert( edge.eastVertex === edge.reversedHalf.eastVertex );
    assert( edge.southVertex === edge.reversedHalf.southVertex );
    assert( edge.westVertex === edge.reversedHalf.westVertex );

    assert( edge.orientation === edge.forwardHalf.orientation );
    assert( edge.orientation === edge.reversedHalf.orientation );

    if ( edge.orientation === Orientation.HORIZONTAL ) {
      assert( edge.westFace === null );
      assert( edge.eastFace === null );

      assert( edge.westVertex !== null );
      assert( edge.eastVertex !== null );
      assert( edge.northFace === edge.forwardFace );
      assert( edge.southFace === edge.reversedFace );
    }
    else {
      assert( edge.northFace === null );
      assert( edge.southFace === null );

      assert( edge.northVertex !== null );
      assert( edge.southVertex !== null );
      assert( edge.eastFace === edge.forwardFace );
      assert( edge.westFace === edge.reversedFace );
    }
  } );

  board.faces.forEach( face => {
    assert( face.northHalfEdge.face === face );
    assert( face.eastHalfEdge.face === face );
    assert( face.southHalfEdge.face === face );
    assert( face.westHalfEdge.face === face );

    // Loop around face
    assert( face.northHalfEdge.next === face.westHalfEdge );
    assert( face.westHalfEdge.next === face.southHalfEdge );
    assert( face.southHalfEdge.next === face.eastHalfEdge );
    assert( face.eastHalfEdge.next === face.northHalfEdge );

    assert( face.northHalfEdge.edge === face.northEdge );
    assert( face.eastHalfEdge.edge === face.eastEdge );
    assert( face.southHalfEdge.edge === face.southEdge );
    assert( face.westHalfEdge.edge === face.westEdge );

    assert( face.northwestVertex === face.northEdge.start );
    assert( face.northwestVertex === face.westEdge.start );
    assert( face.northeastVertex === face.northEdge.end );
    assert( face.northeastVertex === face.eastEdge.start );
    assert( face.southwestVertex === face.southEdge.start );
    assert( face.southwestVertex === face.westEdge.end );
    assert( face.southeastVertex === face.southEdge.end );
    assert( face.southeastVertex === face.eastEdge.end );
  } );
};