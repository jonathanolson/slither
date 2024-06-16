import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { VertexStateNode } from './VertexStateNode.ts';

import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { Node } from 'phet-lib/scenery';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TState } from '../../model/data/core/TState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { TVertexStateData } from '../../model/data/vertex-state/TVertexStateData.ts';

export class VertexStateViewNode extends Node {
  public constructor(
    board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TVertexStateData & TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    style: TPuzzleStyle,
  ) {
    super({
      pickable: false,
    });

    const multilink = Multilink.multilink(
      [stateProperty, style.vertexStateVisibleProperty],
      (state, isVertexStateVisible) => {
        this.children.forEach((child) => child.dispose());
        this.children = [];

        if (isVertexStateVisible) {
          board.vertices.forEach((vertex) => {
            this.addChild(new VertexStateNode(vertex, stateProperty, style));
          });
        }
      },
    );
    this.disposeEmitter.addListener(() => multilink.dispose());

    // Apply effects when solved
    const isSolvedListener = (isSolved: boolean) => {
      this.visible = !isSolved;
    };
    isSolvedProperty.link(isSolvedListener);
    this.disposeEmitter.addListener(() => {
      isSolvedProperty.unlink(isSolvedListener);
      this.children.forEach((child) => child.dispose());
    });
  }
}
