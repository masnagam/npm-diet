// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const { red, green, yellow } = require('colors/safe');

function round(number, precision) {
  return number.toFixed(precision);
}

function unit(n) {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (n < KB) {
    return n + 'B';
  }
  if (n < MB) {
    return round(n / KB, 2) + 'KB';
  }
  if (n < GB) {
    return round(n / MB, 2) + 'MB';
  }
  return round(n / GB, 2) + 'GB';
}

function percent(n, t) {
  return round(n * 100 / t, 2) + '%';
}

function makeTitle(subject, { numPkgs, size, numFiles }) {
  return `${subject} => ${numPkgs} packages, ${unit(size)}, ${numFiles} files`;
}

function summary(analysis, options) {
  const ASCII_TABLE_OPTIONS = {
    chars: {
      'top': '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
      'bottom': '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
      'left': '|' , 'left-mid': '+', 'right': '|' , 'right-mid': '+',
      'mid': '-', 'mid-mid': '+', 'middle': '|'
    }
  };

  const sorted = analysis.details.packages.sort((a, b) => b.size - a.size);

  const trunc = options.top !== undefined && sorted.length > options.top;
  if (trunc) {
    sorted.length = options.top;
  }

  const tableOptions = options.ascii ? ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);

  const title = makeTitle(analysis.subject, analysis.metrics);
  table.push([{ colSpan: 4, content: green(title) }]);

  table.push([ red('NAME'), red('SIZE'), red('PERCENT'), red('NUM OF FILES') ]);


  sorted.forEach((pkg) => {
    table.push([
      `${pkg.name}@${pkg.packageJson.version}`,
      unit(pkg.size),
      percent(pkg.size, analysis.metrics.size),
      pkg.files.length
    ]);
  });

  const sumTitle = trunc ? `Sum of the top ${options.top}` : 'Sum';
  const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
  const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
  table.push([
    yellow(sumTitle),
    yellow(unit(sumSize)),
    yellow(percent(sumSize, analysis.metrics.size)),
    yellow(sumNumFiles)
  ]);

  console.log(table.toString());
}

module.exports = summary;
