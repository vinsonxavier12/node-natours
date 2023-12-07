class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "Not found" : "Error";
    this.isOperationalError = true; // Flag to check if error is operational or a code error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
