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

metalsmith-updated identifies files by filename and changes by hashing
`file.contents`. Timestamps are set to `metadata.date` if it exists (for
compatibility with
[metalsmith-build-date](https://www.npmjs.com/package/metalsmith-build-date)),
or to `new Date()` if not.

Note that metalsmith-updated *will not* override these attributes if they
already exist on any file, but will save dutifully to its comparison file.
This can be useful for bootstrapping metalsmith-updated for existing blog
posts, for example.

### Options

metalsmith-updated does not require any options, but the following options
are available:

#### `verbose` (optional)

(default: *false*)

If set a message will be printed if files generate warnings or errors.

#### `ignoreKeys` (optional)

(default: `["draft"]`)

metalsmith-updated will ignore files that have "truthy" values in any of
these keys.

#### `filePatterns` (optional)

(default: `[]`)

A list of minimatch patterns to constrain the files that metalsmith-updated
will examine. `["*.html"]` is a potentially-useful option.

#### `updatedFile` (optional)

(default: *`.updated.json`*)

Path relative to the metalsmith source directory where metalsmith-updated
caches file information. This will be removed from the build directory.
