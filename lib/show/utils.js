// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const windowSize = require('window-size');
const stringWidth = require('string-width');

const ASCII_TABLE_OPTIONS = {
  chars: {
    'top': '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
    'bottom': '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
    'left': '|' , 'left-mid': '+', 'right': '|' , 'right-mid': '+',
    'mid': '-', 'mid-mid': '+', 'middle': '|'
  }
};

function round(number, precision) {
  return number.toFixed(precision);
}

function formatSizeWithUnit(n) {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (Math.abs(n) < KB) {
    return n + ' B';
  }
  if (Math.abs(n) < MB) {
    return round(n / KB, 2) + ' KB';
  }
  if (Math.abs(n) < GB) {
    return round(n / MB, 2) + ' MB';
  }
  return round(n / GB, 2) + ' GB';
}

function formatPercent(n, t) {
  return round(n * 100 / t, 2) + ' %';
}

function formatSize(size, total) {
  return `${formatSizeWithUnit(size)} (${formatPercent(size, total)})`;
}

function formatPackageSpecifier({ name, version }) {
  if (version.search(/\s/) >= 0) {
    return `${name}@"${version}"`;
  }
  return `${name}@${version}`;
}

function computeMaxWidth(table) {
  return windowSize.get().width
    - stringWidth(table.options.chars.left)
    - stringWidth(table.options.chars.right)
    - table.options.style['padding-left']
    - table.options.style['padding-right'];
}

module.exports.ASCII_TABLE_OPTIONS = ASCII_TABLE_OPTIONS;
module.exports.formatSize = formatSize;
module.exports.formatSizeWithUnit = formatSizeWithUnit;
module.exports.formatPercent = formatPercent;
module.exports.formatPackageSpecifier = formatPackageSpecifier;
module.exports.computeMaxWidth = computeMaxWidth;
