export class AppError extends Error {
  statusCode;
  details;
  isOperational = true;

  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", details) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details) {
    super(message, 404, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", details) {
    super(message, 500, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too Many Requests, please try again later.", details) {
    super(message, 429, details);
  }
}
