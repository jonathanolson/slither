
Features:

- Shapes
  - Get topological handling for any shape, but specialize for 4x4 grid
  - Hex!
  - NO sphere, easier for the graphics/model to not make that generalization right now

- UI
  - Phone interface works nicely (iOS/Android) 
  - Keyboard is first-class? (Could be fast for input on a computer)
  - Display
    - Vertex coloring (e.g. spikes/incident, but also "all of the cases")
    - Loop (around square parity), but also maybe a "loop tool" where if you draw it, it will count automatically.
    - Area coloring (with specific known-inside or known-outside coloring, but also color other multiple-square areas)
    - Line coloring (different color for each connected line), helps visualizing endpoints
      - Include culori(!) 
    - Lines go flush to (and include) the vertex dots
      - If RED on all 4 of a vertex, perhaps we can remove vertex dot?
    - Numbers go "disabled" appearance once they are satisfied (if over-satisfied, red?)
    - Optional BLACK: solid line WHITE: dashed line, RED: no line
    - Optional: themes(!) control how things are displayed. Not too hard to do. Neon on black is neat
      - For other shapes, displaying the "potential" line looks really helpful
      - Potentially use localStorage for themes?
    - Optional: red x's look ... not great on triangular potentially?
    - SLICK animation(!)
      - Can we make it more intuitive by having the line animate?
    - Themes INCLUDE the animation(!)
      - Show animated "previews/thumbnails" in theme picker
    - Possibly multiple views (one coloring, one vertex?)
  - Interaction
    - Programmatically create the mouse/touch areas for the lines (noting vertex clicks for interactivity or dead zone)
      - Use offset curves or "what is closest"? 
    - Allow finger drag to put down multiple lines? (can we reverse back through a line to undo parts?) 
    - Vertex interaction (note incident or spike? - or any of possible vertex states?) 
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
  - OMG OMG solve that "crossing a spiked two" maintains the chain/line
    - SO COLOR IT in the UI! What other cases can we detect that will maintain the link?
  - Refer to things with Jordan curves
  - Do have a solver have pseudo-edges and pseudo-faces (marked "outside") around the border?

- Puzzle generation
  - How to... rate? (Make it free obviously) - Give it numeric difficulties instead of just "easy/medium/hard" 

- Generate/show rules
  - How can we detect/visualize highlander rules?
  - Show rules with a nice before/after(!) - have the ability to generate that into a Scenery node. Use Display in write-up
  - For many rules, showing the "candiate test-add", "consequences", "thus we can assume this" as the three stages is nice.

- Read
  - https://link.springer.com/chapter/10.1007/978-3-030-34339-2_8 
  - check r/slitherlink for more cases that were explained well!