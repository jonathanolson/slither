export class InterruptedError extends Error {
  public constructor() {
    super( 'Interrupted' );
  }
}