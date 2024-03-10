
# Scan / Vision

- Use the locations of text-detected numbers to "vote" on what contours to use as a container
  - Start at root. Check each child for how many it contains. Drill down until we have no child with more than the threshold.
  - This approach works well for "completed" or "invalid" puzzles (both of which we'll want to scan)
- Unit tests
  - Test with SAT solver 
  - !!! Make us compatible with Puppeteer/Playwright, so we can batch-handle scanning/solving (for unit tests)
- Test with Android, and handle dashed line approach
- Detect on paper - perspective correction
  - See https://pyimagesearch.com/2020/08/10/opencv-sudoku-solver-and-ocr/ for helpful notes
- Could use size of numbers to inform "scale" of things (we don't detect dots well if they are too large)
- Could use FFT for finding scale/grid
- !!! Get Scenery working with embedding DOM components, like the file input
- Note "draw interior of large region in background color" to filter out
