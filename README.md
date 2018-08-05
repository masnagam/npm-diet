# @masnagam/npm-diet

> A tool to help keeping your package slim

## Install

Using NPM:

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

`npm-diet measure` does not compute the bundle size of packages.

## Typical usages

Show a brief summary of an analysis:

```console
$ npm-diet measure del | npm-diet summary
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ del                                                                                   │
├─────────────────┬────────────┬──────────────┬─────────────┬───────────────────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │ NUM OF DUPS │ SIZE OF DUPS (% OF TOTAL) │
├─────────────────┼────────────┼──────────────┼─────────────┼───────────────────────────┤
│ 26              │ 244.00 KB  │ 112          │ 2           │ 14.60 KB (5.99 %)         │
└─────────────────┴────────────┴──────────────┴─────────────┴───────────────────────────┘
```

Show details of duplicates:

```console
$ npm-diet measure del | npm-diet show dup
┌────────────────────────────────────────────────────┐
│ Duplicates of pify                                 │
├────────────┬────────────────────────┬──────────────┤
│ PACKAGE    │ SIZE (% OF TOTAL DUPS) │ NUM OF FILES │
├────────────┼────────────────────────┼──────────────┤
│ pify@3.0.0 │ 7.80 KB (53.39 %)      │ 4            │
├────────────┼────────────────────────┼──────────────┤
│ pify@2.3.0 │ 6.81 KB (46.61 %)      │ 4            │
├────────────┼────────────────────────┼──────────────┤
│ TOTAL 2    │ 14.60 KB (100.00 %)    │ 8            │
└────────────┴────────────────────────┴──────────────┘
```

Show the top 3 packages in descending order of size:

```console
$ npm-diet measure livereload | npm-diet show measure --top=3
┌────────────────────────────────────────────────────────┐
│ livereload                                             │
├───────────────────┬─────────────────────┬──────────────┤
│ PACKAGE           │ SIZE (% OF TOTAL)   │ NUM OF FILES │
├───────────────────┼─────────────────────┼──────────────┤
│ fsevents@1.2.4    │ 657.95 KB (17.10 %) │ 36           │
├───────────────────┼─────────────────────┼──────────────┤
│ nan@2.10.0        │ 401.66 KB (10.44 %) │ 46           │
├───────────────────┼─────────────────────┼──────────────┤
│ iconv-lite@0.4.21 │ 328.17 KB (8.53 %)  │ 27           │
├───────────────────┼─────────────────────┼──────────────┤
│ TOP 3             │ 1.36 MB (36.07 %)   │ 109          │
├───────────────────┼─────────────────────┼──────────────┤
│ TOTAL 131         │ 3.76 MB             │ 973          │
└───────────────────┴─────────────────────┴──────────────┘
```

Specify multiple packages:

```console
$ npm-diet measure mocha chai sinon | npm-diet summary
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ mocha chai sinon                                                                      │
├─────────────────┬────────────┬──────────────┬─────────────┬───────────────────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │ NUM OF DUPS │ SIZE OF DUPS (% OF TOTAL) │
├─────────────────┼────────────┼──────────────┼─────────────┼───────────────────────────┤
│ 42              │ 8.65 MB    │ 428          │ 0           │ 0 B (0.00 %)              │
└─────────────────┴────────────┴──────────────┴─────────────┴───────────────────────────┘
```

Process the analysis result with [jq]:

```console
$ npm-diet measure commander | jq '.packages[].files[] | .path, .size'
"CHANGELOG.md"
10241
"LICENSE"
1098
"Readme.md"
12381
"index.js"
28067
"package.json"
1819
"typings/index.d.ts"
8401
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

$ npm-diet pkg-deps package.json | npm-diet measure --stdin | npm-diet summary
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ npm-run-all rimraf                                                                    │
├─────────────────┬────────────┬──────────────┬─────────────┬───────────────────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │ NUM OF DUPS │ SIZE OF DUPS (% OF TOTAL) │
├─────────────────┼────────────┼──────────────┼─────────────┼───────────────────────────┤
│ 74              │ 1.23 MB    │ 578          │ 0           │ 0 B (0.00 %)              │
└─────────────────┴────────────┴──────────────┴─────────────┴───────────────────────────┘
```

Replace `rimraf` with `del`:

```console
$ echo '["npm-run-all","rimraf"]' | npm-diet measure --stdin _rimraf del | \
    npm-diet summary
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ npm-run-all del                                                                       │
├─────────────────┬────────────┬──────────────┬─────────────┬───────────────────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │ NUM OF DUPS │ SIZE OF DUPS (% OF TOTAL) │
├─────────────────┼────────────┼──────────────┼─────────────┼───────────────────────────┤
│ 87              │ 1.30 MB    │ 628          │ 2           │ 14.64 KB (1.10 %)         │
└─────────────────┴────────────┴──────────────┴─────────────┴───────────────────────────┘
```

Show delta values between two package sets:

```console
$ (npm-diet measure chalk ; npm-diet measure colors) | \
    npm-diet delta --stdin | npm-diet summary
┌───────────────────────┬─────────────────────────────────────────────────────────┐
│ BASELINE              │ chalk                                                   │
├───────────────────────┼─────────────────────────────────────────────────────────┤
│ SUBJECT               │ colors                                                  │
├───────────────────────┼─────────────────┬──────────────────────┬────────────────┤
│                       │ NUM OF PACKAGES │ TOTAL SIZE           │ NUM OF FILES   │
├───────────────────────┼─────────────────┼──────────────────────┼────────────────┤
│ BASELINE              │ 7               │ 87.85 KB             │ 35             │
├───────────────────────┼─────────────────┼──────────────────────┼────────────────┤
│ SUBJECT               │ 1               │ 37.30 KB             │ 21             │
├───────────────────────┼─────────────────┼──────────────────────┼────────────────┤
│ DELTA (% OF BASELINE) │ -6 (-85.71 %)   │ -50.55 KB (-57.54 %) │ -14 (-40.00 %) │
└───────────────────────┴─────────────────┴──────────────────────┴────────────────┘
```

Show details of a delta analysis:

```console
$ (npm-diet measure mini-lr ; npm-diet measure tiny-lr) | \
    npm-diet delta --stdin | npm-diet show delta --top=3
┌───────────────────────┬──────────────────────────────────────────────────────────┐
│ BASELINE              │ mini-lr                                                  │
├───────────────────────┼──────────────────────────────────────────────────────────┤
│ SUBJECT               │ tiny-lr                                                  │
├───────────────────────┼─────────────────┬───────────────────────┬────────────────┤
│                       │ NUM OF PACKAGES │ TOTAL SIZE            │ NUM OF FILES   │
├───────────────────────┼─────────────────┼───────────────────────┼────────────────┤
│ BASELINE              │ 30              │ 1.21 MB               │ 283            │
├───────────────────────┼─────────────────┼───────────────────────┼────────────────┤
│ SUBJECT               │ 19              │ 744.88 KB             │ 227            │
├───────────────────────┼─────────────────┼───────────────────────┼────────────────┤
│ DELTA (% OF BASELINE) │ -11 (-36.67 %)  │ -490.24 KB (-39.69 %) │ -56 (-19.79 %) │
└───────────────────────┴─────────────────┴───────────────────────┴────────────────┘
┌────────────────────────────────────────────────────┐
│ INCREASE                                           │
├───────────────┬─────────────────────┬──────────────┤
│ PACKAGE       │ SIZE (% OF TOTAL)   │ NUM OF FILES │
├───────────────┼─────────────────────┼──────────────┤
│ tiny-lr@1.1.1 │ 206.89 KB (70.83 %) │ 41           │
├───────────────┼─────────────────────┼──────────────┤
│ body@5.1.0    │ 19.24 KB (6.59 %)   │ 13           │
├───────────────┼─────────────────────┼──────────────┤
│ error@7.0.2   │ 18.23 KB (6.24 %)   │ 14           │
├───────────────┼─────────────────────┼──────────────┤
│ TOP 3         │ 244.35 KB (83.65 %) │ 68           │
├───────────────┼─────────────────────┼──────────────┤
│ TOTAL 9       │ 292.10 KB           │ 113          │
└───────────────┴─────────────────────┴──────────────┘
┌─────────────────────────────────────────────────────────┐
│ DECREASE                                                │
├────────────────────┬─────────────────────┬──────────────┤
│ PACKAGE            │ SIZE (% OF TOTAL)   │ NUM OF FILES │
├────────────────────┼─────────────────────┼──────────────┤
│ iconv-lite@0.4.13  │ 325.29 KB (44.22 %) │ 27           │
├────────────────────┼─────────────────────┼──────────────┤
│ mime-db@1.35.0     │ 179.32 KB (24.37 %) │ 6            │
├────────────────────┼─────────────────────┼──────────────┤
│ body-parser@1.14.2 │ 47.32 KB (6.43 %)   │ 10           │
├────────────────────┼─────────────────────┼──────────────┤
│ TOP 3              │ 551.92 KB (75.02 %) │ 43           │
├────────────────────┼─────────────────────┼──────────────┤
│ TOTAL 16           │ 735.67 KB           │ 131          │
└────────────────────┴─────────────────────┴──────────────┘
┌─────────────────────────────────────────────────────────────┐
│ COMMON                                                      │
├────────────────────────┬─────────────────────┬──────────────┤
│ PACKAGE                │ SIZE (% OF TOTAL)   │ NUM OF FILES │
├────────────────────────┼─────────────────────┼──────────────┤
│ livereload-js@2.3.0    │ 88.86 KB (17.79 %)  │ 14           │
├────────────────────────┼─────────────────────┼──────────────┤
│ qs@5.2.0               │ 73.41 KB (14.70 %)  │ 18           │
├────────────────────────┼─────────────────────┼──────────────┤
│ websocket-driver@0.7.0 │ 64.79 KB (12.97 %)  │ 18           │
├────────────────────────┼─────────────────────┼──────────────┤
│ TOP 3                  │ 227.06 KB (45.46 %) │ 50           │
├────────────────────────┼─────────────────────┼──────────────┤
│ TOTAL 14               │ 499.46 KB           │ 152          │
└────────────────────────┴─────────────────────┴──────────────┘
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

## Many thanks

This tool is built upon many creative packages.

## License

This software is distributed under the MIT license.  See [LICENSE](./LICENSE)
file for details.

[jq]: https://stedolan.github.io/jq/
[cost-of-modules]: https://github.com/siddharthkp/cost-of-modules
