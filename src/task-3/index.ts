import * as express from "express";
import * as bodyParser from "body-parser";
import connectDB from "./db";
import userRoutes from "./routes/userRoutes";
import { limiter } from "./middlewares/rateLimit";
import { logger, errorLogger } from "./middlewares/logging";
import { globalErrorHandler } from "./handlers/errorHandler";

const app = express();
const port = 3000;

connectDB();

// Middleware for rate limit
app.use(limiter);

// Middleware for logging
app.use(logger);

// Middleware for error handling
app.use(errorLogger);

// Global error handler
app.use(globalErrorHandler);

app.use(bodyParser.json());

// Use user routes
app.use("/", userRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
