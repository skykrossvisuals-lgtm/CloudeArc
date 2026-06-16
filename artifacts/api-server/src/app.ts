import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const app: Express = express();

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
};

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Catch-all error handler — logs the actual error server-side but avoids leaking details in production.
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err: err?.message, stack: err?.stack, type: err?.type, status: err?.status }, "Unhandled error");
  const status = err?.status ?? err?.statusCode ?? 500;
  const isDev = process.env.NODE_ENV === "development";
  res.status(status).json({
    error: isDev ? (err?.message ?? "Internal server error") : "Internal server error",
  });
});
