
# Regions

- Ok.... to detect the non-trivial regions...
  - Face color first... we need to get things FROM that.
    - ACTUALLY NO!!! We can detect the "simple loop" types now
- 
- !!! When we turn edges from white to red/black, we REFINE existing regions, and CREATE new ones
  - NOT HORRIBLE for processing additional things
- We COULD scan regions for ALL possible simple paths (and check if they are valid) for simple cases (with not a ton of branching)
- PROVE things, this is my... intuition. 
- Region (strict/exclusive): 
  - Two vertices (distinct and unordered) -- can relax "distinct", degenerate region with duplicated vertex and no edges works 
  - Edge set
  - "There will be one (and only one) strongly-connecting chain between the vertices through edges in the edge set"
  - "The final opposite part of the loop goes through none of the edge set"
  - (it will not contain the entire loop)
- Net (without the "strict" requirement):
  - Two vertices (distinct and unordered)
  - Edge set
  - "There will be one (and only one) strongly-connecting chain between the vertices through edges in the edge set"
  - "NO guarantees about any opposites/duals"
  - (it will not contain the entire loop)
- Completed region: if its edge set is only black (no white)
- Final edges: set of edges in the edge set that connect to one of the vertices
- (~) Dual (!): Same vertices but inverted edges (all other white/black edges not included) is a region
- Single final edge (for a vertex) => it must be black
  - Removing that edge (and moving the vertex) creates a valid region (if it wasn't the only edge? - see degenerate region) 
- Subregion: has a subset of edges
  - Means another constriction along the loop, and you know which side has a connection
  - THE INVERSE (intersected with the larger region) gives the connection space!!!
    - It can connect in 2 different ways (for region AZ, subregion BC) 
- Disjoint: no edges in common (AB and ~AB are disjoint)
- Oriented: If a region AZ has a subregion BC, it is oriented if we know it will connect A-B and C-Z instead of A-C and B-Z
- Ordering: Ordered list of disjoint non-degenerate subregions, such that subregion vertices match up (e.g. subregions AB, BC, CD -- for a region AD)
  - In the solved configuration, each subregion will be oriented and ordered
- Constriction: region + dual region
  - Implies an ordering between the two regions 
- 
- A region(constriction) is also... a partition of the set of all of the white/black edges (into two sets)
  - 
- Region solver goal:
  - Color edges for output? (... how)
  - Rule out "early" closings
  - Bridges in a region are black (duals!)
  - Subregions can net/bridge their way to the larger region
    - Can mark as oriented if "one way" of connecting doesn't work. Then then bridges in nets can be black. 
  - Ordererd regions can net/bridge their way together
  - FAIL if region vertices aren't connected by edge set
  - Region with "disconnected component" from main vertices in edge set is RED
  - Region with "component only connected through one vertex - cut vertex" is RED
- Region solver inputs:
  - Edges (white/black) - black makes their own regions.
  - Jordan lines/curves (to determine if we have constrictions)
    - Possible that it has no black edges (e.g. jordan curve with vertex construction) 
  - Face (option) state determines if we have a strong connection between two vertices on a face (e.g. spike-2, hex-spiked-3) 
- 
- Two regions AB and AB* (same vertices)
  - Either represent the same or different part of the loop
  - If (AB !== AB*) AND (AB !== ~AB*): -- (different partitions)
    - Then there are "four" created potential regions, either we have:
      - (AB^AB*) and (~AB^~AB*) OR
      - (AB^~AB*) and (~AB^AB*)
  - Fail condition if (AB intersect AB*) and (AB intersect ~AB*) are empty
- Two disjoint regions AB and BC (that share a vertex B) can be combined into AC (edge set union)
  - Implies the dual ~AC
- Intersections of two regions AB and AB* (same vertices) is defined IF the intersection of final edges is non-empty
- Subtraction: Region AZ and subregion AB: dual ~AB (intersected with AZ) implies BZ with edge sets (AZ - AB).
- Region AZ and subregion BC: dual ~BC (intersected with AZ) implies either:
  - Net AB (edge set (AZ-BC)) and net CZ (edge set (AZ-BC))   OR
  - Net AC (edge set (AZ-BC)) and net BZ (edge set (AZ-BC))
- 
- Consider for vertices A-B-C-D-E-F-G-H
  - region AE and region CH -- they overlap --- how do we "SPLIT UP" or "COMBINE" these?
  - a constriction might be... in the middle!
  - !!!!!!!!!!!
  - !!!!!!!!!!!
  - We can create the "smallest" and "biggest" (ordered?) regions possible in each case!
    - How does this work for constrictions?
    - Sounds like we'll create 
    - OMG OMG OMG
    - So we manage to create the set of "smallest" regions (since the duals will thus be the "biggest")... 
      - "Standard" operations would make one region smaller while its dual would be made bigger 
    - We essentially have a "fixed set" of white/black edges for any collection
      - So for a region's edge set, we can either specify either a set of edges, or a COMPLEMENT of a set of edges 
- 
- Bridge edges:
  - Specifies ordering and orientation(!), cuts it in two effectively 
- 
- If we can order two regions, we could try netting to between them?
- How can we order things with region/subregions?
  - 
- How would we COLOR region visually?
  - 
- NOTE: can assume the presence of a subregion (for all non-black face values), we can check their net too
  - This applies if all of their white edges are in our region (and at least one of those will be black, but isn't yet)
  - i.e. "does one of those edges need to be black"
  - THEN can take the intersection of nets... no?
- 
- If a region AZ has a subregion AB, then ... clearly there exists a subregion BZ, but can we deduce anything about its edges?
  - No guarantee on edges? (unless it is completed)
- 
- (!!) If a region has ANY edges that are "graph bridges" (bridges) between the two (region) vertices, then it is black.
  - This is a generalization of the "single final edge (for a vertex)" rule 
- 
- Disjoint subregions will eventually be ordered
  - 
- Any edges in a region that are "removed from consideration" will be red
- Just like bridge edges, cut-vertex to ... another component will mean that component is red (TODO)
- BRIDGE EDGE SPECIFIES ORIENTATION AND ORDERING
  - 
- Any Jordan "cut" (that has two Jordan paths/loops) that crosses precisely 2 edges/vertices (or equivalent) creates a pair of regions
  - A "constriction" 
- 
- How does "joining" regions work?
  - (AB) + (BC) = (AC) iff A != C  <--- but best for edge sets if we keep these separated. how can we decompose regions?
  - (AB) + (BC) = full loop (not a region)
- 
- Degenerate region: does a single vertex with no edges count?
- Unit region: two vertices with a single edge (it is black)
- Spike2 region: two vertices across a 2
  - 
- HEY we should have a separate option for "auto-solve things that join chains" (since that might give things away?)
- Vertex pair:
  - Abstraction does NOT require they are endpoints
  - They are not ordered
- Edge sets:
  - Can exclude red edges
- Two regions with the same vertex pair:
  - Final state will be two completed regions
  - ... does intersection work?