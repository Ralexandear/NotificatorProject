export class FatalError extends Error {
  constructor(message: string) {
    super('FATAL ' + message);
  }
}