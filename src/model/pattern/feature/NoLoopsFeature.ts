import { TFeature } from './TFeature.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicAnd, logicNotAll } from '../../logic/operations.ts';
import { TPatternBoard } from '../TPatternBoard.ts';
import { TPatternVertex } from '../TPatternVertex.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class NoLoopsFeature implements TFeature {

  public constructor(
    public readonly possibleLoops: TPatternEdge[][]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return this.possibleLoops.every( loop => loop.some( edge => !isEdgeBlack( edge ) ) );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicAnd( this.possibleLoops.map( loop => logicNotAll( loop.map( edge => getFormula( edge ) ) ) ) );
  }

  public static fromBoard( patternBoard: TPatternBoard ): NoLoopsFeature {
    return new NoLoopsFeature( NoLoopsFeature.findLoops( patternBoard.edges, patternBoard.vertices ).map( set => [ ...set ] ) );
  }

  public static findLoops( edges: TPatternEdge[], vertices: TPatternVertex[] ): Set<TPatternEdge>[] {
    const loops: Set<TPatternEdge>[] = [];
    const loopIdentifiers = new Set<string>();

    const visitedVertices = new Set<TPatternVertex>();
    const path: TPatternEdge[] = [];

    const recur = ( currentVertex: TPatternVertex, startVertex: TPatternVertex ) => {
      for ( const edge of currentVertex.edges ) {
        if ( edge.vertices.length < 2 ) {
          continue;
        }

        const nextVertex = edge.vertices.find( v => v !== currentVertex )!;
        assertEnabled() && assert( nextVertex );

        if ( visitedVertices.has( nextVertex ) ) {
          continue;
        }

        if ( nextVertex === startVertex && path.length >= 3 ) {

          const loop = [ ...path, edge ];

          const loopIdentifier = loop.map( edge => edge.index ).sort().join( ',' );
          if ( !loopIdentifiers.has( loopIdentifier ) ) {
            loopIdentifiers.add( loopIdentifier );
            loops.push( new Set( loop ) );
          }
        }
        else {
          visitedVertices.add( nextVertex );

          path.push( edge );
          recur( nextVertex, startVertex );
          path.pop();

          visitedVertices.delete( nextVertex );
        }
      }
    };

    for ( const vertex of vertices ) {
      recur( vertex, vertex );
    }

    return loops;
  }
}