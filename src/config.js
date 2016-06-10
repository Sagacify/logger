const env = process.env;

export default {
  logEntries: {
    token: env.LOGENTRIES_TOKEN
  },
  logLevel: env.LOG_LEVEL
};
