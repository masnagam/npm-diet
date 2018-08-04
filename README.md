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
$ npm-diet measure livereload | npm-diet summary
┌─────────────────────────────────────────────┐
│ livereload                                  │
├─────────────────┬────────────┬──────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │
├─────────────────┼────────────┼──────────────┤
│ 131             │ 3.76 MB    │ 973          │
└─────────────────┴────────────┴──────────────┘
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
┌─────────────────────────────────────────────┐
│ mocha chai sinon                            │
├─────────────────┬────────────┬──────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │
├─────────────────┼────────────┼──────────────┤
│ 42              │ 8.65 MB    │ 428          │
└─────────────────┴────────────┴──────────────┘
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
┌─────────────────────────────────────────────┐
│ npm-run-all rimraf                          │
├─────────────────┬────────────┬──────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │
├─────────────────┼────────────┼──────────────┤
│ 74              │ 1.23 MB    │ 578          │
└─────────────────┴────────────┴──────────────┘
```

Replace `rimraf` with `del`:

```console
$ echo '["npm-run-all","rimraf"]' | npm-diet measure --stdin _rimraf del | \
    npm-diet summary
┌─────────────────────────────────────────────┐
│ npm-run-all del                             │
├─────────────────┬────────────┬──────────────┤
│ NUM OF PACKAGES │ TOTAL SIZE │ NUM OF FILES │
├─────────────────┼────────────┼──────────────┤
│ 87              │ 1.30 MB    │ 628          │
└─────────────────┴────────────┴──────────────┘
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
$ (npm-diet measure chalk ; npm-diet measure colors) | \
    npm-diet delta --stdin | npm-diet show delta -i 3 -d 3 -c 3
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
┌───────────────────────────────────────────────────┐
│ INCREASE                                          │
├──────────────┬─────────────────────┬──────────────┤
│ PACKAGE      │ SIZE (% OF TOTAL)   │ NUM OF FILES │
├──────────────┼─────────────────────┼──────────────┤
│ colors@1.3.1 │ 37.30 KB (100.00 %) │ 21           │
├──────────────┼─────────────────────┼──────────────┤
│ TOTAL 1      │ 37.30 KB            │ 21           │
└──────────────┴─────────────────────┴──────────────┘
┌─────────────────────────────────────────────────────────┐
│ DECREASE                                                │
├─────────────────────┬────────────────────┬──────────────┤
│ PACKAGE             │ SIZE (% OF TOTAL)  │ NUM OF FILES │
├─────────────────────┼────────────────────┼──────────────┤
│ color-convert@1.9.2 │ 27.44 KB (31.23 %) │ 7            │
├─────────────────────┼────────────────────┼──────────────┤
│ chalk@2.4.1         │ 27.34 KB (31.12 %) │ 7            │
├─────────────────────┼────────────────────┼──────────────┤
│ ansi-styles@3.2.1   │ 10.28 KB (11.70 %) │ 4            │
├─────────────────────┼────────────────────┼──────────────┤
│ TOP 3               │ 65.06 KB (74.05 %) │ 18           │
├─────────────────────┼────────────────────┼──────────────┤
│ TOTAL 7             │ 87.85 KB           │ 35           │
└─────────────────────┴────────────────────┴──────────────┘
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
