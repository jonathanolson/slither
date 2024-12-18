- Minimap (draggable?)
- Pan with arrow keys (SC2 style)
- Vertex-state/face-state edit modes
- Haptics? (vibration on... long press?) - Not supported by iOS
- Allow users to have custom-saved boards, with names (to generate from?)
- Backtracker:
  - Reprioritize so we pick edges either (a) near to last change, or (b) the closer of 2 points on the region just modified?
  - What if we... slowly increase the depth until we get one reduction?
  - Look for "more likely" cases, and chase things near to it? (Instead of searching all of them, including unlikely pairs?)
  - Backtrack:
    - Generalize for any "binary toggle" that is feasible. "Edge", "Color", or vertex state might make sense. Maybe "connection" too?
      - For instance, if an area connects 
    - Take a state, pick a white edge, and solve both the red and black case for the edge (could extend to other things)
      - If one fails due to invalid "state", the other is correct
      - If not, optionally look at OTHER state that is the SAME in both versions
        - (basically, look at the changed state for each case, and see if there is overlap) 
    - Could... do other things than toggling an edge. Looking at combinations of edges for faces or vertices. Vertex state
      - OOO or coloring? 
    - Look for the most "fruitful" / changing edges/changes
    - Don’t overfocus on backtrack performance. Don’t tune algo much. It is NP complete. 
      - Focus on fast solutions to human solvable puzzles. Focus on improving “pattern base” to catch things that backtrackers would
    - With backtracking, can apply “faster” solvers in both branches before “slower” ones. Maybe bad for memory, good for early exit?
      - Does this mean we can report the "difficulty" of the next dirty solver? 
  - BACKTRACKER VISUALIZATION ---- show this in the UI.
    - Do we start pushing a SINGLE state on the stack, and pop/push as we go?
      - OMG our region "colors" will actually be perfect for visualizing, so that changing regions will flicker?
  - I want backtracker to find the "easiest" deduction (to show as a hint)
- Utils:
  - Spot (like an iterator, that basically holds a vertex/half-edge and provides a lot)
    - PROVIDES ACCESS TO THE DATA/GRID?
    - "open" or "closed" boundaries (whether it returns data that is valid or not outside of boundaries).
    - nextLeft, nextRight, previousLeft, previousRight: Spot
  - Spot4 --- allows "ghost" operations, where we are not on a real vertex/edge/face, but it knows the coordinates
    - getEdge( dir: CardinalDirection ): Edge
    - getVertex( dir: CardinalDirection ): Vertex
    - getFace( dir: OrdinalDirection ): Face
    - N/S/E/W edge, vertex
    - NE/SE/SW/NW face
    - turnLeft, turnRight, turnBack, forward(), shiftLeft, shiftRight, shiftBack
- (Does not seem to be the case!!!!!) logic-solver leaking memory like crazy, use something more modern
  - https://www.npmjs.com/package/z3-solver actually this might be better?
    - It doesn't play well with vite: https://github.com/Z3Prover/z3/issues/6768
    - It needs special headers or tricks
      - noted from https://www.npmjs.com/package/z3-solver?activeTab=readme
      - Can probably use https://github.com/gzuidhof/coi-serviceworker with GH Pages
      - Seems... like a pain
    - OMG YES use z3-solver... this looks way better
    - https://microsoft.github.io/z3guide/programming/Z3%20JavaScript%20Examples/
    - https://microsoft.github.io/z3guide/programming/Z3%20JavaScript%20Examples/#solve-sudoku
  - DO we need to minisat-WASM? see https://github.com/niklasso/minisat
    - NONO, use something like a derivative, like https://github.com/audemard/glucose
    - or https://github.com/arminbiere/lingeling?tab=readme-ov-file
  - GPL: https://github.com/GJDuck/SAT.js
- NO sphere, easier for the graphics/model to not make that generalization right now
- Voronoi boards - no, they have short edges and meh shaesp for this
- [defer] Chess-like history, with branching?
  - Undo/redo (as a tree ideally)
    - Can show "candidates" explored, that can be clicked on?
- Topological Simplification
  - DECIDE whether we are keeping this. - note, an "outside" Face might be a generally good idea (would have made this easier)
  - Fix the "empty loop handling" bugs, that cause things to overlap or... do something weird?
  - Match region color
  - Improve the force-directed graph layout?
    - Add repulsion of close vertices
    - Experiment with force = torque / length, we're ignoring the length right now
  - red-black-red transitions can be detached
  - white-black and black-white transitions CANNOT
  - Each result white/black edge maps to a set of white/black edges in the original
  - Each result valued face maps to a single valued face in the original
  - 
  - Steps (for simplification to another VALID same-type puzzle? - how to represent red edges - red edges might not map, right?)
    - Get a copy that has everything with Base* types (so we can apply adjustments/mutation?) 
    - Remove "fully satisfied" face values (if over-satisfied, in error state, leave it) -- any white, or any incorrect black, leave it
    - Vertex w/ 2 black, 0 white:
      - IF it doesn't have a triangular face on either side WITH a value still (because... omg)
        - OR if the triangular face has a non-red edge (we would cause a logical collapse) -- don't close the final loop too
      - New black edge going between the two vertices
      - Add two (pseudo) vertices on each side of the black edge (have the one on the side stay in the same location)
        - Add (pseudo) faces on each side
        - NOTE: If there were NO red edges connecting, DO NOT bother creating the pseudo vertex/face
          - IF this is the case, connect the single face with the new edge, and increase the face value by 1 (since it will get subtracted later)
      - Replace each red edge with a black edge going to the relevant pseudo-vertex
      - Remove the vertex and two black edges
        - Subtract -1 for every face value that touched one of the black edges
    - Vertex w/ 2 white, 0 black:
      - Do something similar to the above (with the triangular constraint), BUT WITH:
      - IF at least one of the white edges has NO valued faces
    - Vertex (all red) -- do after steps above (they can be created)
      - For each triangular face with a number.... (what about when they are adjacent?)
      - TODO
    - Edge (red, no faces)
      - REMOVE IT, combine faces
  - FOR LAYOUT we'll create "K_n" style edges for each face (extra edges for layout)
    - Perhaps give "edges" that combine a bunch --- a potentially longer ideal length?
    - CHECK signed area of each face, to see if we are still a planar embedding
- [deprecated because static instant works nicely] COLOR SHIFTING (for maintaining good color separation) 
  - Wave equation for color shifting is overkill right? (for per-segment)
  - If we want triadic colors (no?), use superposition of multiple offset angles
  - Per-edge region view
    - SimpleRegionView
      - Transfers edge nodes between regions!!
      - Has a (stepped) target hue as a whole
      - Has a collection of edge nodes
      - Has a collection of edges
      - Has an ordered list of half-edges (helpful)
      - Has an (ordered) array of "hue points" - connect them with the edge points.
      - !!!!!!
      -   convert to complex numbers, compute mean there, convert to polar again
      -   see https://rosettacode.org/wiki/Averages/Mean_angle, is atan2( 1/N * sum(sin(x)), 1/N * sum(cos(x)) )
      - !!!!!!
      - MEASURE DISTANCE STATICALLY - estimate if far (e.g. bounding box?) - if bounding box close then give a better approximation
        - FOR ANY GIVEN SET, just figure out what its "N closest regions" are
          - Consider making this "N closest for any", so some regions might have "more"? (reflexive satisfied)
        - ... if things have long regions of "close"...?
          - Mark a distance to all reasonable faces (within M hops of an edge), should be a quick scan
            - Each region has subset<face, distance> (to a threshold).
            - Find the intersection set of faces, and compute something with the "distance"
            - IF NONE, we use the bounding box setup (and it will be treated as "far" distance, with less (but slight) pressure).
              - OR JUST IGNORE IT?
              - IGNORE THOSE FAR THINGS, and rely maybe on the "global" distribution for these
        - Oscillation should effectively have "no" effect (be careful about orientation switches)
    - RegionEdgeNode: - pool
      - Node with a Path (shape gets mutated) - fill 
        - Slightly over-step to avoid conflation (thanks SVG)
      - edge / startPoint / endPoint 
      - startColorProperty: Property<string> <-- linked to gradient, BUT could also link to an "average" for the fill color
      - endColorProperty: Property<string>
      - startHue: Vector2 (polar)
      - endHue: Vector2 (polar)
      - startNextPoint: Vector2 | null - for handling shape
      - endNextPoint: Vector2 | null - for handling shape
    - RegionView:
      - hue: Vector2 (polar)
      - halfEdges: HalfEdge[] (ordered)
      - regionEdgeNodes: RegionEdgeNode[] (ordered, but complicated)
      - hueArray: Vector2[] (E+1) -- or unit Vector2 for polar/complex representation
        - NOTE: magnitude can be the number of edges, no?
    - Edge nodes (poolable?) --- pool yes
      - Per step "goes to target color faster" if one point is closer to target and other is further (creates the pulse)
  - PLAN:
    - FIRST check performance with single-edge setups (gradient and no gradient)
      - OOO the no-gradient approach could look neat
    - Start with organic
  - Edges AND Faces animate (shift) hue to maintain good separation
    - FACES::: could actually shift to have "shade" variation?
      - Imagine a subtle shift!!
  - New regions get a "good" starting color (based on surroundings), e.g. instantly go to their target color
  - Color Model - defines target/current color for each region (can swap whatever of these)
    - Organic (step-driven, recompute targets each frame)
      - Might be simpler to get "good" behavior
      - Might have cool shifts - one thing changes, which then triggers another thing to change, biological-looking
      - Risk of oscillation
      - Worse performance?
    - Quality metrics (unimplemented)
      - Avoid "bad" colors for large regions (and especially at the end)
        - Can have global hue shifts/rotations
      - Don't change hues too quickly (limit velocity)
      - NO fast oscillations? Increase "damping" if something seems to be "bouncing" between targets, so that it slows down
      - Face hues are... different? similar? from the edge hues
    - When we "spawn" a completely new region (no edges from before)... pick the colors nicely based on the metrics?
      - Could check points around hue curve to see?
  - Region Model - takes the Color Model, and can animate either:
    - Full region color <---- START WITH THIS
    - Subregions same color (until they join)
      - Once a subregion matches color (enough), it gets combined 
    - Each edge different
      - Ooo this could potentially look neat!
    - Each edge different + gradient color for each
      - Model each vertex with a color separately 
      - SO COOL to see the gradient "pulse through"? 
      - Gradient should go UP TO the join, NOT INCLUDING the join (so that the entire join is the same color)
      - Would create a node for each edge, position the gradient (and adjust shape/visibility/endpoint color based on connections/etc)
      - (possible, each SVG stop gets updated in SVG without recreating - give it a Property)
    - NOTE: anything other than full-region might want to get "mitered joints" at joints, however is desired
      - That... seems like a pain. Especially for nicely rounded stroked corners. Probably do it without other support?
  - Metric for "separation between two regions" - not dependent on other regions, does not need to be recomputed
    - TODO: how to compute?
  - Weird edges:
    - Shorten them somewhat, so they don't connect? LEAVE GRAY
