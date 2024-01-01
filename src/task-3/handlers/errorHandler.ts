import * as express from "express";
import * as winston from "winston";

export const globalErrorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  winston.error(`${err.message}`, { error: err });
  res.status(500).json({
    error: "Internal server error",
  });
};
