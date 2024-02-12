
Features:

- UI
  - Display
    - Vertex coloring (e.g. spikes/incident, but also "all of the cases")
    - Loop (around square parity), but also maybe a "loop tool" where if you draw it, it will count automatically.
    - Area coloring (with specific known-inside or known-outside coloring, but also color other multiple-square areas)
    - Line coloring (different color for each connected line), helps visualizing endpoints
  - Interaction 
    - Chess-like history, with branching?
    - Mistake detection (but only after you've "stabilized"?)
    - Auto-solver for various sets of "solvers" (basic level is auto-X or auto-line)
  - Accessibility
    - Allow selecting a square. Hear its number/sides, manipulate its sides ("space blank, lines on top and left, blank on bottom, x on right") 

- Solving
  - Binary satisfiability rules (a more general "either or") 
  - Highlander rules (how to we detect more?)
  - Note that if we have a closed loop, path crossings are even, so any adjustment to the loop should also have an even delta
  - Colorings, and the advanced "how they meet" rules

- Generate/show rules
  - How can we detect/visualize highlander rules? 
