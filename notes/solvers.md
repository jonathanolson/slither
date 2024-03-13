
# Solvers

## New

- FaceState (proper)
  - (rename current FaceState to FaceValue)
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
- Full Region (!) seems powerful too, particularly the ordering bits?
- Highlander:
  - ...rules (how to we detect more?)
- Solver that detects "single vertex not-biconnected" cases and prunes

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
  - Jordan curve around face (possibilities and rules)
  - SAT formats? CNF for edges?