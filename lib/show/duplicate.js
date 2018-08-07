// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('easy-table');
const utils = require('./utils');
const { red, green, yellow } = require('chalk');

function showTable_(table, dup, analysis, options) {
  const LABELS = {
    label: red('PACKAGE'),
    size: red('SIZE'),
    pct: red('%SIZE'),
    numFiles: red('#FILES'),
    path: red('PATH')
  };

  const columns = [
    'label', 'size', 'pct', 'numFiles'
  ];
  if (options.packagePath) {
    columns.push('path');
  }

  columns.forEach((col) => table.cell(col, LABELS[col]));
  table.newRow();

  table.pushDelimeter(columns);

  const pkg = dup.packages[0];
  table.cell('label', utils.formatPackageSpecifier(pkg));
  table.cell('size', utils.formatSize(pkg.size), Table.padLeft);
  table.cell('numFiles', pkg.files.length, Table.padLeft);
  if (options.packagePath) {
    table.cell('path', pkg.path);
  }
  table.newRow();

  table.pushDelimeter(columns);

  const PADDINGS = {
    size: Table.padLeft,
    pct: Table.padLeft,
    numFiles: Table.padLeft
  };

  dup.packages.slice(1)
    .map((pkg) => Object({
      label: utils.formatPackageSpecifier(pkg),
      size: utils.formatSize(pkg.size),
      pct: utils.formatPercent(pkg.size, analysis.size),
      numFiles: pkg.files.length,
      path: pkg.path
    }))
    .forEach((data) => {
      columns.forEach((col) => table.cell(col, data[col], PADDINGS[col]));
      table.newRow();
    });

  table.pushDelimeter(columns);

  table.cell('label', red(`TOTAL ${dup.packages.length - 1}`));
  table.cell('size', red(utils.formatSize(dup.size)), Table.padLeft);
  table.cell('pct', red(utils.formatPercent(dup.size, analysis.size)), Table.padLeft);
  table.cell('numFiles', red(dup.numFiles), Table.padLeft);
  table.newRow();
  table.newRow();
}

function details(analysis, options) {
  const sorted = Array.from(analysis.duplicates).sort((a, b) => b.size - a.size);
  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  const table = new Table();
  sorted.forEach((dup) => showTable_(table, dup, analysis, options));
  console.log(table.print().trim());
}

module.exports.details = details;
