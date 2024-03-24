
# Patterns

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