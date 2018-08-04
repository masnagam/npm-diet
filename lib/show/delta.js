// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const wrapAnsi = require('wrap-ansi');
const utils = require('./utils');
const { red, green, yellow } = require('colors/safe');

function summary({ baseline, subject, delta} , options) {
  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);

  const baselineSpecs = baseline.specs.map((s) => s.name);
  table.push([
    green('BASELINE'),
    { colSpan: 3, content: baselineSpecs.join(' ') }
  ]);

  const subjectSpecs = subject.specs.map((s) => s.name);
  table.push([
    green('SUBJECT'),
    { colSpan: 3, content: subjectSpecs.join(' ') }
  ]);

  table.push([
    '',
    red('NUM OF PACKAGES'),
    red('TOTAL SIZE'),
    red('NUM OF FILES')
  ]);

  table.push([
    'BASELINE',
    baseline.numPkgs,
    utils.formatSizeWithUnit(baseline.size),
    baseline.numFiles
  ]);

  table.push([
    'SUBJECT',
    subject.numPkgs,
    utils.formatSizeWithUnit(subject.size),
    subject.numFiles
  ]);

  table.push([
    'DELTA (% OF BASELINE)',
    `${delta.numPkgs} (${utils.formatPercent(delta.numPkgs, baseline.numPkgs)})`,
    utils.formatSize(delta.size, baseline.size),
    `${delta.numFiles} (${utils.formatPercent(delta.numFiles, baseline.numFiles)})`
  ]);

  console.log(table.toString());
}

function showTable(title, baseline, analysis, options, top) {
  if (analysis.packages.length === 0) {
    return;
  }

  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);

  table.push([{
    colSpan: 3,
    content: green(wrapAnsi(title, maxWidth))
  }]);

  table.push([
    red('PACKAGE'),
    red('SIZE (% OF TOTAL)'),
    red('NUM OF FILES')
  ]);

  const sorted = analysis.packages.sort((a, b) => b.size - a.size);
  const trunc = top !== undefined && sorted.length > top;
  if (trunc) {
    sorted.length = top;
  }

  sorted.forEach((pkg) => {
    table.push([
      utils.formatPackageSpecifier(pkg),
      utils.formatSize(pkg.size, analysis.size),
      `${pkg.files.length}`
    ]);
  });

  if (trunc) {
    const sumTitle = `TOP ${top}`;
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

function details(analysis, options) {
  summary(analysis, options);
  if (options.increaseTable) {
    showTable('INCREASE', analysis.baseline, analysis.increase, options,
              options.increaseTop);
  }
  if (options.decreaseTable) {
    showTable('DECREASE', analysis.baseline, analysis.decrease, options,
              options.decreaseTop);
  }
  if (options.commonTable) {
    showTable('COMMON', analysis.baseline, analysis.common, options,
              options.commonTop);
  }
}

module.exports.summary = summary;
module.exports.details = details;
