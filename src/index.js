const bunyan = require('bunyan');
const config = require('./config');
const pkg = require('./package');
const _ = require('lodash');

const bunyanStream = {
  stream: process.stdout
};

const mainLogger = bunyan.createLogger({
  name: pkg.name,
  version: pkg.version,
  level: config.logLevel || 'info',
  serializers: {
    error: bunyan.stdSerializers.err
  },
  streams: [bunyanStream]
});

function buildLog (event, data = null, meta = null) {
  if (data instanceof Error) {
    data = {
      error: bunyan.stdSerializers.err(data)
    };
  }

  return {event, data, meta};
}

const methods = loggerRef => {
  const logMethods = {};
  ['debug', 'info', 'warn', 'error', 'fatal'].forEach(logLevel => {
    logMethods[logLevel] = (event, data, meta) => {
      loggerRef[logLevel](buildLog(event, data, meta));
    };
  });

  const logify = (func, event) => (...args) => {
    event = _.snakeCase(event).toUpperCase();
    let meta = args;
    if (args.length === 1 && _.isObject(args[0])) {
      meta = args[0];
    }

    logMethods.debug(event, null, meta);
    return func.apply(this, args)
      .then(result => {
        logMethods.debug(`${event}_SUCCESS`, result, meta);
        return result;
      })
      .catch(err => {
        logMethods.error(`${event}_FAIL`, err, meta);
        throw err;
      });
  };

  const logifyAll = (obj, promisified) => {
    if (promisified === undefined) {
      promisified = '';
    }
    if (promisified === true) {
      promisified = 'Async';
    }
    for (const key in obj) {
      if (_.endsWith(key, promisified)) {
        obj[key] = logify(obj[key].bind(obj), _.trim(key, promisified));
      }
    }
    return obj;
  };

  return _.assign(logMethods, { logify, logifyAll });
};

const create = info => {
  const loggerRef = mainLogger.child(info);

  return methods(loggerRef);
};

module.exports = { create };
