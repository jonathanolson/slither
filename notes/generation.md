
# Board generation

# Difficulty

- How to measure difficulty? Certain solvers could report out what they needed to get (but what if it requires a chain of colors?)
- Explicitly list out the "rules" for a given difficulty level in the future?

# Importance of Technique

- Look at what combinations of techniques will solve (completely or %) a random sampling of puzzles.
  - See which ones are more powerful, and good to learn 

# Puzzle generation
 
- Generation: how do we get the CONSISTENCY of difficulty?
  - -- forward generation, right?
  - greedy checks for face minimization? (check all faces, and for each removed, CHECK ALL AGAIN to see which face removal still allows the most removals)
    - That... sounds slow.
- Consider external puzzle generation / Investigate patterns
  - slinker, GPL 3: https://github.com/timhutton/slinker
  - Check license on https://www.themissingdocs.net/bridge/LoopDeLoopBridge.html
  - Check license on https://www.kakuro-online.com/slitherlink/
  - Check license on https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/loopy.html
- Generation:
  - DIFFICULTY!!!!!!! STOP GENERATING THINGS THAT ARE SO HARD
    - Use numeric difficulty instead of easy/medium/hard
    - Difficulty also relates to "solving style", maybe ratings for different approaches?
      - e.g. "easier with face coloring" vs "easier with backtracking" or "easier with vertex state"
  - Faster "face minimization": 
    - start by removing a good number at once. have a heuristic where this eventually goes down to removing 1 at a time
    - any time a removal doesn't work, apply a multiplier to our "fresh from next time" amount to remove, and ... split the removal amount in half?
  - Faster "filling" method, basically just set up something that creates windy patterns quickly?
    - Sprout off area-filling "winding" attempts, where it keeps walking
      - Repeatedly do this until we have a good amount of "fill" - 50%? also windiness?
      - Start in "less filled" regions
      - If we have a region without transitions, apply fixes
      - Ensure we have approximately half of the boundary faces filled
  - Try to generate puzzles which have patterns that I should learn
  - Generate different "themes" of puzzles (i.e. we solve uniqueness with different techniques)
    - Find puzzles that need technique A that can't be solved with technique B
- For generation that emphasizes one target rule/solver (rule can be composite) (and has a base rules/solver set)
  - Check for each valued face:
    - When it is removed, what is the count change for how many times our solver HAS to use the target rule?
  - If the highest count change is non-negative, pick one of the faces with the highest value
  - Otherwise if highest count change is negative, STOP GENERATION
- Difficulty:
  - Can we ... forward-generate based on rules (checking to see if there is at least one solution with how we add numbers?)
    - Search for patterns where we can enable rules?
  - How else can we best "really overdo" a particular rule?