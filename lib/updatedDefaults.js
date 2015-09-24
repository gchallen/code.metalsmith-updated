var path = require('path'),
    _ = require('underscore');


var defaults = {
  'verbose': false,
  'updatedFile': '.updated.json',
  'ignoreKeys': ["draft"]
}

function processConfig(config, src) {
  config = config || {};
  config = _.extend(_.clone(defaults), config);
  if (src) {
    config.updatedFile = path.join(src, config.updatedFile);
  }
  return config;
}

module.exports = {
  "defaults": defaults,
  "processConfig": processConfig
};
