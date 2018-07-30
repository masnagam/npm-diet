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

`npm-diet-measure` does not compute the bundle size of packages.

## Typical usages

Show the top 3 packages installed by `npm install gulp`:

```console
$ npm-diet measure gulp | npm-diet summary --top=3
┌─────────────────────────────────────────────────────────────────┐
│ npm install gulp                                                │
├─────────────────────┬─────────────────────┬─────────────────────┤
│ NAME (253 packages) │ SIZE (4.83 MB)      │ NUM OF FILES (1520) │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ source-map@0.5.7    │ 750.74 KB (15.18 %) │ 19                  │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ lodash@1.0.2        │ 514.06 KB (10.40 %) │ 9                   │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ dateformat@2.2.0    │ 174.94 KB (3.54 %)  │ 9                   │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ Sum of the top 3    │ 1.41 MB (29.12 %)   │ 37                  │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

You can specify multiple packages:

```console
$ npm-diet measure mocha chai sinon | npm-diet summary --top=3
┌──────────────────────────────────────────────────────────────┐
│ npm install mocha chai sinon                                 │
├────────────────────┬────────────────────┬────────────────────┤
│ NAME (42 packages) │ SIZE (8.65 MB)     │ NUM OF FILES (428) │
├────────────────────┼────────────────────┼────────────────────┤
│ sinon@6.1.4        │ 4.33 MB (50.10 %)  │ 56                 │
├────────────────────┼────────────────────┼────────────────────┤
│ mocha@5.2.0        │ 796.19 KB (8.99 %) │ 49                 │
├────────────────────┼────────────────────┼────────────────────┤
│ nise@1.4.2         │ 772.71 KB (8.73 %) │ 17                 │
├────────────────────┼────────────────────┼────────────────────┤
│ Sum of the top 3   │ 5.86 MB (67.82 %)  │ 122                │
└────────────────────┴────────────────────┴────────────────────┘
```

Process the analysis result with [jq]:

```console
$ npm-diet measure commander | jq .
{
  "subject": "npm install commander",
  "numPkgs": 1,
  "size": 61750,
  "numFiles": 6,
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

File:

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
