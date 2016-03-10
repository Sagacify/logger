function loadMainPackageJSON (attempts) {
  attempts = attempts || 1;
  if (attempts > 5) {
    throw new Error('Can\'t resolve main package.json file');
  }
  var mainPath = attempts === 1 ? './' : Array(attempts).join('../');
  try {
    return require.main.require(mainPath + 'package.json');
  } catch (e) {
    return loadMainPackageJSON(attempts + 1);
  }
}

module.exports = loadMainPackageJSON();
