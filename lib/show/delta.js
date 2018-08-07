// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('easy-table');
const utils = require('./utils');
const { red, green, yellow } = require('chalk');

function summary({ baseline, subject, delta} , options) {
  const LABELS = {
    label: red('LABEL'),
    numPkgs: red('#PKGS'),
    pctPkgs: red('%PKGS'),
    size: red('SIZE'),
    pct: red('%SIZE'),
    numFiles: red('#FILES'),
    pctFiles: red('%FILES')
  };

  const columns = [
    'label', 'numPkgs', 'pctPkgs', 'size', 'pct', 'numFiles', 'pctFiles'
  ];

  const table = new Table();

  columns.forEach((col) => table.cell(col, LABELS[col]));
  table.newRow();
  table.pushDelimeter(columns);

  const baselineSpecs = baseline.specs.map((s) => s.name);
  table.cell('label', `BASELINE (${baselineSpecs.join(' ')})`);
  table.cell('numPkgs', baseline.numPkgs, Table.padLeft);
  table.cell('size', utils.formatSize(baseline.size), Table.padLeft);
  table.cell('numFiles', baseline.numFiles, Table.padLeft);
  table.newRow();

  const subjectSpecs = subject.specs.map((s) => s.name);
  table.cell('label', `SUBJECT (${subjectSpecs.join(' ')})`);
  table.cell('numPkgs', subject.numPkgs, Table.padLeft);
  table.cell('size', utils.formatSize(subject.size), Table.padLeft);
  table.cell('numFiles', subject.numFiles, Table.padLeft);
  table.newRow();

  table.pushDelimeter(columns);

  table.cell('label', 'DELTA');
  table.cell('numPkgs', delta.numPkgs, Table.padLeft);
  table.cell('pctPkgs', utils.formatPercent(delta.numPkgs, baseline.numPkgs), Table.padLeft);
  table.cell('size', utils.formatSize(delta.size), Table.padLeft);
  table.cell('pct', utils.formatPercent(delta.size, baseline.size), Table.padLeft);
  table.cell('numFiles', delta.numFiles, Table.padLeft);
  table.cell('pctFiles', utils.formatPercent(delta.numFiles, baseline.numFiles), Table.padLeft);
  table.newRow();

  console.log(table.print().trim());
}

function showTable(table, title, baseline, analysis, options, top) {
  if (analysis.packages.length === 0) {
    return;
  }

  const LABELS = {
    label: red(title),
    size: red('SIZE'),
    pct: red('%SIZE'),
    numFiles: red('#FILES')
  };

  const columns = [
    'label', 'size', 'pct', 'numFiles'
  ];

  columns.forEach((col) => table.cell(col, LABELS[col]));
  table.newRow();
  table.pushDelimeter(columns);

  const sorted = Array.from(analysis.packages).sort((a, b) => b.size - a.size);
  const trunc = top !== undefined && sorted.length > top;
  if (trunc) {
    sorted.length = top;
  }

  const PADDINGS = {
    size: Table.padLeft,
    pct: Table.padLeft,
    numFiles: Table.padLeft
  };

  sorted
    .map((pkg) => Object({
      label: utils.formatPackageSpecifier(pkg),
      size: utils.formatSize(pkg.size),
      pct: utils.formatPercent(pkg.size, analysis.size),
      numFiles: pkg.files.length
    }))
    .forEach((data) => {
      columns.forEach((col) => table.cell(col, data[col], PADDINGS[col]));
      table.newRow();
    });

  table.pushDelimeter(columns);

  if (trunc) {
    const sumTitle = `TOP ${top}`;
    const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
    const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
    table.cell('label', yellow(sumTitle));
    table.cell('size', yellow(utils.formatSize(sumSize)), Table.padLeft);
    table.cell('pct', yellow(utils.formatPercent(sumSize, analysis.size)), Table.padLeft);
    table.cell('numFiles', yellow(sumNumFiles), Table.padLeft);
    table.newRow();
  }

  table.cell('label', red(`TOTAL ${analysis.packages.length}`));
  table.cell('size', red(utils.formatSize(analysis.size)), Table.padLeft);
  table.cell('numFiles', red(analysis.numFiles), Table.padLeft);
  table.newRow();
  table.newRow();
}

function details(analysis, options) {
  const table = new Table();
  if (options.increaseTable) {
    showTable(table, 'INCREASE', analysis.baseline, analysis.increase, options,
              options.increaseTop);
  }
  if (options.decreaseTable) {
    showTable(table, 'DECREASE', analysis.baseline, analysis.decrease, options,
              options.decreaseTop);
  }
  if (options.commonTable) {
    showTable(table, 'COMMON', analysis.baseline, analysis.common, options,
              options.commonTop);
  }
  console.log(table.print().trim());
}

module.exports.summary = summary;
module.exports.details = details;
