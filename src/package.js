const loadMainPackageJSON = (attempts = 1) => {
  if (attempts > 5) {
    throw new Error('Can\'t resolve main package.json file');
  }
  let mainPath = './';
  if (attempts !== 1) {
    mainPath = Array(attempts).join('../');
  }
  try {
    return require.main.require(`${mainPath}package.json`);
  } catch (e) {
    return loadMainPackageJSON(attempts + 1);
  }
};

module.exports = loadMainPackageJSON();
