import { Logger, FinalLogger } from './libs/Logger';
import { createUdpStream } from './helpers/createUdpStream';

const env = process.env;
const destination = env.LOG_ENDPOINT
  ? createUdpStream(env.LOG_ENDPOINT)
  : undefined;

const logger = new Logger({
  logLevel: env.LOG_LEVEL,
  pretty: env.LOG_PRETTY === 'true',
  messageErrorLength: parseInt(env.LOG_ERROR_MESSAGE_LENGTH || '0', 10),
  stackLevel: env.LOG_STACK_LEVEL,
  destination
});

export { logger, FinalLogger };
