# metalsmith-updated

This is a plugin for [Metalsmith](http://metalsmith.io) that adds created and
updated attributes to files based on cached information saved in a file.

## Installation

This module is released via npm, install the latest released version with:

```
npm install --save metalsmith-updated
```

##  Usage

If using the CLI for Metalsmith, metalsmith-updated can be used like any other plugin by including it in `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-updated"
  }
}
```

For Metalsmith's JavaScript API, metalsmith-updated can be used like any other plugin, by attaching it to the function invocation chain on the metalscript object:

```js
var updated = require('metalsmith-updated');
require('metalsmith')(__dirname)
  .use(updated())
  .build();
```

metalsmith-updated will only check HTML pages. Normally you will want to use
the plugin as soon as your markup has been converted to HTML, but before it
is templated, since these variables are useful in templates.

metalsmith-updated adds three attributes to each HTML file: created, and
updated.

* `created`: set if this is the first time that metalsmith-updated has seen
  the file.
* `updated`: set if the file is new or if it's contents have changed.
* `modified`: set if the file has been modified since it was created. This
  implies that `created != modified`.

metalsmith identifies files by filename and changes by hashing
`file.contents`. Timestamps are set to `metadata.date` if it exists (for
compatibility with
[metalsmith-build-date](https://www.npmjs.com/package/metalsmith-build-date)),
or to 

### Options

metalsmith-updated does not require any options, but the following options
are available:

#### `verbose` (optional)

(default: *false*)

If set a message will be printed if files generate warnings or errors.

#### `failWithoutNetwork` (optional)

(default : *true*)

If set, metalsmith-updated will fail if no network
connection is available.

#### `failErrors` (optional)

(default: *true*)

If set the metalsmith build process will halt if any files have format
errors.

#### `failWarnings` (optional)

(default: *false*)

If set the metalsmith build process will halt if any files have format
warnings.

#### `cacheChecks` (optional)

(default: *true*)

If set metalsmith-updated will record when external links succeed in
`checkFile` and not repeat the check for an interval set by `recheckMinutes`.

#### `checkFile` (optional)

(default: *`.format_checked.json`*)

Path relative to the metalsmith source directory where
metalsmith-updated caches link check information. This will be removed from
the build directory.

#### `failFile` (optional)

(default: *`format_failed.json`*)

Path relative to the metalsmith source directory to a JSON file where link
failures are recorded. This will be removed from the build directory.
