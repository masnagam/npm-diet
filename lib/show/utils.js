// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('easy-table');
const windowSize = require('window-size');
const stringWidth = require('string-width');

function round(number, precision) {
  return number.toFixed(precision);
}

function formatSize(n) {
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

function formatPackageSpecifier({ name, version }) {
  if (version.search(/\s/) >= 0) {
    return `${name}@"${version}"`;
  }
  return `${name}@${version}`;
}

function appendRow(table, columns, data, paddings = {}) {
  columns.forEach((col) => {
    let printer = undefined;
    if (paddings[col] === 'left') {
      printer = Table.padLeft;
    }
    if (paddings[col] === 'right') {
      printer = Table.padRight;
    }
    table.cell(col, data[col], printer);
  });
  table.newRow();
}

module.exports.formatSize = formatSize;
module.exports.formatPercent = formatPercent;
module.exports.formatPackageSpecifier = formatPackageSpecifier;
module.exports.appendRow = appendRow;
