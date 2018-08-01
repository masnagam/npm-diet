// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

function copy_(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function hasPkg_(analysis, pkg) {
  return analysis.details.packages.find((p) => p.name == pkg.name)
    !== undefined;
}

function delta(baseline, analysis) {
  const subject = 'delta';

  const metrics = {
    numPkgs: analysis.metrics.numPkgs - baseline.metrics.numPkgs,
    size: analysis.metrics.size - baseline.metrics.size,
    numFiles: analysis.metrics.numFiles - baseline.metrics.numFiles,
    baseline: copy_(baseline.metrics)
  };

  const addedPackages =
    analysis.details.packages.filter((pkg) => !hasPkg_(baseline, pkg));
  const removedPackages =
    baseline.details.packages.filter((pkg) => !hasPkg_(analysis, pkg));
  const packages = addedPackages.concat(
    removedPackages.map((pkg) => {
      let p = copy_(pkg);
      p.removed = true;
      return p;
    })
  );
  const baselinePackages = copy_(baseline.details.packages);
  const details = { packages, baselinePackages };

  return { subject, metrics, details };
}

module.exports = delta;
