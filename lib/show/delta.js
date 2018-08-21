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
const utils = require('./utils');
const { red, green, yellow } = require('chalk');

function summary({ baseline, subject, delta} , options) {
  const columns = [
    'label', 'numPkgs', 'pctPkgs', 'size', 'pct', 'numFiles', 'pctFiles'
  ];

  const table = new Table();

  utils.appendRow(table, columns, {
    label: red('LABEL'),
    numPkgs: red('#PKGS'),
    pctPkgs: red('%PKGS'),
    size: red('SIZE'),
    pct: red('%SIZE'),
    numFiles: red('#FILES'),
    pctFiles: red('%FILES')
  });

  table.pushDelimeter(columns);

  const PADDINGS = {
    numPkgs: 'left',
    pctPkgs: 'left',
    size: 'left',
    pct: 'left',
    numFiles: 'left',
    pctFiles: 'left'
  };

  const baselineSpecs = baseline.specs.map((s) => s.name);
  utils.appendRow(table, columns, {
    label: `BASELINE (${baselineSpecs.join(' ')})`,
    numPkgs: baseline.numPkgs,
    size: utils.formatSize(baseline.size),
    numFiles: baseline.numFiles
  }, PADDINGS);

  const subjectSpecs = subject.specs.map((s) => s.name);
  utils.appendRow(table, columns, {
    label: `SUBJECT (${subjectSpecs.join(' ')})`,
    numPkgs: subject.numPkgs,
    size: utils.formatSize(subject.size),
    numFiles: subject.numFiles
  }, PADDINGS);

  table.pushDelimeter(columns);

  utils.appendRow(table, columns, {
    label: 'DELTA',
    numPkgs: delta.numPkgs,
    pctPkgs: utils.formatPercent(delta.numPkgs, baseline.numPkgs),
    size: utils.formatSize(delta.size),
    pct: utils.formatPercent(delta.size, baseline.size),
    numFiles: delta.numFiles,
    pctFiles: utils.formatPercent(delta.numFiles, baseline.numFiles)
  }, PADDINGS);

  console.log(table.print().trim());
}

function showTable(table, columns, title, baseline, analysis, options, top) {
  if (analysis.packages.length === 0) {
    return;
  }

  utils.appendRow(table, columns, {
    label: red(title),
    size: red('SIZE'),
    pct: red('%SIZE'),
    numFiles: red('#FILES')
  });

  table.pushDelimeter(columns);

  const PADDINGS = {
    size: Table.padLeft,
    pct: Table.padLeft,
    numFiles: Table.padLeft
  };

  const sorted = Array.from(analysis.packages).sort((a, b) => b.size - a.size);
  const trunc = top !== undefined && sorted.length > top;
  if (trunc) {
    sorted.length = top;
  }

  sorted
    .forEach((pkg) => utils.appendRow(table, columns, {
      label: utils.formatPackageSpecifier(pkg),
      size: utils.formatSize(pkg.size),
      pct: utils.formatPercent(pkg.size, analysis.size),
      numFiles: pkg.files.length
    }, PADDINGS));

  table.pushDelimeter(columns);

  if (trunc) {
    const sumTitle = `TOP ${top}`;
    const sumSize = sorted.reduce((acc, pkg) => acc + pkg.size, 0);
    const sumNumFiles = sorted.reduce((acc, pkg) => acc + pkg.files.length, 0);
    utils.appendRow(table, columns, {
      label: yellow(sumTitle),
      size: yellow(utils.formatSize(sumSize)),
      pct: yellow(utils.formatPercent(sumSize, analysis.size)),
      numFiles: yellow(sumNumFiles)
    }, PADDINGS);
  }

  utils.appendRow(table, columns, {
    label: red(`TOTAL ${analysis.packages.length}`),
    size: red(utils.formatSize(analysis.size)),
    numFiles: red(analysis.numFiles)
  }, PADDINGS);

  table.newRow();
}

function details(analysis, options) {
  const columns = ['label', 'size', 'pct', 'numFiles'];
  const table = new Table();
  if (options.increaseTable) {
    showTable(table, columns, 'INCREASE', analysis.baseline, analysis.increase,
              options, options.increaseTop);
  }
  if (options.decreaseTable) {
    showTable(table, columns, 'DECREASE', analysis.baseline, analysis.decrease,
              options, options.decreaseTop);
  }
  if (options.commonTable) {
    showTable(table, columns, 'COMMON', analysis.baseline, analysis.common,
              options, options.commonTop);
  }
  console.log(table.print().trim());
}

module.exports.summary = summary;
module.exports.details = details;
