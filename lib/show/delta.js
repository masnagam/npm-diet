// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const wrapAnsi = require('wrap-ansi');
const utils = require('./utils');
const { red, green, yellow } = require('colors/safe');

function showTable(title, baseline, analysis, options) {
  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);

  table.push([{
    colSpan: 3,
    content: wrapAnsi(title, maxWidth)
  }]);

  table.push([
    red(`PACKAGE (${analysis.numPkgs})`),
    red(`SIZE (${utils.formatSizeWithUnit(analysis.size)})`),
    red(`NUM OF FILES (${analysis.numFiles})`)
  ]);

  analysis.packages.forEach((pkg) => {
    table.push([
      `${pkg.name}@${pkg.version}`,
      utils.formatSize(pkg.size, baseline.size),
      `${pkg.files.length}`
    ]);
  });

  console.log(table.toString());
}

function show(analysis, options) {
  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);
  table.push([{
    colSpan: 3,
    content: green(wrapAnsi(analysis.subject, maxWidth))
  }]);
  table.push([
    red(`PACKAGE (${analysis.delta.numPkgs})`),
    red(`SIZE (${utils.formatSizeWithUnit(analysis.delta.size)})`),
    red(`NUM OF FILES (${analysis.delta.numFiles})`)
  ]);
  console.log(table.toString());

  showTable('INCREASE', analysis.baseline, analysis.increase, options);
  showTable('DECREASE', analysis.baseline, analysis.decrease, options);
  showTable('COMMON', analysis.baseline, analysis.common, options);
}

module.exports = show;
