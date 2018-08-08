// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

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
