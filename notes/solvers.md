
# Solvers

## New

- FaceState (proper)   ---- HEY, better name?
  - Enumerate options
  - NOTE: Sectors are NOT GOOD ENOUGH. imagine sector black-red and red-black, we have the 3-1 side case, or rhombille 3-1 / 2-1.
  - Constrain by:
    - face value (if any)
    - 4 red/black permutations for around each vertex (from edges + vertex state OR sectors), e.g. red-red, red-black, black-red, black-black
    - face colors
    - NO FULL LOOP unless it meets the stringent loop conditions
    - Binary sets (in the future!!!)
  - Storage:
    - If there is a face value, probably can only create booleans for valid combinations (e.g. 4 cases for 3-square)
      - Store the face value in serialization if we do this
    - Can lazily instantiate (e.g. 'any' is an object with no booleans)
  - Solvers (using):
    - Edges / Sectors / VertexState
    - Face Colors
    - Multi-face (**) adjacent faces
      - Cases where we can "take" a shared edge and DO things with both ends, e.g.:
        - Classic "take edge AND both adjacent edges" - solves the 2-3 in corner case
        - take + reject both, or take + split permutations also possibilities
  - Parity... is naturally handled
  - [deprecated because this handles, right?], Dynamic face value + edges around it => sectors??? (do my solvers already do this?)
  - [deprecated for same reason, right?] Face+Vertex+Color => updates
    - Type A: Use face value only, and update vertex state (or set edges?) --- YES to iterating through all face states?
    - Type B: Any face (null?), and ensure EVEN number of edges around it (and escape conditions)
      - [this will force even enter/exit, right?] Solver for "keep even enter/exits around the vertices of a face" - or really any region? (like that advanced reddit post)
- Binary sets:
  - WE CAN VISUALIZE THESE with coloring!!!
  - Edge case:
    - for each edge included, it has a primary and secondary state (e.g. we can separate into "on" and "off")
  - Face case:
    - for each face included, it is either... hmmm. this could be POWERFUL!
- Full Region (!) seems powerful too, particularly the ordering bits?
  - Perhaps start across "spiked 2" type things? hmmm
  - HOW DO WE COLOR THESE IN THE UI?
- Highlander:
  - ...rules (how to we detect more?)
- Region detection with Jordan curve detection/constraints:
  - To regions!!!!!
    - HOW do we handle going "through" vertices? We detect VERTICES, remember
  - To binary sets?
  - Refer to things with Jordan curves
    - Different from "enclosing curve"? - how to handle going "corner through vertices" for the "needs 2+" in
      - Can JUST use FaceValue (basic), but also EdgeState (normal) or VertexState (advanced!) or coloring (yes!)
        - For "enclosing", we need to make sure there is content inside and outside. Numbers or edges mean there will be edges.
          - Numbers fully outside, or... hmm 
    - "How to solve the Jordan curve walked a turn around white. Only one can get out through vertices" - think of curves that turn at verties.
- Jordan curve PROPER:
  - DO like our FaceStateData, BUT do it along an arbitrary curve
  - HOW do we handle going "through" vertices?
- Solver that detects "single vertex not-biconnected" cases and prunes
- Note that if we have a closed loop, path crossings are even, so any adjustment to the loop should also have an even delta
- Patterns [this is mostly old, refresh it]:
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
- NOTE: determine if there is "internal" things in any "almost loop"
  - Detect case where there is a loop that is almost closed, except it has a single edge OR corner (so we can't enter it)
  - OMG OMG look up how we can interact with vertex/edge/face/etc. state with patterns... could discover cool coloring patterns(!)

  - Jordan curve "corners" that only permit one through (and a closed area that needs 2+)
  - KwonTomLoop threads for ideas:
    - Main patterns: https://kwontomloop.com/forum.php?a=topic&topic_id=100 
    - Especially this one: https://kwontomloop.com/forum.php?a=topic&topic_id=404
    - https://kwontomloop.com/forum.php?a=topic&topic_id=464
    - https://kwontomloop.com/forum.php?a=topic&topic_id=94
    - https://kwontomloop.com/forum.php?a=topic&topic_id=424
    - https://kwontomloop.com/forum.php?a=topic&topic_id=404
    - https://kwontomloop.com/forum.php?a=topic&topic_id=419
    - https://kwontomloop.com/forum.php?a=topic&topic_id=400
    - https://kwontomloop.com/forum.php?a=topic&topic_id=358
    - https://kwontomloop.com/forum.php?a=topic&topic_id=308


## Changes

- SimpleLoopSolver --- red edges can create simple loops, which isn't detected by the "dirty" bit.
  - Perhaps have an "exhaustive" action, that re-checks for a ton of stuff?
    - WAIT, can't we trace a red edge to see if it constrained something?
  - FORCED checks should look at Vertex state(!) --- like SimpleLoopSolver.
    - Eventually also use BINARY sets to check for region handling

## General

- A lot of ... solvers aren't clearing their "dirty" state (essentially fully completing the contract of 'do not return the same result twice in a row')
  - We'll want this in order to list out all of the potential hints(!)
- Are we able to SAT-solve some solvers, to see if there are any (in the limited scope) missed rules?
- Swap solver order for fuzzing (we want to be robust to that)
  - Then user could potentially reorder solvers, disable whatever, etc. (to handle generation and hints)
- In solver fuzzer --- if it fails validation... CATCH IT, annotate it, update the view, THEN RE-CAUSE THE ERROR
- General:
  - Can we assume uniqueness for the solver specifically? Adjusts techniques we can use
  - If we run through a solver WITHOUT applying changes, we get a list of what it can figure out without going deeper.
- [from elsehwere, cleanup] Data:
  - SimplifiedVertexState: note if it is incident/spiked --- how does this extend to other grid types (don't try?)?
  - VertexState: (can pretend to be SimplifiedVertexState)
    - Allow empty or every combination of 2 edges
  - SAT formats? CNF for edges?
  - Face values are fairly constant, can inspect up front to determine "WHERE" we can apply certain patterns.
  - "Finder" can find patterns, or use patterns/solvers/combination to solve everything (or to a point).
    - e.g. anything ending in backtrack will "work"

## Deprecated

- [SAT solver async, others sync but could add iterateAsync] Fundamentally async/await? (e.g. delayed auto-solver in general?) - Or should we synchronous it for simple ones?
  - async/await backtracker, especially between solver bits.
  - NOT IN GENERAL