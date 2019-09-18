const pino = require('pino');
const os = require('os');
const loadJson = require('../helpers/loadJson');

const packageInfo = loadJson('package.json');
const versionInfo = loadJson('version.json', {});

const levels = ['debug', 'info', 'warn', 'error', 'fatal'];

module.exports = class Logger {
  constructor ({
    logLevel = '',
    stackLevel = 'error',
    destination = pino.destination(1),
    pretty = false
  } = {}) {
    const { projectName, buildNumber, commit } = versionInfo;

    this.main = pino({
      name: packageInfo.name,
      base: {
        hostname: os.hostname(),
        pid: process.pid,
        version: packageInfo.version,
        projectName,
        buildNumber,
        commit
      },
      level: logLevel || 'info',
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      prettyPrint: pretty ? { colorize: true } : false
    }, destination);

    this.stackLevelIndex = levels.indexOf(stackLevel);
  }

  removeStack (error) {
    const { message, stack, ...rest } = error;
    const ErrorNoStack = { message, ...rest };
    // Needed to be recognized as an error
    Object.setPrototypeOf(ErrorNoStack, Object.getPrototypeOf(error));

    return ErrorNoStack;
  }

  serializeError (logLevelindex, logData) {
    let serialized;
    const isError = logData instanceof Error;
    let baseError;

    if (isError) {
      baseError = logData;
    } else if ((logData || {}).error instanceof Error) {
      baseError = logData.error;
    }

    if (baseError) {
      if (logLevelindex < this.stackLevelIndex) {
        // Remove stack when not required
        baseError = this.removeStack(baseError);
      }
      serialized = isError
        ? { error: pino.stdSerializers.err(baseError) }
        : {
          ...logData,
          error: pino.stdSerializers.err(baseError)
        };
    } else {
      serialized = logData;
    }

    return serialized;
  }

  buildLog (logLevelindex, event, indexed = null, raw = null) {
    const finalLog = {
      event,
      indexed: this.serializeError(logLevelindex, indexed),
      raw: this.serializeError(logLevelindex, raw)
    };

    return finalLog;
  }

  create (info) {
    const childLogger = this.main.child(info);

    return levels.reduce((finalLogger, logLevel, logLevelindex) => {
      finalLogger[logLevel] = (event, data, meta) => {
        childLogger[logLevel](this.buildLog(logLevelindex, event, data, meta));
      };

      return finalLogger;
    }, {});
  }
};
