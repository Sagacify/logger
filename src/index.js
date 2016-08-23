import bunyan from 'bunyan';
import config from './config';
import pkg from './package';
import Logentries from 'le_node';
import BPromise from 'bluebird';
import _ from 'lodash';

let bunyanStream = {
  stream: process.stdout
};

if (config.logEntries.token) {
  bunyanStream = Logentries.bunyanStream({
    token: config.logEntries.token,
    console: true
  });
}

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
    data.alreadyLogged = true;
    data = bunyan.stdSerializers.err(data);
  }

  return { event, data, meta };
}

const methods = loggerRef => {
  const logMethods = {};
  ['debug', 'info', 'warn', 'error', 'fatal'].forEach(logLevel => {
    logMethods[logLevel] = (event, data, meta) => {
      if (data.alreadyLogged) {
        return null;
      }
      loggerRef[logLevel](buildLog(event, data, meta));
    };
  });

  const logify = (func, event) => (...args) => {
    event = _.snakeCase(event).toUpperCase();
    let meta = args;
    if (args.length === 1 && _.isObject(args[0])) {
      meta = args[0];
    }
    return new BPromise((resolve, reject) => {
      loggerRef.debug(event, null, meta);
      func.apply(this, args)
        .then(result => {
          loggerRef.debug(`${event}_SUCCESS`, result, meta);
          resolve(result);
        })
        .catch(err => {
          loggerRef.error(`${event}_FAIL`, err, meta);
          reject(err);
        });
    });
  };

  const logifyAll = (obj, promisified = false) => {
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

export const create = info => {
  const loggerRef = mainLogger.child(info);

  return methods(loggerRef);
};

