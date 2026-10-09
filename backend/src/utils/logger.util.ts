import pino from "pino";
import env from "../config/env.config.js";
import { redactLogValue } from "./redact.util.js";

const baseOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Central redaction: every log argument (merging object, message string,
  // nested err/responseBody, headers, URLs, …) is scrubbed before serialization.
  hooks: {
    logMethod(args, method) {
      const safeArgs = args.map((arg) => redactLogValue(arg));
      method.apply(this, safeArgs as unknown as typeof args);
    },
  },
};

export function createLogger(destination?: pino.DestinationStream): pino.Logger {
  if (destination) {
    return pino(baseOptions, destination);
  }
  return pino({
    ...baseOptions,
    ...(env.NODE_ENV === "development" && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
    }),
  });
}

export const logger = createLogger();
