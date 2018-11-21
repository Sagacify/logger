# Sagacify Standarized Logger

## Environment Variables

```sh
LOG_LEVEL # (optional) Defines you log level, defaut 'info'
LOG_ENDPOINT # (optional) Defines an udp endpoint format: 10.0.10.100:5300
LOG_STACK_LEVEL # (optional) Defines minimum level to log stack, default 'error'
LOG_PRETTY # (optional) Defines pretty print output, default false
```

*Notes:*

 - *LOG_ENDPOINT is intended to be used with AWS Lambda and will be over UDP*
 - *LOG_PRETTY is intended to be used in local development*

## Automatic loads

This logger automatically loads info from the `package.json`
but also from a `version.json` file if present at the root of the project.

**version.json structure**

```json
{
  "projectName": "my-project",
  "buildNumber": "120",
  "commit": "a8f571799deb70dae2da3ba1de62097700bde304"
}
```

## Usage

```js
var log = require('saga-logger')
  .create({ module: 'files-controller' });

log.debug('event', {
  someData : data
}, {
  someMetadata : metadata
});
```

Data and metadata are optional.
Data can be an `Error` object

Here are the different logging methods:

```js
log.debug(event, data, metadata);
log.info(event, data, metadata);
log.warn(event, data, metadata);
log.error(event, data, metadata);
log.fatal(event, data, metadata);
```
## Output

With this code and a `version.json` file present:

```js
log.error('ERROR_EVENT', new Error('Some error'), { foo: 'bar' });
```

```json
{
  "level": 50,
  "time": "2019-01-01T00: 00: 00.000Z",
  "hostname": "my-hostname",
  "pid": 71202,
  "version": "1.0.1",
  "projectName": "logger",
  "buildNumber": "120",
  "commit": "a8f571799deb70dae2da3ba1de62097700bde304",
  "name": "saga-logger",
  "module": "mymodule",
  "event": "ERROR_EVENT",
  "data": {
    "error": {
      "type": "Error",
      "message": "Some error",
      "stack": "Error: Some error\n    at Context.it (/var/www/logger/test/libs/Logger.spec.js:191:31)\n    at callFnAsync (/var/www/logger/node_modules/mocha/lib/runnable.js:400:21)\n    at Test.Runnable.run (/var/www/logger/node_modules/mocha/lib/runnable.js:342:7)\n    at Runner.runTest (/var/www/logger/node_modules/mocha/lib/runner.js:455:10)\n    at /var/www/logger/node_modules/mocha/lib/runner.js:573:12\n    at next (/var/www/logger/node_modules/mocha/lib/runner.js:369:14)\n    at /var/www/logger/node_modules/mocha/lib/runner.js:379:7\n    at next (/var/www/logger/node_modules/mocha/lib/runner.js:303:14)\n    at Immediate._onImmediate (/var/www/logger/node_modules/mocha/lib/runner.js:347:5)\n    at runCallback (timers.js:694:18)\n    at tryOnImmediate (timers.js:665:5)\n    at processImmediate (timers.js:647:5)"
    }
  },
  "meta": {
    "foo": "bar"
  },
  "v":1
}
```
