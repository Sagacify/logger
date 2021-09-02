import dgram from 'dgram';
import { Writable } from 'stream';

export function createUdpStream(endpoint: string): Writable {
  const socket = dgram.createSocket('udp4');
  const splitIndex = endpoint.lastIndexOf(':');
  const port = parseInt(endpoint.substring(splitIndex + 1), 10);
  const address = endpoint.substring(0, splitIndex);
  // Makes sure the process doesn't hang
  socket.unref();

  return new Writable({
    final() {
      socket.close();
    },
    write(data, _encoding, callback) {
      socket.send(data, 0, data.length, port, address);
      callback();
    }
  });
}
