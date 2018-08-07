// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const wrapAnsi = require('wrap-ansi');
const stringWidth = require('string-width');
const windowSize = require('window-size');
const utils = require('./utils');
const { red, green, yellow } = require('colors/safe');

function showTable_(dup, analysis, options) {
  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);

  const title = `Duplicates of ${dup.name}`;
  table.push([{
    colSpan: options.packagePath ? 4 : 3,
    content: green(wrapAnsi(title, maxWidth))
  }]);

  const pkg = dup.packages[0];
  let row = [
    utils.formatPackageSpecifier(pkg),
    utils.formatSizeWithUnit(pkg.size),
    pkg.files.length
  ];
  if (options.packagePath) {
      row.push(pkg.path);
  }
  table.push(row)

  let header = [
    red('PACKAGE'),
    red('SIZE (% OF TOTAL DUPS)'),
    red('NUM OF FILES')
  ];
  if (options.packagePath) {
    header.push(red('PATH'));
  }
  table.push(header);

  dup.packages.slice(1).forEach((pkg) => {
    let row = [
      utils.formatPackageSpecifier(pkg),
      utils.formatSize(pkg.size, analysis.size),
      pkg.files.length
    ];
    if (options.packagePath) {
      row.push(pkg.path);
    }
    table.push(row)
  });

  table.push([
    red(`TOTAL ${dup.packages.length - 1}`),
    red(utils.formatSize(dup.size, analysis.size)),
    red(dup.numFiles)
  ]);

  console.log(table.toString());
}

function details(analysis, options) {
  const sorted = analysis.duplicates.sort((a, b) => b.size - a.size);
  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  sorted.forEach((dup) => showTable_(dup, analysis, options));
}

module.exports.details = details;
