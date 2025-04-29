const getDateTime = () => new Date().toUTCString()

export class Logger {
  private static _useDebug = false;
  private static _isMutted = false;

  static log(...message: any[]) {
    if (this._isMutted) return
    console.log(getDateTime(), 'LOG:', ...message);
  }

  static error(...message: any[]) {
    if (this._isMutted) return
    console.error(getDateTime(), 'ERROR:', ...message);
  }

  static warn(...message: any[]) {
    if (this._isMutted) return
    console.warn(getDateTime(), 'WARN:', ...message);
  }

  static info(...message: any[]) {
    if (this._isMutted) return
    console.info(getDateTime(), 'INFO:', ...message);
  }

  static debug(...message: any[]) {
    if (! this._useDebug || this._isMutted) return
    console.debug(getDateTime(), 'DEBUG:', ...message);
  }

  static mute() {
    this.log('Logger muted');
    this._isMutted = true;
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