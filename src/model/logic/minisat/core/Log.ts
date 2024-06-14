export class Log {
  private static readonly LOG_LEVEL: 'info' | 'fine' | 'warn' | 'error' = 'info'; // Set the log level as a constant

  public static isInfoLoggable(): boolean {
    return Log.LOG_LEVEL === 'info';
  }

  public static info(format: string, ...args: any[]): void {
    if (Log.isInfoLoggable()) {
      console.log(`[INFO] ${Log.formatString(format, ...args)}`);
    }
  }

  public static isFineLoggable(): boolean {
    return Log.LOG_LEVEL === 'fine';
  }

  public static fine(format: string, ...args: any[]): void {
    if (Log.isFineLoggable()) {
      console.log(`[FINE] ${Log.formatString(format, ...args)}`);
    }
  }

  public static isWarnLoggable(): boolean {
    return Log.LOG_LEVEL === 'warn';
  }

  public static warn(format: string, ...args: any[]): void {
    if (Log.isWarnLoggable()) {
      console.log(`[WARN] ${Log.formatString(format, ...args)}`);
    }
  }

  public static isErrorLoggable(): boolean {
    return Log.LOG_LEVEL === 'error';
  }

  public static error(format: string, ...args: any[]): void {
    if (Log.isErrorLoggable()) {
      console.log(`[ERROR] ${Log.formatString(format, ...args)}`);
    }
  }

  private static formatString(format: string, ...args: any[]): string {
    return format.replace(/{(\d+)}/g, (match, number) => (typeof args[number] != 'undefined' ? args[number] : match));
  }
}
