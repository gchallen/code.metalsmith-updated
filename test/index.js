var metalsmith = require('metalsmith'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    chai = require('chai'),
    jsonfile = require('jsonfile'),
    async = require('async'),
    powerAssert = require('power-assert'),
    updated = require('..');

chai.use(require('chai-fs'));
chai.use(require('chai-datetime'));
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
    var defaults = _.clone(updated.defaults);
    var test_defaults = updated.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();

    metalsmith(src)
      .use(function (files, metalsmith, innerDone) {
        metalsmith.metadata()['date'] = check_time;
        files['new.html'] = {
					contents: new Buffer("New contents")
				}
        innerDone();
      })
      .use(updated(defaults))
      .build(function (err, files) {
        if (err) {
          return done(err);
        }
        assert.equalDate(files['new.html'].created, check_time);
        assert.equalDate(files['new.html'].updated, check_time);
        assert(files['new.html'].modified == false);
        assert.equalDate(files['new.html'].created, files['new.html'].updated);

        assert.pathExists(test_defaults.updatedFile);
        var updated = jsonfile.readFileSync(test_defaults.updatedFile);
        powerAssert.deepEqual(_.keys(updated).sort(), _.keys(files).sort());

        check_files(files, defaults);
        
        done();
      });
  });
  it('should ignore drafts with the default parameters', function(done) {
    var defaults = _.clone(updated.defaults);
    var test_defaults = updated.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();

    metalsmith(src)
      .use(function (files, metalsmith, innerDone) {
        metalsmith.metadata()['date'] = check_time;
        files['new.html'] = {
					contents: new Buffer("New contents")
				}
        files['ignore.html'] = {
					contents: new Buffer("Other contents"),
					draft: true
				}
        innerDone();
      })
      .use(updated(defaults))
      .build(function (err, files) {
        if (err) {
          return done(err);
        }
        assert.equalDate(files['new.html'].created, check_time);
        assert.equalDate(files['new.html'].updated, check_time);
        assert(files['new.html'].modified == false);
        assert.equalDate(files['new.html'].created, files['new.html'].updated);

        assert.pathExists(test_defaults.updatedFile);
        var updated = jsonfile.readFileSync(test_defaults.updatedFile);
        powerAssert.deepEqual(_.keys(updated).sort(), ['new.html', '.gitignore'].sort());

        check_files(files, defaults);
        
        done();
      });
  });
  it('should include files based on patterns', function(done) {
    var defaults = _.clone(updated.defaults);
    defaults.filePatterns = ["*.html"];
    var test_defaults = updated.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();

    metalsmith(src)
      .use(function (files, metalsmith, innerDone) {
        metalsmith.metadata()['date'] = check_time;
        files['new.html'] = {
					contents: new Buffer("New contents")
				}
        files['ignore.adoc'] = {
					contents: new Buffer("Other contents")
				}
        innerDone();
      })
      .use(updated(defaults))
      .build(function (err, files) {
        if (err) {
          return done(err);
        }
        assert.equalDate(files['new.html'].created, check_time);
        assert.equalDate(files['new.html'].updated, check_time);
        assert(files['new.html'].modified == false);
        assert.equalDate(files['new.html'].created, files['new.html'].updated);

        assert.pathExists(test_defaults.updatedFile);
        var updated = jsonfile.readFileSync(test_defaults.updatedFile);
        powerAssert.deepEqual(_.keys(updated).sort(), ['new.html'].sort());

        check_files(files, defaults);
        
        done();
      });
  });
  it('annotate not update unchanged files with the default parameters', function(done) {
    var defaults = _.clone(updated.defaults);
    var test_defaults = updated.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();
    
    async.series([
      function (callback) {
        metalsmith(src)
          .use(function (files, metalsmith, innerDone) {
            metalsmith.metadata()['date'] = check_time;
            files['new.html'] = {
							contents: new Buffer("New contents")
						}
            innerDone();
          })
          .use(updated(defaults))
          .build(function (err, files) {
            if (err) {
              return done(err);
            }
            assert.equalDate(files['new.html'].created, check_time);
            assert.equalDate(files['new.html'].updated, check_time);
            assert(files['new.html'].modified == false);
            assert.equalDate(files['new.html'].created, files['new.html'].updated);

            assert.pathExists(test_defaults.updatedFile);
            var updated = jsonfile.readFileSync(test_defaults.updatedFile);
            powerAssert.deepEqual(_.keys(updated).sort(), _.keys(files).sort());

            check_files(files, defaults);
            
            callback();
          });
      },
      function (callback) {
        metalsmith(src)
          .use(function (files, metalsmith, innerDone) {
            metalsmith.metadata()['date'] = check_time;
            files['new.html'] = {
							contents: new Buffer("New contents")
						}
            innerDone();
          })
          .use(updated(defaults))
          .build(function (err, files) {
            if (err) {
              return done(err);
            }
            assert.equalDate(files['new.html'].created, check_time);
            assert.equalDate(files['new.html'].updated, check_time);
            assert(files['new.html'].modified == false);
            assert.equalDate(files['new.html'].created, files['new.html'].updated);

            assert.pathExists(test_defaults.updatedFile);
            var updated = jsonfile.readFileSync(test_defaults.updatedFile);
            powerAssert.deepEqual(_.keys(updated).sort(), _.keys(files).sort());

            check_files(files, defaults);
            
            callback();
          });
      }],
      function () {
        done();
      });
  });
  it('should not override explicit dates', function(done) {
    var defaults = _.clone(updated.defaults);
    defaults.filePatterns = ["*.html"];
    var test_defaults = updated.processConfig(defaults, path.join(src, 'src'));
    reset_files(test_defaults);

    var check_time = new Date();
    var created = new Date("2015-09-01 10:00:00 (EDT)");

    async.series([
      function (callback) {
        metalsmith(src)
          .use(function (files, metalsmith, innerDone) {
            metalsmith.metadata()['date'] = check_time;
            files['new.html'] = {
							contents: new Buffer("New contents")
						}
            files['manual.html'] = {
							contents: new Buffer("Other contents"),
							created: created
						}
            innerDone();
          })
          .use(updated(defaults))
          .build(function (err, files) {
            if (err) {
              return done(err);
            }
            assert.equalDate(files['new.html'].created, check_time);
            assert.equalDate(files['new.html'].updated, check_time);
            assert(files['new.html'].modified == false);
            assert.equalDate(files['new.html'].created, files['new.html'].updated);

            assert.equalDate(files['manual.html'].created, created)
            assert.equalDate(files['manual.html'].updated, created)
            assert(files['manual.html'].modified == false);
            assert.equalDate(files['manual.html'].created, files['manual.html'].updated);

            assert.pathExists(test_defaults.updatedFile);
            var updated = jsonfile.readFileSync(test_defaults.updatedFile);
            powerAssert.deepEqual(_.keys(updated).sort(), ['new.html', 'manual.html'].sort());

            check_files(files, defaults);

            callback();
          });
      },
      function (callback) {
        metalsmith(src)
          .use(function (files, metalsmith, innerDone) {
            metalsmith.metadata()['date'] = check_time;
            files['new.html'] = {
							contents: new Buffer("New contents")
						}
            files['manual.html'] = {
							contents: new Buffer("Other contents"),
							created: created
						}
            innerDone();
          })
          .use(updated(defaults))
          .build(function (err, files) {
            if (err) {
              return done(err);
            }
            assert.equalDate(files['new.html'].created, check_time);
            assert.equalDate(files['new.html'].updated, check_time);
            assert(files['new.html'].modified == false);
            assert.equalDate(files['new.html'].created, files['new.html'].updated);

            assert.equalDate(files['manual.html'].created, created)
            assert.equalDate(files['manual.html'].updated, created)
            assert(files['manual.html'].modified == false);
            assert.equalDate(files['manual.html'].created, files['manual.html'].updated);

            assert.pathExists(test_defaults.updatedFile);
            var updated = jsonfile.readFileSync(test_defaults.updatedFile);
            powerAssert.deepEqual(_.keys(updated).sort(), ['new.html', 'manual.html'].sort());

            check_files(files, defaults);

            callback();
          });
      }],
      function () {
        done();
      });
  });
});
