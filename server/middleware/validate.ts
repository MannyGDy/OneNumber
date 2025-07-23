import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the errors and try again.',
      errors: errors.array().map((err: ValidationError) => ({
        param: 'param' in err ? err.param : undefined,
        message: err.msg,
        location: 'location' in err ? err.location : undefined
      }))
    });
  };
};

export default validate;

