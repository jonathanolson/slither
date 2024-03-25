
# Overall Goal

My goal is to create an interactive tool/game for the puzzle Slitherlink. I want to present existing and novel solving 
techniques in a clear way, providing the user interface to mark additional solving data and easily visualize both the
puzzle and additional solving data. I'd also like to create a solving interface that is clean, optimized, and fully
featured (as I am exploring additional ways of visualizing things).

# Slitherlink Puzzles

Slitherlink is a puzzle game where you are given a planar graph (with vertices, edges, and faces). 
Each face may optionally have a "face value" (a non-negative integer) associated with that face.
A solution to a puzzle is a subset of the edges that satisfies the following conditions:

1. All of the edges form a single simple closed loop (a cycle).
2. Each vertex has either 0 or 2 edges incident to it (no self-intersection in the loop)
3. For each face with a face value of N, the loop contains exactly N edges that are incident to that face.

Additionally, for "valid" puzzles, we will make the additional constraint:

4. There is only one solution to a valid puzzle.

# Solving Data

We have certain types of data we associate with parts of the puzzle during solving, both for the user interface and for
the solving algorithms. At a high level, each type of data describes restrictions on what edges can be in the solution.
(NOTE: there will only be one solution for a puzzle, this is so users can work through the logic of solving).

## Edge State

Edges can be in one of three states:

- White: We don't know if the edge is in the solution or not.
- Black: The edge is in the solution.
- Red: The edge is not in the solution.

At the start of solving, each edge will be in the white state.

## Face Color

It is helpful to note that a solution will divide the faces into an "inside" and "outside". We can associate "colors"
with faces, both to note "inside"/"outside", but also to denote "these faces have the same color", and "these faces
have opposite colors" (when solved, one color will be the inside, and the other will be the outside).

Thus at the start, we have:

1. An "outside" face color
2. An "inside" face color
3. A face color associated with each face.

When two faces will have the "same" face color in the solution, we'll combine the face colors so both faces will point
to the same color. When two faces will have the "opposite" face color in the solution, we'll record them as opposite colors.

This means that at any point, we have a set of colors, and a list of pairs of face colors that are opposite colors
(if A is opposite B, and B is opposite C, then A and C are the same color, so we can reduce things).

## Simple Regions

A "simple region" is an ordered list of edges that either are a full solution (a loop), or are part of the solution 
(unclosed, not a loop). They are used internally, so that it is easy to detect cases where setting an edge to black
would create a premature (invalid) loop (one that does not satisfy all of the face values in the puzzle).

## Sector State

A "sector" is a pair of edges that share a vertex and a face (so if you enumerate edges in order around a vertex, 
they are adjacent). We can associate state for each sector:

1. Whether the sector can possibly have 0 edges in the solution.
2. Whether the sector can possibly have 1 edge in the solution.
3. Whether the sector can possibly have 2 edges in the solution.

## Vertex State

We can associate state for each vertex, that contains a boolean for each legal configuration of edge states around that
vertex (true if it can be in the solution, false if it isn't in the solution). It can either have 0 edges in the 
solution, or 2 edges. Thus we'll store a boolean for 0 edges, and then one boolean for each pair of edges incident to 
the vertex.

## Face State

We can associate state for each face, that contains a boolean for each legal configuration of edge states around that
face (true if it can be in the solution, false if it isn't in the solution). Some faces have no face value (thus we will 
store a boolean for each possible combination of edges), while some faces have a face value (thus we'll store a boolean
only for each valid combination of those N edges).

# Boards

A "board" is a set of vertices, edges, and faces, along with the structure of how they connect. The board does not change
during solving, and is used to create the initial state of the puzzle.

For display and user interaction, each vertex has an associated 2d view position. Additionally, we store adjacency/incidence
information for each vertex, edge, and face, and associate directed half-edges (from a start to an end vertex) and their
associate single face.

For valid puzzles, the board will form one connected component. Currently, we handle the "exterior" face by marking it
as null (it is not a face in the graph, but is used to represent the "outside" of the puzzle). We may change that in the
future.

# Tilings

The classic form of Slitherlink uses a square tiling (where each face is a square). However, this is generalized, and
any planar tiling can be used to generate a puzzle. Hexagonal or Cairo Pentagonal tilings are common, however I can
also generate tilings like Rhombitrihexagonal that include a mix of face and vertex orders.

The boards generated are not infinite, they have "boundary" edges that do not have faces on the other side.

# Solving with Patterns

Most people will quickly learn certain patterns for a specific puzzle tiling. These patterns can be used to quickly
solve a puzzle, and are needed to provide hints and to estimate difficulty of puzzles (to provide a good user experience).

Patterns (or "pattern rules") on a specific tiling are defined on a small board (a subset of the full board), and
describe the input solving data (constraints), and the output solving data (additional solving data that can be deduced).

Example 1: In a square tiling, a face with a value 3 with a single red edge must have the other 3 edges black.
Example 2: In a square tiling, if a vertex has 2 black edges, the other 2 edges must be red.
Example 3: In a square tiling, if there is a 3-face with a black edge that only shares one vertex with the face, all other edges with that vertex that are NOT in the face must be red.

Note that for patterns, a red edge in a pattern can match with a red edge in an actual puzzle, OR with the absence of
an edge (e.g. on or outside the boundary of the puzzle).

Additionally, when matching patterns, we will want to consider symmetries of the tiling.

There is also the concept of topology-independent patterns, where the pattern is defined on a reduced graph (e.g. where
red edges are removed). This is valuable in general, but for users we will want to present cases that look visually
like the pattern they are solving (rather than a more abstract form).
