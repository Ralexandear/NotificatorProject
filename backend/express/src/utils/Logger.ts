const getDateTime = () => new Date().toUTCString()

export class Logger {
  private static _useDebug = false;

  static log(...message: any[]) {
    console.log(getDateTime(), 'LOG:', ...message);
  }

  static error(...message: any[]) {
    console.error(getDateTime(), 'ERROR:', ...message);
  }

  static warn(...message: any[]) {
    console.warn(getDateTime(), 'WARN:', ...message);
  }

  static info(...message: any[]) {
    console.info(getDateTime(), 'INFO:', ...message);
  }

  static debug(...message: any[]) {
    if (! this._useDebug) return
    console.debug(getDateTime(), 'DEBUG:', ...message);
  }

  static useDebug() {
    this.log('Debug mode enabled');
    this._useDebug = true;
  }

  static removeDebug() {
    this.log('Debug mode disabled');
    this._useDebug = false;
  }
}

export default Logger;