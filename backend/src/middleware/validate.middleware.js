import { z, ZodError } from "zod";
import { AppError } from "../utils/appError.utils.js";

function createValidater(source, schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      Object.assign(req[source], parsed);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(error.issues[0]?.message || "Validation error", 400, "VALIDATION_ERROR", z.treeifyError(error));
      }
      next(error);
    }
  };
}

export const validateBody = (schema) => createValidater("body", schema);
export const validateParams = (schema) => createValidater("params", schema);
export const validateQuery = (schema) => createValidater("query", schema);
