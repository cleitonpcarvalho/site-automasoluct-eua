export class BlogError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: string[];

  constructor(status: number, code: string, message: string, details?: string[]) {
    super(message);
    this.name = "BlogError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function invalid(message: string): never {
  throw new BlogError(400, "invalid_request", message);
}
