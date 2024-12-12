import { SafeParseReturnType, ZodError } from "zod";
import AppError from "./app-error.js";

/**
 * Handles validation errors by converting them into a JSON string and throwing an AppError.
 * If no errors, returns the validated data.
 * @template T - The expected type of the validation error.
 * @template E - The expected type of the valid data.
 * @param {SafeParseReturnType<T, E>} validationResult - The result of a Zod schema validation.
 * @returns {E} - The validated data if validation succeeds.
 * @throws {AppError} - Throws an AppError with validation error details and a 400 status code if validation fails.
 */
export default function handleValidation<T, E>(validationResult: SafeParseReturnType<T, E>): E {
  if (validationResult.success) {
    return validationResult.data;
  } else {
    const errors = JSON.stringify(
      (validationResult.error as ZodError).issues.map((issue) => ({
        field: issue.path[0],
        errorMessage: issue.message,
      }))
    );
    throw new AppError(errors, 400);
  }
}
