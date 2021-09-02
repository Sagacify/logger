import path from 'path';

export function loadJson<T>(
  filename: string,
  required = false,
  attempts = 1
): T | undefined {
  if (attempts > 5) {
    if (required) {
      throw new Error(`Can't resolve ${filename} file`);
    }
    return;
  }
  // Need to resolve "." to get the path of the execution command
  let mainPath = path.resolve('.');
  if (attempts > 1) {
    mainPath = path.resolve(mainPath, '../'.repeat(attempts - 1));
  }
  try {
    return require(path.join(mainPath, filename));
  } catch (e) {
    return loadJson(filename, required, attempts + 1);
  }
}
