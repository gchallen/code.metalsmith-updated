var path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    jsonfile = require('jsonfile'),
    MD5 = require('md5'),
    minimatch = require('minimatch'),
    updatedDefaults = require('./updatedDefaults.js');

function removeFiles(files, config) {
  if (files[config.updatedFile]) {
    delete(files[config.updatedFile]);
  }
}

module.exports = function (config) {

  return function(files, metalsmith, done) {
    
    config = updatedDefaults.processConfig(config);
    
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
          console.log("Hash failed for " + filename);
        }
        finished();
        return;
      }
      function initUpdate(update) {
        if (update) {
          update.created = new Date(update.created);
          update.updated = new Date(update.updated);
        }
        return update;
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
