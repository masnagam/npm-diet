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
