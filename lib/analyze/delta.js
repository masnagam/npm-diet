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
  baseline = copy_(baseline);
  subject = copy_(subject);

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

module.exports.delta = delta;

// istanbul ignore else
if (process.env.NODE_ENV === 'test') {
  module.exports.copy_ = copy_;
  module.exports.hasPkg_ = hasPkg_;
  module.exports.makeMetrics_ = makeMetrics_;
}
