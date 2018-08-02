// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const wrapAnsi = require('wrap-ansi');
const stringWidth = require('string-width');
const windowSize = require('window-size');
const utils = require('./utils');
const { red, green, yellow } = require('colors/safe');

function show(analysis, options) {
  const ASCII_TABLE_OPTIONS = {
    chars: {
      'top': '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
      'bottom': '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
      'left': '|' , 'left-mid': '+', 'right': '|' , 'right-mid': '+',
      'mid': '-', 'mid-mid': '+', 'middle': '|'
    }
  };

  const sorted = analysis.packages.sort((a, b) => b.size - a.size);

  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  const tableOptions = options.ascii ? ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);

  const maxWidth = windowSize.get().width
    - stringWidth(table.options.chars.left)
    - stringWidth(table.options.chars.right)
    - table.options.style['padding-left']
    - table.options.style['padding-right'];

  table.push([{
    colSpan: 3,
    content: green(wrapAnsi(analysis.subject, maxWidth))
  }]);

  table.push([
    red(`PACKAGE (${analysis.numPkgs})`),
    red(`SIZE (${utils.formatSizeWithUnit(analysis.size)})`),
    red(`NUM OF FILES (${analysis.numFiles})`)
  ]);

  sorted.forEach((pkg) => {
    table.push([
      `${pkg.name}@${pkg.version}`,
      utils.formatSize(pkg.size, analysis.size),
      `${pkg.files.length}`
    ]);
  });

  const sumTitle = trunc ? `Sum of the top ${options.top}` : 'Sum';
  const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
  const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
  table.push([
    yellow(sumTitle),
    yellow(utils.formatSize(sumSize, analysis.size)),
    yellow(sumNumFiles)
  ]);

  console.log(table.toString());
}

module.exports = show;
