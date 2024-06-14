import { TBoard } from './TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import _ from '../../../workarounds/_.ts';

export const validateBoard = (board: TBoard): void => {
  if (!assertEnabled()) {
    return;
  }

  board.edges.forEach((edge) => {
    const forwardHalf = edge.forwardHalf;
    const reversedHalf = edge.reversedHalf;

    assert(forwardHalf.edge === edge);
    assert(reversedHalf.edge === edge);
    assert(!forwardHalf.isReversed);
    assert(reversedHalf.isReversed);

    assert(forwardHalf.reversed === reversedHalf);
    assert(reversedHalf.reversed === forwardHalf);

    assert(forwardHalf.start === edge.start);
    assert(forwardHalf.end === edge.end);
    assert(reversedHalf.start === edge.end);
    assert(reversedHalf.end === edge.start);

    assert(forwardHalf.next.previous === forwardHalf);
    assert(forwardHalf.previous.next === forwardHalf);
    assert(reversedHalf.next.previous === reversedHalf);
    assert(reversedHalf.previous.next === reversedHalf);
    assert(forwardHalf.next !== forwardHalf);
    assert(forwardHalf.previous !== forwardHalf);
    assert(reversedHalf.next !== reversedHalf);
    assert(reversedHalf.previous !== reversedHalf);

    assert(forwardHalf.next.face === forwardHalf.face);
    assert(forwardHalf.previous.face === forwardHalf.face);
    assert(reversedHalf.next.face === reversedHalf.face);
    assert(reversedHalf.previous.face === reversedHalf.face);

    assert(forwardHalf.face === edge.forwardFace);
    assert(reversedHalf.face === edge.reversedFace);
  });

  board.vertices.forEach((vertex) => {
    vertex.incomingHalfEdges.forEach((halfEdge) => {
      assert(halfEdge.end === vertex);
    });
    vertex.outgoingHalfEdges.forEach((halfEdge) => {
      assert(halfEdge.start === vertex);
    });
    const getIncomingHalfEdge = (n: number) =>
      vertex.incomingHalfEdges[(n + vertex.incomingHalfEdges.length) % vertex.incomingHalfEdges.length];
    const getOutgoingHalfEdge = (n: number) =>
      vertex.outgoingHalfEdges[(n + vertex.outgoingHalfEdges.length) % vertex.outgoingHalfEdges.length];
    _.range(0, vertex.incomingHalfEdges.length).forEach((i) => {
      const incoming = getIncomingHalfEdge(i);
      const outgoing = getOutgoingHalfEdge(i);
      assert(incoming.reversed === outgoing);

      assert(incoming.next === getOutgoingHalfEdge(i - 1));
      assert(outgoing.previous === getIncomingHalfEdge(i + 1));
    });
    vertex.edges.forEach((edge) => {
      assert(edge.start === vertex || edge.end === vertex);
      assert(
        vertex.incomingHalfEdges.includes(edge.forwardHalf) || vertex.outgoingHalfEdges.includes(edge.forwardHalf),
      );
      assert(
        vertex.incomingHalfEdges.includes(edge.reversedHalf) || vertex.outgoingHalfEdges.includes(edge.reversedHalf),
      );

      if (edge.forwardFace) {
        assert(edge.forwardFace.vertices.includes(vertex));
        assert(vertex.faces.includes(edge.forwardFace));
      }
      if (edge.reversedFace) {
        assert(edge.reversedFace.vertices.includes(vertex));
        assert(vertex.faces.includes(edge.reversedFace));
      }
    });
    vertex.faces.forEach((face) => {
      assert(face.vertices.includes(vertex));
    });
  });
};
