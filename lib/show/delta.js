// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const Table = require('cli-table3');
const wrapAnsi = require('wrap-ansi');
const utils = require('./utils');
const { red, green, yellow } = require('colors/safe');

function showSummary({ baseline, subject, delta} , options) {
  const tableOptions = options.ascii ? utils.ASCII_TABLE_OPTIONS : {};
  const table = new Table(tableOptions);
  const maxWidth = utils.computeMaxWidth(table);

  const baselineSpecs = baseline.specs.map((s) => s.name);
  table.push([{
    colSpan: 4,
    content: green(wrapAnsi(`BASELINE: ${baselineSpecs.join(' ')}`, maxWidth))
  }]);

  const subjectSpecs = subject.specs.map((s) => s.name);
  table.push([{
    colSpan: 4,
    content: green(wrapAnsi(`SUBJECT: ${subjectSpecs.join(' ')}`, maxWidth))
  }]);

  table.push([
    '',
    red('PACKAGE'),
    red('SIZE'),
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
    'DELTA',
    `${delta.numPkgs} (${utils.formatPercent(delta.numPkgs, baseline.numPkgs)})`,
    utils.formatSize(delta.size, baseline.size),
    `${delta.numFiles} (${utils.formatPercent(delta.numFiles, baseline.numFiles)})`
  ]);

  console.log(table.toString());
}

function showTable(title, baseline, analysis, options) {
  if (analysis.packages.length === 0) {
    return;
  }

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
      utils.formatPackageSpecifier(pkg.name, pkg.version),
      utils.formatSize(pkg.size, baseline.size),
      `${pkg.files.length}`
    ]);
  });

  console.log(table.toString());
}

function show(analysis, options) {
  showSummary(analysis, options);
  showTable('INCREASE', analysis.baseline, analysis.increase, options);
  showTable('DECREASE', analysis.baseline, analysis.decrease, options);
  showTable('COMMON', analysis.baseline, analysis.common, options);
}

module.exports = show;
