export class ValidationError extends Error {
  constructor(message: string) {
    super('VALIDATION ERROR: ' + message);
  }
}