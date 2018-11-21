const Logger = require('./libs/Logger');
const createUdpStream = require('./helpers/createUdpStream');
const env = process.env;
const destination = env.LOG_ENDPOINT
  ? createUdpStream(env.LOG_ENDPOINT)
  : undefined;

module.exports = new Logger({
  logLevel: env.LOG_LEVEL,
  pretty: env.LOG_PRETTY === 'true',
  stackLevel: env.LOG_STACK_LEVEL,
  destination
});
