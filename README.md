# Sagacify Standarized Logger

## Environment Variables

```bash
LOGENTRIES_TOKEN # (Optional) Use it to put your logentries token
LOG_LEVEL # (Optional) Define you log level, defaut to 'info'
```

## Usage

```js
var log = require('logger')
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

