/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api-handler.ts
import { NextResponse } from "next/server";
import logger from "./logger";

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

class ApiHandler {
  static handleSuccess<T>(data: T, message?: string): NextResponse {
    return NextResponse.json(
      { 
        success: true, 
        data, 
        message 
      },
      { status: 200 }
    );
  }

  static handleError(error: any, defaultStatus: number = 500): NextResponse {
    let apiError: ApiError;

    // Handle different types of errors
    if (error.status && error.message) {
      // Already an API error
      apiError = error;
    } else if (error instanceof Error) {
      // Standard error object
      apiError = {
        message: error.message,
        status: defaultStatus,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    } else {
      // Unknown error type
      apiError = {
        message: typeof error === 'string' ? error : 'An unknown error occurred',
        status: defaultStatus,
        details: typeof error === 'object' ? error : undefined
      };
    }

    // Log the error
    logger.error('API Error', {
      message: apiError.message,
      status: apiError.status,
      details: apiError.details,
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        success: false, 
        error: apiError 
      },
      { status: apiError.status }
    );
  }

  static async handleAsync<T>(
    handler: () => Promise<T>,
    options: { defaultStatus?: number; logErrors?: boolean } = {}
  ): Promise<NextResponse> {
    const { defaultStatus = 500, logErrors = true } = options;
    
    try {
      const result = await handler();
      return this.handleSuccess(result);
    } catch (error: any) {
      if (logErrors) {
        logger.error('Async handler error', {
          error: error.message,
          stack: error.stack
        });
      }
      return this.handleError(error, defaultStatus);
    }
  }
}

export default ApiHandler;
