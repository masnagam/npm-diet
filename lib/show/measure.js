// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const wrapAnsi = require('wrap-ansi');
const stringWidth = require('string-width');
const windowSize = require('window-size');
const utils = require('./utils');
const { red, green, yellow } = require('colors/safe');

function summary(analysis, options) {
  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);

  const title = analysis.specs.map((s) => s.name).join(' ');
  table.push([{
    colSpan: 3,
    content: green(wrapAnsi(title, maxWidth))
  }]);

  table.push([
    red('NUM OF PACKAGES'),
    red('TOTAL SIZE'),
    red('NUM OF FILES')
  ]);

  table.push([
    analysis.numPkgs,
    utils.formatSizeWithUnit(analysis.size),
    analysis.numFiles
  ]);

  console.log(table.toString());
}

function details(analysis, options) {
  const sorted = analysis.packages.sort((a, b) => b.size - a.size);

  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);

  const maxWidth = utils.computeMaxWidth(table);

  const title = analysis.specs.map((s) => s.name).join(' ');
  table.push([{
    colSpan: options.packagePath ? 4 : 3,
    content: green(wrapAnsi(title, maxWidth))
  }]);

  let header = [
    red('PACKAGE'),
    red('SIZE (% OF TOTAL)'),
    red('NUM OF FILES')
  ];
  if (options.packagePath) {
    header.push(red('PATH'));
  }
  table.push(header);

  sorted.forEach((pkg) => {
    let row = [
      utils.formatPackageSpecifier(pkg),
      utils.formatSize(pkg.size, analysis.size),
      `${pkg.files.length}`
    ];
    if (options.packagePath) {
      row.push(pkg.path);
    }
    table.push(row)
  });

  if (trunc) {
    const sumTitle = `TOP ${options.top}`;
    const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
    const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
    table.push([
      yellow(sumTitle),
      yellow(utils.formatSize(sumSize, analysis.size)),
      yellow(sumNumFiles)
    ]);
  }

  table.push([
    red(`TOTAL ${analysis.numPkgs}`),
    red(utils.formatSizeWithUnit(analysis.size)),
    red(analysis.numFiles)
  ]);

  console.log(table.toString());
}

module.exports.summary = summary;
module.exports.details = details;
