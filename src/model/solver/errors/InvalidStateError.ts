export class InvalidStateError extends Error {
  // TODO: the ability to "highlight" the invalid state (action?)
  public constructor(message: string) {
    super(message);
  }
}
