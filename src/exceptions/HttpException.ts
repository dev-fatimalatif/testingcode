export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);

    // Ensure the instance of HttpException is correctly recognized
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
