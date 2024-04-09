
# Patterns

- TODO
  - 
  - Face Color Annoyance:
    - DO SMART FACE COLOR DUAL features? (not... named?)
      - Storing duals means:
        - (1) FASTER matching (since we don't do O(n^2) checks for large regions)
        - (2) Can provide the exhaustive O(n^2) for computing all solutions and analyzing
        - (3) our "output" state change can be a "list of the face color actions needed to be done"
    - Our booleans are VERY over-specified. Are dual-color with faces representations possible?
      - (though this is... so simple)
      - HEY this causes our logic-solver to get a LOT of complicated rules that it probably doesn't need(!), O(n^2)
        - O(n^2)!!!!!!!!!!!!! 
      - Could just be consistent and compute duals, and:
        - (a) fully specify all color relations based on the relationships (fill them out)
        - (b) minimize them when we actually... scan for patterns?
  - 
  - "Constraints" vs "Features"
    - Constraints: We add constraints at the start of solving, and they don't change
      - (can use Feature interface for adding solving constraints) 
      - Highlander
      - [defer] Nonzero-crossing (NEW: 2+ crossing) - both could be used in the future
      - [defer] NEW: certain exit vertices NEED to connect together? Or need NOT to?
      - Vertex 0-or-2 rules
      - Face values (including blank)
    - Features:
      - .. All the other things we are used to
  - 
  - Features
    - Name them (based on their indices), e.g.
      - b0 (black edge 0)
      - f0,1 or F0,1 (opposite or same face colors, for two face indices?)
      - etc.
      - Thus we can quickly "rename" them with an embedding and see if it exists in a state-feature collection.
    - State in:
      - "input pattern" (possibly a list of "false" features only)
      - "output pattern" (possibly a list of "false" features in addition to the input false features)
      - "face pattern board" (static? - or can be dynamic for quick solving with patterns) - note which actual states to set in a TState!
  - 
  - Feature sets (enumeration)
    - Face values (optionally include blank as possibility)
    - Edges (include red exit, but NOT black exit)
    - Face Color (binary same/opposite)
    - Sector simplified (only-one/not-one/not-zero/not-two)
    - TODO: vertex/face state, nonzero-crossing
  - Features might use more than one "state" to check (nonzero-crossing checking multiple edges)
  - Features are either "composable" or not.
    - If "composable", can map a feature boolean from a pattern to a feature boolean in a board.
  - 
  - Highlander:
    - STORE WHETHER A RULE/PATTERN IS HIGHLANDER(!)
    - Q: Do we need to iterate through all solutions for highlander?
      - Can "hash" highlander solutions by:
        - (a) string of booleans (one per indeterminate edge)
        - (b) lexicographically ordered "exit vertex (or edge) index pairs that are connected", e.g. 0-5, 2-3, etc. (exit vertex 0 connects to exit vertex 5)
    - Edges that are adjacent to an exit-face OR non-valued (non-blank) face are "indeterminate" edges (exit edges are indeterminate)
    - Two solutions with the same values on indeterminate edges AND same exit connections are both excluded in highlander rules
    - NOTE(!) Highlander rules might NOT require blank faces (especially once sectors and colors are in play)
      - (we will have highlander color rules)
    - How to mark/display these? question marks on unspecified faces?
  - 
  - Storage/Serialization of patternboards / patterns / rules
    - PatternBoard
      - Naming prefixes? square, "4x4" for "there are four 4-order faces"? not sure how we would disambiguate
        - Actually, fixed strings for the "edge/vertex" ones, and... STORE the face indices in a string for the face ones?
    - We want to consolidate references to PatternBoards, so that the embeddings computation is "spread across all the rules"
    - Wait, CAN WE skip storing the mappings, since we can just find embeddings in tilings and report those out?
      - But... we should determine isomorphic pattern boards... take in strings and cache isomorphic ones?
        - Would we need to "remap" patterns/rules?
  - 
  - PatternEmbeddingNode - PatternBoard in PatternBoard (without state at first)
  - 
  - Pattern = pattern-board + pattern-state (features?)
    - Face values are part of the pattern/features, no? 
    - How to think of highlander?
  - 
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

- Assume patterns/rules only applied if they don't include the entire solution (can't be the loop, loops prevented)

[API needs to be compatible with boards, maybe with adapter]
  - Can we put an 'index' on everything in a board?

- Each boolean will be on a state:
  - NOT_FOUND (initial state)
  - POSSIBLE
  - IMPOSSIBLE

- Automorphisms?
- [defer] "Invalidity" patterns?

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

- Exit edge decisions:
  - Ignore "black" exit edges (no feature for that both for input and output).
  - No sectors for exit edges (no feature for that both for input and output).

- Vertex rule count
  - Order 6 typical, but order 12 for Triakis Triangular / Bisected Hexagonal... 8 for Tetrakis Square

- PatternBoard:
  - [defer] Generation: 
    - [defer] Prevent combinations where... a face isn't included but all of its neighbors are? (or perhaps... if all its vertices are included, include it?) THINK
  - [defer] Canonicalize:
    - [defer] Find the vertex permutation that gives us the lexicographically smallest order of states.
    - [defer] Then we can use equality to check isomorphism (and we can store this in a hash table)

- Flexible BUT NOT TOPO-invariant (no red edge removal, but we generate face combinations):
  - FaceRule
    - FaceRule application to:
      - A puzzle (with a board)
      - A FaceRule state(!) so we can directly see what rules "dominate" others, and construct a minimal set of rules.
        - OR... we just have things create a matching puzzle (board+state), and then apply to that board?
          - Padding is complicated.... nah
        - Yeah, just find subgraph isomorphisms and check?
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

https://github.com/timhutton/slinker ---> has the "solving rules"
Review https://github.com/timhutton/slinker/blob/main/src/SlinkerGrid.cpp !!!!

- Inputs are the board (primary and expanded), and the booleans where are marked as "IMPOSSIBLE" (also face values?)
- Explicitly model symmetries when constructing patterns?

[this is mostly old, refresh it]:

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
