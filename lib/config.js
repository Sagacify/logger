var env = process.env;

module.exports = {
  logEntries: {
    token: env.LOGENTRIES_TOKEN
  },
  logLevel: env.LOG_LEVEL
};
