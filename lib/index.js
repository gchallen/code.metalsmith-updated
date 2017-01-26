var path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    jsonfile = require('jsonfile'),
    MD5 = require('md5'),
    minimatch = require('minimatch');
jsonfile.spaces = 4;

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

function removeFiles(files, config) {
  if (files[config.updatedFile]) {
    delete(files[config.updatedFile]);
  }
}

function updated(config) {

  return function(files, metalsmith, done) {
    
    config = processConfig(config);
    
    var metadata = metalsmith.metadata();
    var check_time = metadata.date || new Date();
    
    var updatedFiles = files;
    if (config.filePatterns && config.filePatterns.length > 0) {
      updatedFiles = _.pick(files, function(file, filename) {
        return _.some(config.filePatterns, function (pattern) {
          return minimatch(filename, pattern);
        });
      });
    }
    if (_.keys(updatedFiles).length === 0) {
      if (config.verbose) {
        console.log("No files to compute updates for.");
      }
      removeFiles();
      done();
    }

    updates = {};
    try {
      updates = JSON.parse(files[config.updatedFile].contents);
    } catch (err) {
      if (config.verbose) {
        console.log("Missing " + config.updatedFile);
      }
    }

    async.forEachOf(updatedFiles, function (file, filename, finished) {
      if (filename == config.updatedFile) {
        finished();
        return;
      }
      if (_.some(config.ignoreKeys, function (key) { return file[key]; })) {
        finished();
        return;
      } 
      try {
        var hash = MD5(file.contents);
      } catch (err) {
        if (config.verbose) {
          console.log("Hash failed for " + filename + ": " + err);
        }
        finished();
        return;
      }
      function initUpdate(u) {
        if (u) {
          u.created = new Date(u.created);
          u.updated = new Date(u.updated);
        }
        return u;
      }
          
      var update = initUpdate(updates[filename]) || {'filename': filename, 'hash': hash};
      var created = file.created || update.created || check_time;
      var updated = file.updated || update.updated || file.created || check_time;

      if (!file.no_updates && (hash != update.hash)) {
        updated = check_time;
      }
      file.created = created;
      file.updated = updated;
      file.modified = (created.getTime() != updated.getTime());

      update.created = created;
      update.updated = updated;
      update.hash = hash;
      updates[filename] = update;
      
      finished();
    },
    function () {
      jsonfile.writeFileSync(path.join(metalsmith.source(), config.updatedFile), updates);
      removeFiles(files, config);
      done();
    });
  }
}
exports = module.exports = updated
exports.defaults = defaults
exports.processConfig = processConfig
