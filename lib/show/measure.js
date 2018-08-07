// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('easy-table');
const utils = require('./utils');
const { red, green, yellow } = require('chalk');

function summary(analysis, options) {
  const LABELS = {
    numPkgs: red('#PACKAGES'),
    size: red('SIZE'),
    numFiles: red('#FILES'),
    numDups: red('#DUPS'),
    sizeDup: red('DUP'),
    pctDup: red('%DUP')
  };

  const columns = [
    'numPkgs', 'size', 'numFiles', 'numDups', 'sizeDup', 'pctDup'
  ];

  const table = new Table();

  columns.forEach((col) => table.cell(col, LABELS[col]));
  table.newRow();
  table.pushDelimeter(columns);

  table.cell('numPkgs', analysis.numPkgs, Table.padLeft);
  table.cell('size', utils.formatSize(analysis.size), Table.padLeft);
  table.cell('numFiles', analysis.numFiles, Table.padLeft);
  table.cell('numDups', analysis.numDups, Table.padLeft);
  table.cell('sizeDup', utils.formatSize(analysis.sizeDups), Table.padLeft);
  table.cell('pctDup', utils.formatPercent(analysis.sizeDups, analysis.size), Table.padLeft);
  table.newRow();

  console.log(table.print().trim());
}

function details(analysis, options) {
  const sorted = Array.from(analysis.packages).sort((a, b) => b.size - a.size);

  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  const LABELS = {
    label: red('PACKAGE'),
    size: red('SIZE'),
    percent: red('%SIZE'),
    numFiles: red('#FILES'),
    path: red('PATH')
  };

  let columns = ['label', 'size', 'percent', 'numFiles'];
  if (options.packagePath) {
    columns.push('path');
  }

  const table = new Table();

  columns.forEach((col) => table.cell(col, LABELS[col]));
  table.newRow();
  table.pushDelimeter(columns);

  const PADDINGS = {
    size: Table.padLeft,
    percent: Table.padLeft,
    numFiles: Table.padLeft
  };

  sorted
    .map((pkg) => Object({
      label: `${pkg.name}@${pkg.version}`,
      size: utils.formatSize(pkg.size),
      percent: utils.formatPercent(pkg.size, analysis.size),
      numFiles: pkg.files.length,
      path: pkg.path
    }))
    .forEach((data) => {
      columns.forEach((col) => table.cell(col, data[col], PADDINGS[col]));
      table.newRow();
    });

  table.pushDelimeter(columns);

  if (trunc) {
    const sumTitle = `TOP ${options.top}`;
    const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
    const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
    table.cell('label', yellow(sumTitle));
    table.cell('size', yellow(utils.formatSize(sumSize)), Table.padLeft);
    table.cell('percent', yellow(utils.formatPercent(sumSize, analysis.size)), Table.padLeft);
    table.cell('numFiles', yellow(sumNumFiles), Table.padLeft);
    table.newRow();
  }

  table.cell('label', red(`TOTAL ${analysis.packages.length}`));
  table.cell('size', red(utils.formatSize(analysis.size)), Table.padLeft);
  table.cell('numFiles', red(analysis.numFiles), Table.padLeft);
  table.newRow();

  console.log(table.print().trim());
}

module.exports.summary = summary;
module.exports.details = details;
