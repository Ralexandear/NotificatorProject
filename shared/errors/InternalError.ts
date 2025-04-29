export class InternalError extends Error {
  constructor(message: string) {
    super('INTERNAL ERROR' + message);
  }
}