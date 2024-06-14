export class MaximumSolverIterationsError extends Error {
  public constructor() {
    super('Too many iterations!');
  }
}
