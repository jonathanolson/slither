
The code uses a few concepts:

- Vertex: where edges join
- Edge: the place where a line may or may not exist
- Face: a simple polygon (loop of edges)
- Half Edge: a directed edge (from one vertex to another)
- Structure: vertices/edges/faces and how they connect
- Board: a group of vertices/edges/faces with a structure (doesn't change during solving)
- Data: mutable info about the structure (face value, edge state, vertex state, coloring, etc.)
  - EdgeState:
    - Black: There will be a line here in the solved version
    - Red: There will be NO line here in the solved version
    - White: We don't know yet
- Puzzle = board + state
- Delta = action + previous state
