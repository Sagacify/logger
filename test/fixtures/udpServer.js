const dgram = require('dgram');

const createServer = (port, messageHandler) => {
  const server = dgram.createSocket('udp4');

  server.once('error', (err) => {
    console.error(err, 'Unexpeceted server error');
    server.close();
  });

  server.on('message', (messageBuffer) => {
    messageHandler(messageBuffer.toString());
  });

  server.bind(port);

  return server;
};

module.exports = createServer;
