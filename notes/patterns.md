
# Patterns

- TODO
  - Visualize embedded sectors (and test out all of the vertex rule boards)
  - Visualize embeddings WITHIN pattern boards(!)
  - 
  - Debug the vertex rule matching
  - Pattern = pattern-board + pattern-state (features?)
    - Face values are part of the pattern/features, no? 
    - How to think of highlander?
  - 
  - How do we map "exit edges" to multiple things?
    - The isomorphism of an embedding... won't store that? We'll need to extract it out
    - !! Have an "Embedding" type? (Could contain an isomorphism?)
      - Vertices: ALL 1-to-1
      - Edges:
        - non-exit 1-to-1
        - exit 1-to-0+ (separate out!)
      - Sectors: ALL 1-to-1
      - Faces: (can store map to TPatternFace - won't be null for "outside")
  - !!!!!!!!!
  - !!! Find all embeddings of a specific (shared) patternboard in a board-pattern-board
  - !!!!! THEN GET the "current features/state" of it (from the board+puzzle=state) => "featured board" so we can scan efficiently
  - !!! (extract features from board+state, into a featured board)
  - !!!!!!!!!
  - We do NOT apply "black exit edges" with the pattern, or exit sectors, etc. Keep things simpler, rely in "larger" patterns for those
  - Vertex topology updates to be... like there are "face portions" and non-face portions
    - [no] WAIT, are most "vertex" rules... really "face" rules???
      - NO NO, we really DO have vertex topology setups 
  - [ignore, we will not infer in invalid puzzle] How to "pattern match" an "exit edge" if it will contain... 2 black? (patterns will not really apply well)

- We are able to apply patterns without OR WITH the "topological simplification"(!)
  - Ooo, this might be good for generating puzzles?

- ? Questions (first)
  - Exit sectors... WHY?!?!? 
  - Highlander? - do exit points connect in the same way?
  - ? Keep patterns on detecting "invalidity"?

- Have "nonzero-crossing" and "2+ crossing"?
  - We can have cases where "we have a 0-crossing loop to two faces" (and will need a 2+ crossing), or "we have a 1-crossing loop to two faces" (and will need a nonzero-crossing)

- Assume patterns/rules only applied if they don't include the entire solution (can't be the loop, loops prevented)

[API needs to be compatible with boards, maybe with adapter]
  - Can we put an 'index' on everything in a board?

- Each boolean will be on a state:
  - NOT_FOUND (initial state)
  - POSSIBLE
  - IMPOSSIBLE

- Flexiboards
  - Logical edges: "internal", "boundary", "exit vertex"
  - Logical faces: "faces", "exit faces"
  - Isomorphism
    - Automorphisms TREATING exit vertices as different than non-exit vertices
    - Arbitrary vertex, edge, face:
      - flexiboard X => other flexiboard Y / board Y, etc.
  - Find embeddings in boards:
    - Do in somewhat face-based (should be FAST)

- Running through all SAT solutions is possible, but can do better
  - First, do pre-checks (quick) to see if the pattern is clearly impossible 
  - Keep a running list of loops (that will always be negated)
  - FIRST find a no-added-constraint no-loop solution
    - IF none, then the pattern won't occur in a valid puzzle
  - If a no-loop solution is found, mark all of the POSSIBLE things immediately.
  - After we have one solution, we can:
    - Find a NOT_FOUND boolean, restart with a constraint that it must be possible, and see if we can find a solution:
      - If we can't, mark it IMPOSSIBLE
      - If we can, do the normal "mark POSSIBLE" things and start again with another NOT_FOUND BOOLEAN
    - NOTE: Might be more efficient to run through a fixed (N=10) number of solutions, to get more possible bits?

- Flexible BUT NOT TOPO-invariant (no red edge removal, but we generate face combinations):
  - (NOT variable-vertex-order for non-boundary parts) 
  - VertexRule
    - A center vertex, with N edges around it
    - State for edge/face-color/sector/vertex (NOT face)
    - Order 6 typical, but order 12 for Triakis Triangular / Bisected Hexagonal... 8 for Tetrakis Square
  - FaceRule
    - Set of vertices
      - Flag: boundary? (IF SO, flag: allow exit?) --- TODO, put this into one concept?
        - NOTE: there is a "single" boundary, BUT there might be "cut vertices" that the pattern can "twist" at.
        - We will iterate through the boundary vertices allowing exits.
    - Set of faces
      - Vertex list (can reconstruct all edges from this)
      - face value | null
    - (optional): a board that this was generated from (and it applies to), with an injection
    - Edge state for all edges (AND exits)
    - Face color state for internal faces AND adjacent faces (treat every boundary edge as having a different face, might be true in some cases)
    - Sector state:
      - for all "internal to our faces"
      - IF an exit, have a sector state for both of the neighbor edges AND the "exit" edge (will generalize)
    - Vertex State for all vertices:
      - Treat exit edge as a possible edge for this (will generalize)
    - Face State for all faces
    - MATCHES if:
      - Injective function from rule vertices to puzzle vertices
      - Puzzle has no edges touching a "non-boundary" vertex (or a non-allow-exit boundary vertex) that isn't an edge in the rule
      - Puzzle has every edge that the rule has
    - Generate:
      - Pick a board (or boards) to generate from
      - Have a set of "topologies" that we have generated rules with (e.g. board + face set)
        - Check these against isomorphism for any NEW topology before generating rules from it
      - First, process all unique-order faces as its own topology (or faces in unique positions)
        - Oh my... this will generate rules for... PENROSE!!!!
      - Then, start adding at-least-corner-adjacent faces, checking isomorphism (think of good ways to do this)
        - So we'll explore corner-adjacent and full-adjacent (to any face in existing combos), guard isomorphic
      - Prevent combinations where... a face isn't included but all of its neighbors are? (or perhaps... if all its vertices are included, include it?) THINK
      - Slowly iterate adding more faces. IF we reach a null face (exterior) of our demo board... do we exit? NO, presumably keep going
      - This will create "generations" of faces
    - Canonicalize:
      - Find the vertex permutation that gives us the lexicographically smallest order of states.
      - Then we can use equality to check isomorphism (and we can store this in a hash table)
    - FaceRule application to:
      - A puzzle (with a board)
      - A FaceRule state(!) so we can directly see what rules "dominate" others, and construct a minimal set of rules.
        - OR... we just have things create a matching puzzle (board+state), and then apply to that board?
          - Padding is complicated.... nah
        - Yeah, just find subgraph isomorphisms and check?
    - Exit edge state handling:
      - FIND SYMMETRIES for the input data(!?)
      - Find all unique combinations of all of the "black exit edges" (whether they are there or not)
        - e.g. for a 3-face with one "no-exit" vertex (causing incident opposite):
          - We have a "rule" for that face where there are multiple matched exits (no edges set)
            - (2 matched exits - incident!)
            - (3 matched exits - no data besides vertex state)
          - We have a "rule" for that face where there is a single matched exit (edge set to black)
      - Edge state:
        - red-or-black / red-only exit: separate "pattern" for N of matched exit vertices
        - black exit:
          - 1 edge
          - 2 edges (one red, one white) - each orientation?
          - 3 edges (two red, one white) - each orientation?
      - Sector state:
        - ...
    - Matching:
      - Similar to induced subgraph isomorphism.
    - Visualization
      - Direct (the pattern data itself)
        - How to show "exit" edges for "twist" vertices?
      - Indirect (examples on a board)
        - For viz, we search for possible occurrences in a tiling (there might be a good number, can we enumerate?)
          - See where it applies, cut faces too far from the pattern (or create a grid view around it, and clip)
    - If rules have isomorphic topologies, check these (multiple?) isomorphisms to see if they are isomorphic rules(!)
    - "FlexBoard" should be memoized, so that we can store computed automorphisms (and subgraph isomorphisms)
      - And... SHARED between rules!
      - Automorphisms (can be used be rules to see if they have symmetries in input)
      - List all of the potential features (boolean values)
        - (follow "state" boolean conventions, true means "this configuration is possible")
        - Feature
          - Ability to add SAT condition

- [NO] !! First we need efficient serialization of state, so we can nicely serialize rules, no?
  - NO, we have different (compact) representation. We should still do that though

- !!!#!#!#!
  - What about patterns where "we can't connect two points in space" (e.g. simple-region premature?)

https://github.com/timhutton/slinker ---> has the "solving rules"
Review https://github.com/timhutton/slinker/blob/main/src/SlinkerGrid.cpp !!!!

- Inputs are the board (primary and expanded), and the booleans where are marked as "IMPOSSIBLE" (also face values?)
- Explicitly model symmetries when constructing patterns?



[this is mostly old, refresh it]:

- Highlander specific
  - DO we detect general highlander, or just use specific patterns?

- Exits from a pattern might need to be specific? (means we don't have to pad grids like previous solution?)
  - EACH PATTERN will have a certain number of exists
    - !! compute for each way they could connect?

- Topology-invariance:
  - Make a pattern. Can "add" topo-invariant things to it with a match.
  - 
  - Same as our topological bit, BUT REVERSE the simplification when matching?
  - RED edges mostly disappear or no?
  - IF we deal with a single part of a face, we can "generalize" the rest of the face?

- WAIT: Am I being too ambitious with topo-invariant patterns? What about patterns that don't have that level of generality?

- "Pattern" SOLVER!!! (inspect numbers, identify possible pattern locations that can individually get checked)
  - Each pattern needs to specify the required topology/structure for the area (what is important)
  - FOR EACH topology, many cases we DO NOT CARE how many other edges a vertex supports, as long as they are red.
  - RED EDGES essentially CHANGES the topology
    - Make rules that can be applied to ANY cases 
  - Going off the side of the board is "all x" - Use a way of pattern matching those
- Pattern (GridPattern?) -- less general than "solver"
  - check( spot: Spot, reversed: bool ): bool - whether it matches and can be applied
    - apply( spot: Spot, reversed: bool ): Action[] - what to do
    - !!! data for the ability to explain the pattern to the user (in a specific case too?)
    - bounds: ???PatternBounds? <---- maybe don't have this?
    - NOTE: can be "extended" patterns, e.g. like extended-2-spike (doesn't need to be fixed and have bounds?)
      - e.g. while vertexstate handles spike 3-2-2-3, we can have a pattern that handles this with just EdgeState
    - NOTE: can be "mechanical/recorded" patterns too (e.g. have a database of these)
    - NOTE: PATTERNS CAN APPLY ACROSS TOPOLOGIES IN MANY CASES
- Pattern interaction with all state types, edge/color/sector/vertex/face-state