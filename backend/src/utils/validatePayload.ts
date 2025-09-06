import { Schema } from "joi";
import { ValidationError } from "./AppError";

const validatePayload = (schema: Schema, payload: any): void => {
  const { error } = schema.validate(payload);

  if (error?.details && error.details.length > 0) {
    const errorMessage = error.details[0].message
      ? `${error.details[0].message}`
      : "Validation error occurred.";
    throw new ValidationError(errorMessage);
  }
};

export default validatePayload;
