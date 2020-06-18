const path = require("path");

module.exports = {
  extends: [
    "@malmo/eslint-config",
    "@aquestsrl/eslint-config"
  ],
  settings: {
    "import/resolver": {
      "@malmo/eslint-config/resolver": {
        baseDir: path.resolve(__dirname)
      }
    }
  }
};
