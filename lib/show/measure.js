// Copyright 2018 Masayuki Nagamachi <masayuki.nagamachi@gmail.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const Table = require('easy-table');
const utils = require('./utils');
const { red, green, yellow } = require('chalk');

function summary(analysis, options) {
  const columns = [
    'numPkgs', 'size', 'numFiles', 'numDups', 'sizeDup', 'pctDup'
  ];

  const table = new Table();

  utils.appendRow(table, columns, {
    numPkgs: red('#PKGS'),
    size: red('SIZE'),
    numFiles: red('#FILES'),
    numDups: red('#DUPS'),
    sizeDup: red('DUP'),
    pctDup: red('%DUP')
  });

  table.pushDelimeter(columns);

  utils.appendRow(table, columns, {
    numPkgs: analysis.numPkgs,
    size: utils.formatSize(analysis.size),
    numFiles: analysis.numFiles,
    numDups: analysis.numDups,
    sizeDup: utils.formatSize(analysis.sizeDups),
    pctDup: utils.formatPercent(analysis.sizeDups, analysis.size)
  }, columns.reduce((a, c) => {
    a[c] = 'left';
    return a;
  }, {}));

  console.log(table.print().trim());
}

function details(analysis, options) {
  const sorted = Array.from(analysis.packages).sort((a, b) => b.size - a.size);

  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  let columns = ['label', 'size', 'pct', 'numFiles'];
  if (options.packagePath) {
    columns.push('path');
  }

  const table = new Table();

  utils.appendRow(table, columns, {
    label: red('PACKAGE'),
    size: red('SIZE'),
    pct: red('%SIZE'),
    numFiles: red('#FILES'),
    path: red('PATH')
  });

  table.pushDelimeter(columns);

  const PADDINGS = {
    size: 'left',
    pct: 'left',
    numFiles: 'left'
  };

  sorted
    .forEach((pkg) => utils.appendRow(table, columns, {
      label: utils.formatPackageSpecifier(pkg),
      size: utils.formatSize(pkg.size),
      pct: utils.formatPercent(pkg.size, analysis.size),
      numFiles: pkg.files.length,
      path: pkg.path
    }, PADDINGS));

  table.pushDelimeter(columns);

  if (trunc) {
    const sumTitle = `TOP ${options.top}`;
    const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
    const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
    utils.appendRow(table, columns, {
      label: yellow(sumTitle),
      size: yellow(utils.formatSize(sumSize)),
      pct: yellow(utils.formatPercent(sumSize, analysis.size)),
      numFiles: yellow(sumNumFiles)
    }, PADDINGS);
  }

  utils.appendRow(table, columns, {
    label: red(`TOTAL ${analysis.packages.length}`),
    size: red(utils.formatSize(analysis.size)),
    numFiles: red(analysis.numFiles),
  }, PADDINGS);

  console.log(table.print().trim());
}

module.exports.summary = summary;
module.exports.details = details;
