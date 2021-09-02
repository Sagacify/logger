import { Writable } from 'stream';

const createStream = (outputHandler: (output: string) => void): Writable => {
  let output = '';

  return new Writable({
    write: (chunk, _encoding, done) => {
      output += chunk.toString();

      done();
    }
  }).on('finish', () => {
    outputHandler(output);
  });
};

export default createStream;
