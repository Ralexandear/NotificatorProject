import { Configuration } from "../Configuration";

export class LocalDate extends Date {
  constructor() {
    const args = Array.from(arguments) as ConstructorParameters<typeof Date>;
    const date = args.length ? new Date(...args) : new Date();
    super(date.getTime() + Configuration.timezone_offset * 60 * 1000);
  }
}
