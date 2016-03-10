/* global describe, it */

'use strict';

var assert = require('chai').assert;

var logger = require('../lib/index');

describe('Logger', function () {
  it('The method "create" exists', function () {
    assert.isFunction(logger.create);
  });

  it('The method "create" takes one argument', function () {
    assert.equal(logger.create.length, 1);
  });

  var testLogger = logger.create({ module: 'test' });

  it('Created logger is an object', function () {
    assert.isObject(testLogger);
  });

  it('Created logger has 5 methods', function () {
    assert.equal(Object.keys(testLogger).length, 5);
  });

  it('Created logger "debug" method takes 3 arguments', function () {
    assert.equal(testLogger.debug.length, 3);
  });

  it('Created logger "info" method takes 3 arguments', function () {
    assert.equal(testLogger.info.length, 3);
  });

  it('Created logger "warn" method takes 3 arguments', function () {
    assert.equal(testLogger.warn.length, 3);
  });

  it('Created logger "error" method takes 3 arguments', function () {
    assert.equal(testLogger.error.length, 3);
  });

  it('Created logger "fatal" method takes 3 arguments', function () {
    assert.equal(testLogger.fatal.length, 3);
  });
});
