
# Solvers

## New

- Have individual solver factories, that take in a config for each solver - specify the type of config (like tilings).
  - Specify a static order disabled/enabled+config for each solver (both for auto-solver AND puzzle generation solver)

- WHY can't we deduce the "don't spike a 3" from a 2 with a blank edge?
  - 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
  - OH, ... we are setting the sector nicely. Vertex state looks correct too
    - dynamic sector solver? why is face state failing here?
      - Yes, but SOMETHING IS FAILING FIRST HERE

- What we are "missing" that I can solve:
  - Trivial 3-loop patterns? (and other loops) --- but also.... FULL REGIONS
  - Highlander patterns

- Multi-face (**) adjacent faces
  - [defer] - this sounds good, BUT we don't need it for current purposes yet (or ever?) 
  - Cases where we can "take" a shared edge and DO things with both ends, e.g.:
    - Classic "take edge AND both adjacent edges" - solves the 2-3 in corner case
    - take + reject both, or take + split permutations also possibilities
  - HEY!!! Some topologies might have a section of shared edges between faces. Figure out this generalization

- 1-level simple backtrack (see if we get fast failures or ... MAINLY LOOPS)
  - MY BASIC BIT is only-BLACK edges during attempts? 
  - Just using the simple "forced" bits? (maybe face values optionally?)
  - Consider "advanced" coalescing of on/off state?
  - HEY HEY - how to detect if we CUT OFF a region?
  - (test and coalesce sectors/vertex state/ face state, colors, etc.)

- Dual-Face Binary Combinations
  - Pair of duals, have two ways to combine.
    - Do either shut off sections (cause future bad loops) or cause loops directly?
    - This looks like how we handle the "Jordan curve detection" bit
  - Amazing choke detection!!!
  - How does it handle vertex constrictions? (nicely? - have it based on coloring and possible escapes)
    - THINK on how to handle "corners"

- Binary sets (Edge or Face):
  - [important] --- WHAT IS THE REAL DIFFERENCE with this and how we would handle simple backtracking? Seems similar 
  - WE CAN VISUALIZE THESE with coloring!!!
  - Edge case:
    - for each edge included, it has a primary and secondary state (e.g. we can separate into "on" and "off")
  - Face case:
    - for each face included, it is either... hmmm. this could be POWERFUL!
    - POWERFUL!!!!
  - Solvers:
    - Binary Sets constrain FaceState
  - could detect from backtrack perhaps?

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