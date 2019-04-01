const dgram = require('dgram');
const { Writable } = require('stream');

const createUdpStream = endpoint => {
  const socket = dgram.createSocket('udp4');
  const splitIndex = endpoint.lastIndexOf(':');
  const port = endpoint.substring(splitIndex + 1);
  const address = endpoint.substring(0, splitIndex);
  // Makes sure the process doesn't hang
  socket.unref();

  return new Writable({
    final () { socket.close(); },
    write (data, encoding, callback) {
      socket.send(data, 0, data.length, port, address);
      callback();
    }
  });
};

module.exports = createUdpStream;
