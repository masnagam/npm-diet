# @masnagam/npm-diet

> A tool to help keeping your package slim

[![npm version](https://badge.fury.io/js/%40masnagam%2Fnpm-diet.svg)](https://badge.fury.io/js/%40masnagam%2Fnpm-diet)
[![Build Status](https://travis-ci.org/masnagam/npm-diet.svg?branch=master)](https://travis-ci.org/masnagam/npm-diet)
[![Build status](https://ci.appveyor.com/api/projects/status/0rpjvxtbho32b1nh/branch/master?svg=true)](https://ci.appveyor.com/project/masnagam/npm-diet/branch/master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d683292612b847a5a2e8e2c28b122d68)](https://www.codacy.com/app/masnagam/npm-diet?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=masnagam/npm-diet&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/033bf64f11530c968a41/maintainability)](https://codeclimate.com/github/masnagam/npm-diet/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/033bf64f11530c968a41/test_coverage)](https://codeclimate.com/github/masnagam/npm-diet/test_coverage)

`npm-diet` is a CLI tool comprised of several commands which can be used for
analyzing the total size of NPM packages installed.

`npm-diet` can not be used for analyzing the size of a web application bundle.
Try to use the following tools for such purpose.

* [package-size](https://www.npmjs.com/package/package-size)
* [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
* [bundlephobia.com](https://bundlephobia.com/)
* You can search other tools using `npm search`...

## Installation

```console
$ npm install -g @masnagam/npm-diet
```

## How does this work?

Very simple:

1. Install specified packages using `npm install`
2. Correct installed packages using `npm ls --parseable`
3. Traverse directories in each package, and compute the sum of file sizes

See [lib/analyze/measure.js](./lib/analyze/measure.js).

## Limitations

There are some limitations at this moment:

* `npm-diet measure` does not take account of sizes of directories
* `npm-diet measure` does not compute actual sizes on disk

## Typical usages

Show a brief summary of an analysis:

```console
$ npm-diet measure del | npm-diet summary
#PKGS  SIZE       #FILES  #DUPS  DUP      %DUP
-----  ---------  ------  -----  -------  ------
   30  885.02 KB     178      1  6.80 KB  0.77 %
```

Show details of duplicates:

```console
$ npm-diet measure del | npm-diet show dup --package-path
PACKAGE     SIZE     %SIZE     #FILES  PATH
----------  -------  --------  ------  -------------------------------------
pify@4.0.1  8.11 KB                 4  node_modules/pify
----------  -------  --------  ------  -------------------------------------
pify@2.3.0  6.80 KB  100.00 %       4  node_modules/globby/node_modules/pify
----------  -------  --------  ------  -------------------------------------
TOTAL 1     6.80 KB  100.00 %       4
```

Show the top 3 packages in descending order of size:

```console
$ npm-diet measure livereload | npm-diet show measure --top=3
PACKAGE            SIZE       %SIZE    #FILES
-----------------  ---------  -------  ------
source-map@0.5.7   750.73 KB  14.25 %      19
nan@2.14.0         408.59 KB   7.75 %      46
iconv-lite@0.4.24  328.75 KB   6.24 %      26
-----------------  ---------  -------  ------
TOP 3                1.45 MB  28.24 %      91
TOTAL 205            5.15 MB             1306
```

Specify multiple packages:

```console
$ npm-diet measure mocha chai sinon | npm-diet summary
#PKGS  SIZE      #FILES  #DUPS  DUP        %DUP
-----  --------  ------  -----  ---------  ------
  134  15.16 MB    2252     13  326.00 KB  2.10 %
```

Process the analysis result with [jq]:

```console
$ npm-diet measure commander | jq '.packages[].files[] | .path, .size'
"CHANGELOG.md"
11086
"LICENSE"
1098
"Readme.md"
12783
"index.js"
27883
"package.json"
1834
"typings/index.d.ts"
8508
```

Use a `package.json` file for analysis:

```console
$ cat package.json
{
  ...
  "dependencies": {
    "npm-run-all": "^4.1.3",
    "rimraf": "^2.6.2"
  }
}

$ npm-diet pkg-deps package.json | npm-diet measure --stdin | \
    npm-diet summary
#PKGS  SIZE     #FILES  #DUPS  DUP  %DUP
-----  -------  ------  -----  ---  ------
   66  1.40 MB     596      0  0 B  0.00 %
```

Replace `rimraf` with `del`:

```console
$ echo '["npm-run-all","rimraf"]' | \
    npm-diet measure --stdin _rimraf del | npm-diet summary
#PKGS  SIZE     #FILES  #DUPS  DUP       %DUP
-----  -------  ------  -----  --------  ------
   85  2.11 MB     720      3  22.43 KB  1.04 %
```

Show delta values between two package sets:

```console
$ (npm-diet measure chalk ; npm-diet measure colors) | \
    npm-diet delta --stdin | npm-diet summary
LABEL             #PKGS  %PKGS     SIZE       %SIZE     #FILES  %FILES
----------------  -----  --------  ---------  --------  ------  --------
BASELINE (chalk)      7             90.44 KB                38
SUBJECT (colors)      1             37.53 KB                21
----------------  -----  --------  ---------  --------  ------  --------
DELTA                -6  -85.71 %  -52.91 KB  -58.51 %     -17  -44.74 %
```

Show details of a delta analysis:

```console
$ (npm-diet measure mini-lr ; npm-diet measure tiny-lr) | \
    npm-diet delta --stdin | npm-diet show delta --top=3
INCREASE                SIZE       %SIZE    #FILES
----------------------  ---------  -------  ------
tiny-lr@1.1.1           206.88 KB  70.85 %  41
body@5.1.0              19.22 KB   6.58 %   13
error@7.0.2             18.22 KB   6.24 %   14
----------------------  ---------  -------  ------
TOP 3                   244.32 KB  83.67 %  68
TOTAL 9                 292.00 KB           113

DECREASE                SIZE       %SIZE    #FILES
----------------------  ---------  -------  ------
iconv-lite@0.4.13       325.28 KB  43.68 %  27
mime-db@1.40.0          184.85 KB  24.82 %  6
body-parser@1.14.2      47.31 KB   6.35 %   10
----------------------  ---------  -------  ------
TOP 3                   557.44 KB  74.85 %  43
TOTAL 16                744.73 KB           131

COMMON                  SIZE       %SIZE    #FILES
----------------------  ---------  -------  ------
livereload-js@2.4.0     88.21 KB   16.61 %  14
qs@5.2.0                73.40 KB   13.82 %  18
websocket-driver@0.7.3  66.26 KB   12.48 %  18
----------------------  ---------  -------  ------
TOP 3                   227.88 KB  42.91 %  50
TOTAL 15                531.02 KB           157
```

## Data Models

The following data structures are still under consideration.  They may be
changed in the near future.

### Measure Analysis

```js
{
  "type": "measure",
  "specs": [ ... ],    // list of package specifiers
  "numPkgs": 1,        // the number of packages
  "size": 61750,       // sum of package sizes
  "numFiles": 6,       // sum of the numbers of files
  "packages": [ ... ]  // list of packages
}
```

### Delta Analysis

```js
{
  "type": "delta",
  "baseline": { ... },  // analysis of the baseline package set
  "subject": { ... },   // analysis of the subject package set
  "delta": { ... },     // delta values (metrics withtout `packages`)
  "increase": { ... },  // metrics of added packages
  "decrease": { ... },  // metrics of removed packages
  "common": { ... }     // metrics of common packages
}
```

### Duplicate Analysis

```js
{
  "type": "duplicate",
  "specs": [ ... ],      // list of package specifiers
  "numPkgs": 2,          // the number of duplicate packages
  "size": 14955,         // sum of duplicate sizes
  "numFiles": 8,         // sum of the numbers of files
  "duplicates": [ ... ]  // list of duplicates
}
```

### Package Specifier

```js
{
  "name": "@masnagam/npm-diet",  // package name
  "detail": "*"                  // semver, url or local path
}
```

### Metrics

Subsequent analysers may add other metrics.

```js
{
  "numPkgs": 1,        // the number of packages
  "size": 61750,       // sum of package sizes
  "numFiles": 6,       // sum of the numbers of files
  "packages": [ ... ]  // list of packages
}
```

### Duplicate

```js
{
  "name": "pify",      // name
  "size": 14955,       // sum of duplicate sizes
  "numFiles": 8,       // sum of the number of files
  "packages": [ ... ]  // list of packages
}
```

### Package

```js
{
  "name": "commander",              // name
  "version": "2.16.2",              // version
  "size": 61750,                    // sum of file sizes
  "files": [ ... ],                 // list of files
  "path": "node_modules/commander"  // relative path to the package
}
```

### File

```js
{
  "path": "CHANGELOG.md",  // relative path from the package dir
  "size": 10068            // file size in bytes
}
```

## Great predecessors

* [cost-of-modules] - Find out which of your dependencies is slowing you down
* [package-size-analyzer] - Package Size Analyzer when using npm package

## License

This software is distributed under the Apache license 2.0.  See
[LICENSE](./LICENSE) file for details.

[jq]: https://stedolan.github.io/jq/
[cost-of-modules]: https://github.com/siddharthkp/cost-of-modules
[package-size-analyzer]: https://www.npmjs.com/package/package-size-analyzer

