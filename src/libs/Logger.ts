import pino from 'pino';
import os from 'os';
import { loadJson } from '../helpers/loadJson';

type PackageJson = {
  version: string;
  name: string;
};

type VersionJson = {
  projectName: string;
  buildNumber: string;
  commit: string;
};

type ErrorNoStack = {
  name: string;
  message: string;
};

const packageInfo = loadJson<PackageJson>('package.json', true);
const versionInfo = loadJson<VersionJson>('version.json', false);

const levels = ['debug', 'info', 'warn', 'error', 'fatal'];

interface LoggerOptions {
  logLevel?: string;
  stackLevel?: string;
  destination?: pino.DestinationStream;
  messageErrorLength?: number; // 0 means no limit
  pretty?: boolean;
}

export type FinalLogger = Record<
  string,
  (
    event: string,
    indexed?: Record<string, unknown> | Error | null,
    raw?: Record<string, unknown>
  ) => void
>;

export class Logger {
  main: pino.Logger;
  messageErrorLength: number;
  stackLevelIndex: number;

  constructor({
    logLevel = '',
    stackLevel = 'error',
    destination = pino.destination(1),
    messageErrorLength = 0, // 0 means no limit
    pretty = false
  }: LoggerOptions = {}) {
    const { projectName, buildNumber, commit } = versionInfo ?? {};

    this.main = pino(
      {
        name: packageInfo?.name,
        base: {
          hostname: os.hostname(),
          pid: process.pid,
          version: packageInfo?.version,
          projectName,
          buildNumber,
          commit
        },
        level: logLevel || 'info',
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        prettyPrint: pretty ? { colorize: true } : false
      },
      destination
    );

    this.messageErrorLength = messageErrorLength;
    this.stackLevelIndex = levels.indexOf(stackLevel);
  }

  shortenMessage(error: Error): void {
    if (error.message.length > this.messageErrorLength) {
      error.message = error.message.substring(0, this.messageErrorLength);
    }
  }

  removeStack(error: Error): ErrorNoStack {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { message, stack, ...rest } = error;
    const errorNoStack = { message, ...rest };
    // Needed to be recognized as an error
    Object.setPrototypeOf(errorNoStack, Object.getPrototypeOf(error));

    return errorNoStack;
  }

  serializeError(
    logLevelindex: number,
    logData?: Record<string, unknown> | Error | null
  ): Record<string, unknown> | null {
    let serialized: Record<string, unknown> | null;

    if (logData instanceof Error || logData?.error instanceof Error) {
      let baseError: Error =
        logData instanceof Error ? logData : (logData.error as Error);

      // Some package, put entire file in message this is too crazy ...
      if (this.messageErrorLength > 0) {
        this.shortenMessage(baseError);
      }

      if (logLevelindex < this.stackLevelIndex) {
        // Remove stack when not required
        baseError = this.removeStack(baseError);
      }
      serialized =
        logData instanceof Error
          ? { error: pino.stdSerializers.err(baseError) }
          : {
              ...logData,
              error: pino.stdSerializers.err(baseError)
            };
    } else {
      serialized = logData ?? null;
    }

    return serialized;
  }

  buildLog(
    logLevelindex: number,
    event: string,
    indexed?: Record<string, unknown>,
    raw?: Record<string, unknown>
  ): Record<string, unknown> {
    const finalLog = {
      event,
      indexed: this.serializeError(logLevelindex, indexed),
      raw: this.serializeError(logLevelindex, raw)
    };

    return finalLog;
  }

  create(info: Record<string, unknown>): FinalLogger {
    const childLogger = this.main.child(info);

    return levels.reduce(
      (finalLogger: FinalLogger, logLevel: string, logLevelindex: number) => {
        finalLogger[logLevel] = (
          event: string,
          indexed?: Record<string, unknown>,
          raw?: Record<string, unknown>
        ) => {
          childLogger[logLevel](
            this.buildLog(logLevelindex, event, indexed, raw)
          );
        };

        return finalLogger;
      },
      {}
    );
  }
}
