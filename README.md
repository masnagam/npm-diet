# @masnagam/npm-diet

> Tools to help keeping your package slim

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

See [measure.js](./lib/measure.js).

`npm-diet measure` does not compute the bundle size of packages.

## Typical usages

Show the top 3 packages installed by `npm install gulp`:

```console
$ npm-diet measure gulp | npm-diet show --top=3
┌──────────────────────────────────────────────────────────────┐
│ npm install gulp                                             │
├──────────────────┬─────────────────────┬─────────────────────┤
│ PACKAGE (253)    │ SIZE (4.83 MB)      │ NUM OF FILES (1520) │
├──────────────────┼─────────────────────┼─────────────────────┤
│ source-map@0.5.7 │ 750.74 KB (15.18 %) │ 19                  │
├──────────────────┼─────────────────────┼─────────────────────┤
│ lodash@1.0.2     │ 514.06 KB (10.40 %) │ 9                   │
├──────────────────┼─────────────────────┼─────────────────────┤
│ dateformat@2.2.0 │ 174.94 KB (3.54 %)  │ 9                   │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Sum of the top 3 │ 1.41 MB (29.12 %)   │ 37                  │
└──────────────────┴─────────────────────┴─────────────────────┘
```

Specify multiple packages:

```console
$ npm-diet measure mocha chai sinon | npm-diet show --top=3
┌────────────────────────────────────────────────────────────┐
│ npm install mocha chai sinon                               │
├──────────────────┬────────────────────┬────────────────────┤
│ PACKAGE (42)     │ SIZE (8.65 MB)     │ NUM OF FILES (428) │
├──────────────────┼────────────────────┼────────────────────┤
│ sinon@6.1.4      │ 4.33 MB (50.10 %)  │ 56                 │
├──────────────────┼────────────────────┼────────────────────┤
│ mocha@5.2.0      │ 796.19 KB (8.99 %) │ 49                 │
├──────────────────┼────────────────────┼────────────────────┤
│ nise@1.4.2       │ 772.71 KB (8.73 %) │ 17                 │
├──────────────────┼────────────────────┼────────────────────┤
│ Sum of the top 3 │ 5.86 MB (67.82 %)  │ 122                │
└──────────────────┴────────────────────┴────────────────────┘
```

Process the analysis result with [jq]:

```console
$ npm-diet measure commander | jq .
{
  "subject": "npm install commander",
  "metrics": {
    "numPkgs": 1,
    "size": 61750,
    "numFiles": 6
  },
  "details": {
    "packages": [
      {
        "name": "commander",
        "size": 61750,
        "files": [
          {
            "path": "CHANGELOG.md",
            "size": 10068
          },
...
```

Use a `package.json` file for analysis:

```console
$ cat package.json
...
  "dependencies": {
    "npm-run-all": "^4.1.3",
    "rimraf": "^2.6.2"
  }
}
$ npm-diet pkg-deps --json package.json | npm-diet measure --stdin | \
    npm-diet show --top=3
┌───────────────────────────────────────────────────────────────┐
│ npm install npm-run-all@"^4.1.3" rimraf@"^2.6.2"              │
├────────────────────┬─────────────────────┬────────────────────┤
│ PACKAGE (74)       │ SIZE (1.23 MB)      │ NUM OF FILES (578) │
├────────────────────┼─────────────────────┼────────────────────┤
│ es-abstract@1.12.0 │ 163.35 KB (12.99 %) │ 40                 │
├────────────────────┼─────────────────────┼────────────────────┤
│ npm-run-all@4.1.3  │ 91.25 KB (7.26 %)   │ 30                 │
├────────────────────┼─────────────────────┼────────────────────┤
│ semver@5.5.0       │ 57.06 KB (4.54 %)   │ 6                  │
├────────────────────┼─────────────────────┼────────────────────┤
│ Sum of the top 3   │ 311.66 KB (24.79 %) │ 76                 │
└────────────────────┴─────────────────────┴────────────────────┘
```

Replace `rimraf` with `del`:

```console
$ echo '["npm-run-all","rimraf"]' | npm-diet measure --stdin rimraf! del | \
    npm-diet show --top=3
┌───────────────────────────────────────────────────────────────┐
│ npm install npm-run-all del                                   │
├────────────────────┬─────────────────────┬────────────────────┤
│ PACKAGE (87)       │ SIZE (1.30 MB)      │ NUM OF FILES (628) │
├────────────────────┼─────────────────────┼────────────────────┤
│ es-abstract@1.12.0 │ 163.35 KB (12.30 %) │ 40                 │
├────────────────────┼─────────────────────┼────────────────────┤
│ npm-run-all@4.1.3  │ 91.25 KB (6.87 %)   │ 30                 │
├────────────────────┼─────────────────────┼────────────────────┤
│ semver@5.5.0       │ 57.06 KB (4.30 %)   │ 6                  │
├────────────────────┼─────────────────────┼────────────────────┤
│ Sum of the top 3   │ 311.66 KB (23.46 %) │ 76                 │
└────────────────────┴─────────────────────┴────────────────────┘
```

## Data formats

The following formats are under consideration.  So, they may be changed in the
near future.

### Analysis

```js
{
  "subject": "npm install commander",  // arbitary text
  "metrics": { ... },                  // metrics
  "details": {
    "packages:" [ ... ]                // list of packages
  }
}
```

### Metrics

Subsequent analysers may add other metrics.

```js
{
  "numPkgs": 1,   // the number of packages
  "size": 61750,  // sum of package sizes
  "numFiles": 6,  // sum of the numbers of files
}
```

### Package

```js
{
  "name": "commander",    // package name
  "size": 61750,          // sum of file sizes
  "files": [ ... ],       // list of files
  "packageJson": { ... }  // contents of package.json
}
```

### File

```js
{
  "path": "CHANGELOG.md",  // relative path from the package root
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
