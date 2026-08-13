import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

/**
 * Validates req.body/query/params against a Zod schema before the request
 * reaches the controller. On failure, throws ZodError which errorHandler
 * turns into a 400 with field-level details. Parsed (typed + coerced)
 * data replaces the raw input, so controllers get clean, typed values.
 */
export function validate(schema: ZodType<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body ?? req.body;
    if (parsed.query) Object.assign(req.query, parsed.query);
    req.params = parsed.params ?? req.params;
    next();
  };
}
