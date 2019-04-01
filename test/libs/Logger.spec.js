const { expect } = require('chai');
const { useFakeTimers } = require('sinon');
const createUpdDestination = require('../../src/helpers/createUdpStream');
const destinationStream = require('../fixtures/destintionStream');
const udpServer = require('../fixtures/udpServer');

const Logger = require('../../src/libs/Logger');
const hostname = require('os').hostname();
const version = require('../../package.json').version;
const pid = process.pid;

describe('Class Logger', () => {
  let clock;

  before(() => {
    clock = useFakeTimers({
      now: new Date('2019-01-01T00:00:00.000Z').getTime()
    });
  });

  after(() => {
    clock.restore();
  });

  it('has method "create" exists', () => {
    const logger = new Logger();

    expect(logger.create).to.be.a('function');
  });

  it('takes one argument', () => {
    const logger = new Logger();

    expect(logger.create).to.have.lengthOf(1);
  });

  describe('Method create ', () => {
    let logger = new Logger();
    let log = logger.create({ module: 'test' });

    it('creates an object logger', () => {
      expect(log).to.be.an('object');
    });

    it('creates a logger with 5 methods', () => {
      expect(Object.keys(log)).to.have.lengthOf(5);
    });

    it('creates a logger with a "debug" method having 3 arguments', () => {
      expect(log.debug).to.have.lengthOf(3);
    });

    it('creates a logger with a "info" method having 3 arguments', () => {
      expect(log.info).to.have.lengthOf(3);
    });

    it('creates a logger with a "warn" method having 3 arguments', () => {
      expect(log.warn).to.have.lengthOf(3);
    });

    it('creates a logger with a "error" method having 3 arguments', () => {
      expect(log.error).to.have.lengthOf(3);
    });

    it('creates a logger with a "fatal" method having 3 arguments', () => {
      expect(log.fatal).to.have.lengthOf(3);
    });
  });

  describe('Logging format', () => {
    it('should log in the good JSON format', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.deep.equal({ level: 30,
          time: '2019-01-01T00:00:00.000Z',
          hostname,
          pid,
          version,
          name: 'saga-logger',
          module: 'test',
          event: 'TEST_EVENT',
          data: { val: 1 },
          meta: { val: '2' },
          v: 1
        });

        done();
      });
      const logger = new Logger({ destination });

      const log = logger.create({ module: 'test' });

      log.info('TEST_EVENT', { val: 1 }, { val: '2' });
      destination.end();
    });

    it('should log in the good pretty format', (done) => {
      const destination = destinationStream(outputText => {
        expect(outputText.split('\n')).to.deep.equal([
          `["2019-01-01T00:00:00.000Z"] \u001b[32mINFO\u001b[39m (saga-logger/${pid} on ${hostname}): `,
          `    version: "${version}"`,
          '    module: "test"',
          '    event: "TEST_EVENT"',
          '    data: null',
          '    meta: null',
          ''
        ]);
        done();
      });

      const logger = new Logger({ destination, pretty: true });

      const log = logger.create({ module: 'test' });
      log.info('TEST_EVENT');
      destination.end();
    });
  });

  describe('Logging error stack', () => {
    it('should log the stack for defined level', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('data.error.message', 'test');
        expect(output).to.have.nested.property('data.error.stack');
        done();
      });

      const logger = new Logger({ destination, stackLevel: 'error' });
      const log = logger.create({ module: 'test' });
      log.error('TEST_ERROR', new Error('test'));
      destination.end();
    });

    it('should log the stack above defined level', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('data.error.message', 'test');
        expect(output).to.have.nested.property('data.error.stack');
        done();
      });

      const logger = new Logger({ destination });
      const log = logger.create({ module: 'test', stackLevel: 'warn' });
      log.fatal('TEST_ERROR', new Error('test'));
      destination.end();
    });

    it('should NOT log the stack below defined level', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('data.error.message', 'test');
        expect(output).to.not.have.nested.property('data.error.stack');
        done();
      });

      const logger = new Logger({ destination });
      const log = logger.create({ module: 'test', stackLevel: 'error' });
      const error = new Error('test');

      log.warn('TEST_ERROR', error);
      destination.end();
    });
  });

  describe('Logging destination', () => {
    it('should log on a udp destination', (done) => {
      const destination = createUpdDestination('localhost:5000');
      const server = udpServer(5000, message => {
        // First close server and socket to avoid hanging
        destination.end();
        server.close();

        const ouput = JSON.parse(message);

        expect(ouput).to.deep.equal({
          level: 30,
          time: '2019-01-01T00:00:00.000Z',
          hostname,
          pid,
          version,
          name: 'saga-logger',
          module: 'test',
          event: 'TEST_EVENT',
          data: { foo: 'bar' },
          meta: { bar: 'foo' },
          v: 1
        });

        done();
      });

      const logger = new Logger({ destination });
      const log = logger.create({ module: 'test' });
      log.info('TEST_EVENT', { foo: 'bar' }, { bar: 'foo' });
    });
  });
});
