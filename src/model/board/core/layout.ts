
import { Circle, Line, Node } from 'phet-lib/scenery';
// @ts-expect-error
import cytoscape from '../../../lib/cytoscape/cytoscape.js';
// @ts-expect-error
import fcose from '../../../lib/cytoscape/cytoscape-fcose/src/index.js';
// @ts-expect-error
import coseBilkent from '../../../lib/cytoscape/cytoscape-cose-bilkent/index.js';
import { scene } from '../../../view/scene.ts';
import { Vector2 } from 'phet-lib/dot';
import { merge } from 'phet-lib/phet-core';
import { TPuzzle } from '../../puzzle/TPuzzle.ts';
import { TStructure } from './TStructure.ts';
import { TState } from '../../data/core/TState.ts';
import { TFaceData } from '../../data/face/TFaceData.ts';
import { TEdgeData } from '../../data/edge/TEdgeData.ts';
import { TVertex } from './TVertex.ts';
import { TEdge } from './TEdge.ts';
import EdgeState from '../../data/edge/EdgeState.ts';

cytoscape.use( fcose );
cytoscape.use( coseBilkent );

export const layoutTest = ( puzzle: TPuzzle<TStructure, TState<TFaceData & TEdgeData>> ) => {

  const board = puzzle.board;
  const state = puzzle.stateProperty.value;

  const nonRedEdges = board.edges.filter( edge => state.getEdgeState( edge ) !== EdgeState.RED );
  const nonRedVertices = board.vertices.filter( vertex => nonRedEdges.some( edge => edge.vertices.includes( vertex ) ) );

  const vertexTagMap: Map<TVertex, string> = new Map();
  const edgeTagMap: Map<TEdge, string> = new Map();

  nonRedVertices.forEach( ( vertex, index ) => {
    vertexTagMap.set( vertex, `v${index}` );
  } );
  nonRedEdges.forEach( ( edge, index ) => {
    edgeTagMap.set( edge, `e${index}` );
  } );

  const elements = [
    ...nonRedVertices.map( vertex => ( { data: { id: vertexTagMap.get( vertex ) } } ) ),
    ...nonRedEdges.map( edge => ( {
      data: {
        id: edgeTagMap.get( edge ),
        source: vertexTagMap.get( edge.vertices[ 0 ] ),
        target: vertexTagMap.get( edge.vertices[ 1 ] )
      }
    } ) )
  ];

  const cy = cytoscape( {
    headless: true,
    elements: elements
  } );

  // cy.add( element );
  // cy.destroy() <--- to clean up memory!

  const vertexScale = 20;
  nonRedVertices.forEach( vertex => {
    cy.getElementById( vertexTagMap.get( vertex ) ).position( { x: vertexScale * vertex.viewCoordinates.x, y: vertexScale * vertex.viewCoordinates.y } );
  } );

  // TODO: reproducible!!!
  // {
  //   const layout = cy.layout( {
  //     name: 'circle',
  //     radius: 50,
  //     animate: false
  //   } );
  //   layout.run();
  // }

  // coseCytoLayout( cy, { randomize: false } );
  // coseBilkentCytoLayout( cy, { randomize: true } );
  fcoseCytoLayout( cy, { randomize: false } );

  const debugNode = new Node( {
    scale: 0.4
  } );

  nonRedVertices.forEach( vertex => {
    const position = cy.getElementById( vertexTagMap.get( vertex ) ).position();
    console.log( vertex, position );

    debugNode.addChild( new Circle( 4, {
      x: position.x,
      y: position.y,
      fill: 'black'
    } ) );
  } );
  // const nodeIDs = [ 'a', 'b', 'c', 'd', 'e', 'f' ];
  // nodeIDs.forEach( id => {
  //   const position = cy.getElementById( id ).position();
  //   console.log( id, position );
  //
  //   debugNode.addChild( new Circle( 4, {
  //     x: position.x,
  //     y: position.y,
  //     fill: 'black'
  //   } ) );
  // } );
  nonRedEdges.forEach( edge => {
    const source = cy.getElementById( vertexTagMap.get( edge.start ) ).position();
    const target = cy.getElementById( vertexTagMap.get( edge.end ) ).position();
    console.log( edge, source, target );

    const start = new Vector2( source.x, source.y );
    const end = new Vector2( target.x, target.y );

    debugNode.addChild( new Line( start, end, {
      stroke: 'black'
    } ) );
  } );
  // const nodePairs = [ [ 'a', 'b' ], [ 'c', 'd' ], [ 'e', 'f' ], [ 'a', 'c' ], [ 'b', 'e' ] ];
  // nodePairs.forEach( pair => {
  //   const source = cy.getElementById( pair[ 0 ] ).position();
  //   const target = cy.getElementById( pair[ 1 ] ).position();
  //   console.log( pair, source, target );
  //
  //   const start = new Vector2( source.x, source.y );
  //   const end = new Vector2( target.x, target.y );
  //
  //   debugNode.addChild( new Line( start, end, {
  //     stroke: 'black'
  //   } ) );
  // } );

  debugNode.left = 10;
  debugNode.top = 100;
  scene.addChild( debugNode );

  /*
  for (var i = 0; i < 10; i++) {
      cy.add({
          data: { id: 'node' + i }
          }
      );
      var source = 'node' + i;
      cy.add({
          data: {
              id: 'edge' + i,
              source: source,
              target: (i % 2 == 0 ? 'a' : 'b')
          }
      });
  }
   */

};

/*
  name: 'cose',

  // Called on `layoutready`
  ready: function(){},

  // Called on `layoutstop`
  stop: function(){},

  // Whether to animate while running the layout
  // true : Animate continuously as the layout is running
  // false : Just show the end result
  // 'end' : Animate with the end result, from the initial positions to the end positions
  animate: true,

  // Easing of the animation for animate:'end'
  animationEasing: undefined,

  // The duration of the animation for animate:'end'
  animationDuration: undefined,

  // A function that determines whether the node should be animated
  // All nodes animated by default on animate enabled
  // Non-animated nodes are positioned immediately when the layout starts
  animateFilter: function ( node, i ){ return true; },


  // The layout animates only after this many milliseconds for animate:true
  // (prevents flashing on fast runs)
  animationThreshold: 250,

  // Number of iterations between consecutive screen positions update
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Excludes the label when calculating node bounding boxes for the layout algorithm
  nodeDimensionsIncludeLabels: false,

  // Randomize the initial positions of the nodes (true) or use existing positions (false)
  randomize: false,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 40,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: function( node ){ return 2048; },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 4,

  // Ideal edge (non nested) length
  idealEdgeLength: function( edge ){ return 32; },

  // Divisor to compute edge forces
  edgeElasticity: function( edge ){ return 32; },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 1.2,

  // Gravity force (constant)
  gravity: 1,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 1000,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.99,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0
 */
export const coseCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'cose',
    animate: false,
    quality: 'proof', // highest, of 'draft', 'default' or 'proof'
  }, options ) );
  layout.run();
};

/*
  // Called on `layoutready`
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // 'draft', 'default' or 'proof"
  // - 'draft' fast cooling rate
  // - 'default' moderate cooling rate
  // - "proof" slow cooling rate
  quality: 'default',
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // Whether to tile disconnected nodes
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Duration for animate:end
  animationDuration: 500,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5
 */
export const coseBilkentCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'cose-bilkent',
    quality: 'proof',
    animate: false
  }, options ) );
  layout.run();
};

/*
  // 'draft', 'default' or 'proof'
  // - "draft" only applies spectral layout
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate)
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // Whether or not to animate the layout
  animate: true,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
  packComponents: true,
  // Layout step - all, transformed, enforced, cose - for debug purpose only
  step: "all",

  /* spectral layout options

  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 75,
  // Power iteration tolerance
  piTol: 0.0000001,

  /* incremental layout options

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: node => 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: edge => 50,
  // Divisor to compute edge forces
  edgeElasticity: edge => 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // The comparison function to be used while sorting nodes during tiling operation.
  // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
  // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
  // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
  // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
  // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
  tilingCompareBy: undefined,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.3,

  /* constraint options

  // Fix desired nodes to predefined positions
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: undefined,
  // Align desired nodes in vertical/horizontal direction
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,
  // Place two nodes relatively in vertical/horizontal direction
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,

  /* layout event callbacks
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
 */
export const fcoseCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'fcose',
    quality: 'proof', // highest, of 'draft', 'default' or 'proof'
    animate: false
  }, options ) );
  layout.run();
};
