import mongoose from "mongoose";
import { ZodError, ZodIssue } from "zod";
import {
  TErrorReturnType,
  TErrorSource,
} from "../../interfaces/global.interface";

export const handleCastError = (
  error: mongoose.Error.CastError
): TErrorReturnType => {
  const statusCode = 404;
  const message = "Invalid ID";
  const errorSources: TErrorSource[] = [
    { path: error.path, message: error.message },
  ];
  return {
    statusCode,
    message,
    errorSources,
  };
};
export const handleMongooseDuplicateKeyError = (
  error: any
): TErrorReturnType => {
  const extractDuplicateKeyValue = (errorMessage: string): string | null => {
    const regex = /dup key: \{ name: "(.*)" \}/;
    const match = errorMessage.match(regex);
    return match ? match[1] : null;
  };
  const duplicateValue = extractDuplicateKeyValue(error?.message);

  const statusCode = 404;
  const message = "can't create duplicate ";
  const errorSources: TErrorSource[] = [
    {
      path: Object.keys(error.keyPattern)[0],
      message: `Duplicate value for field ${
        Object.keys(error.keyValue)[0]
      }: ${duplicateValue}`,
    },
  ];
  return {
    statusCode,
    message,
    errorSources,
  };
};
export const handleMongooseValidationError = (
  error: mongoose.Error.ValidationError
): TErrorReturnType => {
  const message = "validation error";
  const statusCode = 400;
  const errorSources: TErrorSource[] = Object.values(error.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    }
  );
  return {
    message,
    statusCode,
    errorSources,
  };
};
export const handleZodError = (error: ZodError): TErrorReturnType => {
  const statusCode = 400;
  const errorSources: TErrorSource[] = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue?.path?.length - 1],
      message: issue?.message,
    };
  });
  return {
    statusCode,
    message: "validation error",
    errorSources,
  };
};
