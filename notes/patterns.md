
# Patterns

Have consistent geometry for now (for storing/representing rules) - WILL have the ability to generalize later

!!! If we're using the SAT solver, we can continually constrain it to say "don't give us realizations we already know"?
  Wait is this consistent?

- !! First we need efficient serialization of state, so we can nicely serialize rules, no?

- We have a set of potential booleans that represent "is it possible in a solution"
  - Edge:
    - Black in solution?
    - Red in solution?
  - Face Color pair:
    - Same in solution?
    - Opposite in solution?
  - Sector:
    - Has 0 in solution?
    - Has 1 in solution?
    - Has 2 in solution?
  - Vertex State:
    - Boolean for each possibility
  - Face State:
    - Boolean for each possibility

- Inputs are the board (primary and expanded), and the booleans where are marked as "IMPOSSIBLE" (also face values?)
- Explicitly model symmetries when constructing patterns?

- "Registration Vertex"
  - If we have face values, it is on one of the faces
  - Essentially, try to make sure it "exists" in a final puzzle where we are using it
- OR
- "Match faces???"
- WAIT WAIT ---- we can swap planarity of PART of the pattern, and it still applies!
  - Can we go for an inefficient "match" where pattern vertices/edges/faces might go to "nothing"?
    - Just think about "vertex" assignments hmmm
    - LOOK UP graph pattern matching?

- Assume patterns/rules only applied if they don't include the entire solution (can't be the loop, loops prevented)

- Each boolean will be on a state:
  - NOT_FOUND (initial state)
  - POSSIBLE
  - IMPOSSIBLE

- Running through all SAT solutions is possible, but can do better
  - Keep a running list of loops (that will always be negated)
  - FIRST find a no-added-constraint no-loop solution
    - IF none, then the pattern won't occur in a valid puzzle
  - If a no-loop solution is found, mark all of the POSSIBLE things immediately.
  - After we have one solution, we can:
    - Find a NOT_FOUND boolean, restart with a constraint that it must be possible, and see if we can find a solution:
      - If we can't, mark it IMPOSSIBLE
      - If we can, do the normal "mark POSSIBLE" things and start again with another NOT_FOUND BOOLEAN
    - NOTE: Might be more efficient to run through a fixed (N=10) number of solutions, to get more possible bits?

- Keep patterns on detecting "invalidity"?

- Highlander?
  - DO the exit points "connect" in the same way?


Symmetries:
- Patterns have symmetries (and more than... reflection).
- Handle symmetries (canonicalize?) - ask GPT?

TODO
- Hand-design example topo-invariant patterns (especially ones with fun symmetries?)

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