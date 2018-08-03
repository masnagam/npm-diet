// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

function copy_(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function hasPkg_(analysis, pkg) {
  return analysis.packages.find((p) => p.name == pkg.name) !== undefined;
}

function makeMetrics_(pkgs) {
  return {
    numPkgs: pkgs.length,
    size: pkgs.reduce((acc, pkg) => acc + pkg.size, 0),
    numFiles: pkgs.reduce((acc, pkg) => acc + pkg.files.length, 0),
    packages: pkgs
  };
}

function delta(baseline, subject) {
  const delta = {
    numPkgs: subject.numPkgs - baseline.numPkgs,
    size: subject.size - baseline.size,
    numFiles: subject.numFiles - baseline.numFiles,
  };

  const increase = makeMetrics_(
    subject.packages.filter((pkg) => !hasPkg_(baseline, pkg)));

  const decrease = makeMetrics_(
    baseline.packages.filter((pkg) => !hasPkg_(subject, pkg)));

  const common = makeMetrics_(
    baseline.packages.filter((pkg) => hasPkg_(subject, pkg)));

  return {
    type: 'delta', baseline, subject, delta, increase, decrease, common
  };
}

module.exports = delta;
