require('harmonize')(['harmony-generators']);

var metalsmith = require('metalsmith'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    chai = require('chai'),
    jsonfile = require('jsonfile'),
    async = require('async'),
    powerAssert = require('power-assert'),
    updated = require('..'),
    updatedDefaults = require('../lib/updatedDefaults.js');

chai.use(require('chai-fs'));
var assert = chai.assert;

// 24 Sep 2015 : GWA : Dummy source directory for updated file.

var src = 'test/fixtures/dummy';

function reset_files(test_defaults) {
  try {
    fs.unlinkSync(test_defaults.updatedFile);
  } catch (err) {};
  assert.notPathExists(test_defaults.updatedFile);
}

function check_files(files, defaults) {
  assert(!(defaults.updatedFile in files));
}

describe('metalsmith-updated', function() {
  it('should annotate new files with the default parameters', function(done) {
    var defaults = _.clone(updatedDefaults.defaults);
    var test_defaults = updatedDefaults.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();

    metalsmith(src)
      .use(function (files, metalsmith, innerDone) {
        metalsmith.metadata()['date'] = check_time;
        files['new.html'] = new Buffer("New contents");
        innerDone();
      })
      .use(updated(defaults))
      .build(function (err, files) {
        if (err) {
          return done(err);
        }
        assert(files['new.html'].created == check_time);
        assert(files['new.html'].updated == check_time);
        assert(files['new.html'].modified == false);
        assert(files['new.html'].created == files['new.html'].updated);

        assert.pathExists(test_defaults.updatedFile);
        var updated = jsonfile.readFileSync(test_defaults.updatedFile);
        powerAssert.deepEqual(_.keys(updated).sort(), ['new.html']);

        check_files(files, defaults);
        
        done();
      });
  });
  it('annotate not update unchanged files with the default parameters', function(done) {
    var defaults = _.clone(updatedDefaults.defaults);
    var test_defaults = updatedDefaults.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();
    
    async.series([
      function (callback) {
        metalsmith(src)
          .use(function (files, metalsmith, innerDone) {
            metalsmith.metadata()['date'] = check_time;
            files['new.html'] = new Buffer("New contents");
            innerDone();
          })
          .use(updated(defaults))
          .build(function (err, files) {
            if (err) {
              return done(err);
            }
            assert(files['new.html'].created == check_time);
            assert(files['new.html'].updated == check_time);
            assert(files['new.html'].modified == false);
            assert(files['new.html'].created == files['new.html'].updated);

            assert.pathExists(test_defaults.updatedFile);
            var updated = jsonfile.readFileSync(test_defaults.updatedFile);
            powerAssert.deepEqual(_.keys(updated).sort(), ['new.html']);

            check_files(files, defaults);
            
            callback();
          });
      },
      function (callback) {
        metalsmith(src)
          .use(function (files, metalsmith, innerDone) {
            metalsmith.metadata()['date'] = check_time;
            files['new.html'] = new Buffer("New contents");
            innerDone();
          })
          .use(updated(defaults))
          .build(function (err, files) {
            if (err) {
              return done(err);
            }
            console.log(files['new.html'].created, check_time);
            assert(files['new.html'].created == check_time);
            assert(files['new.html'].updated == check_time);
            assert(files['new.html'].modified == false);
            assert(files['new.html'].created == files['new.html'].updated);

            assert.pathExists(test_defaults.updatedFile);
            var updated = jsonfile.readFileSync(test_defaults.updatedFile);
            powerAssert.deepEqual(_.keys(updated).sort(), ['new.html']);

            check_files(files, defaults);
            
            callback();
          });
      }],
      function () {
        done();
      });
  });
});
