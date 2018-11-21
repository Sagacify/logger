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
      serializers: {
        error: pino.stdSerializers.err
      },
      prettyPrint: pretty ? { colorize: true } : false
    }, destination);

    this.stackLevelIndex = levels.indexOf(stackLevel);
  }

  buildLog (logLevelindex, event, data = null, meta = null) {
    if (data instanceof Error) {
      let error = data;
      if (logLevelindex < this.stackLevelIndex) {
        // Remove stack when not required
        error = (({ stack, ...rest }) => rest)(error);
      }
      data = {
        error: pino.stdSerializers.err(error)
      };
    }

    return { event, data, meta };
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
