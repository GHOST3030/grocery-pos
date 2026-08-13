/**
 * Sealed-style error hierarchy (mirrors the Flutter `sealed class AppException`
 * pattern). Every thrown error in `logic`/`data` layers should be one of these
 * subclasses, never a raw Error or string. The error middleware maps each
 * subclass to an HTTP status code in one place — controllers never call
 * res.status() themselves for error cases.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code: string = 'VALIDATION_ERROR';
  constructor(message: string, public readonly details?: unknown) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code: string = 'UNAUTHORIZED';
  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code: string = 'FORBIDDEN';
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code: string = 'NOT_FOUND';
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code: string = 'CONFLICT';
  constructor(message: string) {
    super(message);
  }
}

// --- Domain-specific errors (POS business rules) ---

export class InvalidCredentialsError extends UnauthorizedError {
  readonly code: string = 'INVALID_CREDENTIALS';
  constructor() {
    super('Invalid username or password');
  }
}

export class DuplicateSkuError extends ConflictError {
  readonly code: string = 'DUPLICATE_SKU';
  constructor(sku: string) {
    super(`A product with SKU "${sku}" already exists`);
  }
}

export class InsufficientStockError extends ConflictError {
  readonly code: string = 'INSUFFICIENT_STOCK';
  constructor(productName: string, available: number, requested: number) {
    super(
      `Insufficient stock for "${productName}": ${available} available, ${requested} requested`
    );
  }
}
