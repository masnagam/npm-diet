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

function showTable_(table, columns, dup, analysis, options) {
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

  const pkg = dup.packages[0];
  utils.appendRow(table, columns, {
    label: utils.formatPackageSpecifier(pkg),
    size: utils.formatSize(pkg.size),
    numFiles: pkg.files.length,
    path: pkg.path
  }, PADDINGS);

  table.pushDelimeter(columns);

  dup.packages.slice(1)
    .forEach((pkg) => utils.appendRow(table, columns, {
      label: utils.formatPackageSpecifier(pkg),
      size: utils.formatSize(pkg.size),
      pct: utils.formatPercent(pkg.size, analysis.size),
      numFiles: pkg.files.length,
      path: pkg.path
    }, PADDINGS));

  table.pushDelimeter(columns);

  utils.appendRow(table, columns, {
    label: red(`TOTAL ${dup.packages.length - 1}`),
    size: red(utils.formatSize(dup.size)),
    pct: red(utils.formatPercent(dup.size, analysis.size)),
    numFiles: red(dup.numFiles)
  }, PADDINGS);

  table.newRow();
}

function details(analysis, options) {
  const sorted = Array.from(analysis.duplicates)
                      .sort((a, b) => b.size - a.size);
  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  const columns = ['label', 'size', 'pct', 'numFiles'];
  if (options.packagePath) {
    columns.push('path');
  }

  const table = new Table();
  sorted.forEach((dup) => showTable_(table, columns, dup, analysis, options));
  console.log(table.print().trim());
}

module.exports.details = details;
