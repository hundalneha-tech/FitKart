// backend/src/utils/response.ts

export interface ApiErrorDetail {
  [key: string]: any;
}

export interface ApiErrorObject {
  code: string;
  message: string;
  details?: ApiErrorDetail;
}

export class ApiResponse<T = any> {
  constructor(
    public status: 'success' | 'error' | 'validation_error',
    public data?: T,
    public error?: ApiErrorObject,
    public message?: string,
    public timestamp: string = new Date().toISOString(),
    public request_id: string = generateRequestId()
  ) {}

  toJSON() {
    const response: any = {
      status: this.status,
      timestamp: this.timestamp,
      request_id: this.request_id,
    };

    if (this.data !== undefined) {
      response.data = this.data;
    }

    if (this.message) {
      response.message = this.message;
    }

    if (this.error) {
      response.error = this.error;
    }

    return response;
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return new ApiResponse('success', data, undefined, message);
}

export function errorResponse(
  code: string,
  message: string,
  details?: ApiErrorDetail
): ApiResponse {
  return new ApiResponse(
    'error',
    undefined,
    { code, message, details },
    undefined
  );
}

export function validationErrorResponse(
  message: string,
  details?: ApiErrorDetail
): ApiResponse {
  return new ApiResponse(
    'validation_error',
    undefined,
    { code: 'VALIDATION_FAILED', message, details },
    undefined
  );
}
