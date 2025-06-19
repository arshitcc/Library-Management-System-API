export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something Went Wrong",
    data,
    success,
    errors = [],
    stack,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success || statusCode < 400;
    Object.setPrototypeOf(this, ApiError.prototype);
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
