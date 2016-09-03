/* global describe, it */

const logger = require('../src/index');
const assert = require('chai').assert;

describe('Logger', () => {
  it('The method "create" exists', () => {
    assert.isFunction(logger.create);
  });

  it('The method "create" takes one argument', () => {
    assert.equal(logger.create.length, 1);
  });

  var testLogger = logger.create({ module: 'test' });

  it('Created logger is an object', () => {
    assert.isObject(testLogger);
  });

  it('Created logger has 7 methods', () => {
    assert.equal(Object.keys(testLogger).length, 7);
  });

  it('Created logger "debug" method takes 3 arguments', () => {
    assert.equal(testLogger.debug.length, 3);
  });

  it('Created logger "info" method takes 3 arguments', () => {
    assert.equal(testLogger.info.length, 3);
  });

  it('Created logger "warn" method takes 3 arguments', () => {
    assert.equal(testLogger.warn.length, 3);
  });

  it('Created logger "error" method takes 3 arguments', () => {
    assert.equal(testLogger.error.length, 3);
  });

  it('Created logger "fatal" method takes 3 arguments', () => {
    assert.equal(testLogger.fatal.length, 3);
  });

  it('Created logger "logify" method takes 2 arguments', () => {
    assert.equal(testLogger.logify.length, 2);
  });

  it('Created logger "logifyAll" method takes 2 arguments', () => {
    assert.equal(testLogger.logifyAll.length, 2);
  });
});
