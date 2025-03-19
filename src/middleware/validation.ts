import { Request, Response, NextFunction } from "express";

interface ValidationRule {
  required?: boolean;
  type?: "string" | "array" | "number" | "boolean" | "object" | "date";
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validates a request body against a schema
 */
export function validateBody(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { body } = req;
    const errors: { [key: string]: string } = {};

    // Check each field in the schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      // Check if required
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip further validation if value is not provided and not required
      if ((value === undefined || value === null) && !rules.required) {
        continue;
      }

      // Type validation
      if (rules.type) {
        let typeValid = true;

        switch (rules.type) {
          case "string":
            typeValid = typeof value === "string";
            break;
          case "number":
            typeValid = typeof value === "number" || !isNaN(Number(value));
            break;
          case "boolean":
            typeValid =
              typeof value === "boolean" ||
              value === "true" ||
              value === "false";
            break;
          case "array":
            typeValid = Array.isArray(value);
            break;
          case "object":
            typeValid =
              typeof value === "object" &&
              !Array.isArray(value) &&
              value !== null;
            break;
          case "date":
            typeValid = value instanceof Date || !isNaN(Date.parse(value));
            break;
        }

        if (!typeValid) {
          errors[field] = `${field} must be a valid ${rules.type}`;
          continue;
        }
      }

      // String-specific validations
      if (typeof value === "string") {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors[
            field
          ] = `${field} must be at least ${rules.minLength} characters`;
        }

        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors[
            field
          ] = `${field} must be at most ${rules.maxLength} characters`;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors[field] = `${field} has an invalid format`;
        }
      }

      // Number-specific validations
      if (typeof value === "number" || rules.type === "number") {
        const numValue = typeof value === "number" ? value : Number(value);

        if (!isNaN(numValue)) {
          if (rules.minValue !== undefined && numValue < rules.minValue) {
            errors[field] = `${field} must be at least ${rules.minValue}`;
          }

          if (rules.maxValue !== undefined && numValue > rules.maxValue) {
            errors[field] = `${field} must be at most ${rules.maxValue}`;
          }
        }
      }

      // Array-specific validations
      if (Array.isArray(value)) {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors[
            field
          ] = `${field} must contain at least ${rules.minLength} items`;
        }

        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors[
            field
          ] = `${field} must contain at most ${rules.maxLength} items`;
        }
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(value);
        if (typeof customResult === "string") {
          errors[field] = customResult;
        } else if (!customResult) {
          errors[field] = `${field} is invalid`;
        }
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    // If validation passes, proceed to the next middleware/controller
    next();
  };
}

// Validation schemas

/**
 * Validation schema for creating a journal entry
 */
export const createJournalEntrySchema: ValidationSchema = {
  transitId: {
    required: true,
    type: "string",
    minLength: 1,
  },
  content: {
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 10000,
  },
  mood: {
    type: "string",
    maxLength: 100,
  },
  tags: {
    type: "array",
    maxLength: 20,
    custom: (value) => {
      if (!Array.isArray(value)) return "Tags must be an array";
      for (const tag of value) {
        if (typeof tag !== "string") return "All tags must be strings";
        if (tag.length > 50) return "Tag length cannot exceed 50 characters";
      }
      return true;
    },
  },
};

/**
 * Validation schema for updating a journal entry
 */
export const updateJournalEntrySchema: ValidationSchema = {
  transitId: {
    type: "string",
    minLength: 1,
  },
  content: {
    type: "string",
    minLength: 1,
    maxLength: 10000,
  },
  mood: {
    type: "string",
    maxLength: 100,
  },
  tags: {
    type: "array",
    maxLength: 20,
    custom: (value) => {
      if (!Array.isArray(value)) return "Tags must be an array";
      for (const tag of value) {
        if (typeof tag !== "string") return "All tags must be strings";
        if (tag.length > 50) return "Tag length cannot exceed 50 characters";
      }
      return true;
    },
  },
};

/**
 * Validates UUID format
 */
export function validateUUID(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.params.id || req.params.transitId;
  if (!id) {
    next();
    return;
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
    return;
  }

  next();
}
