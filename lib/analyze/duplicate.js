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

function collectDups_(packages) {
  const tmp = packages.reduce((acc, pkg) => {
    if (acc[pkg.name] === undefined) {
      acc[pkg.name] = [];
    }
    acc[pkg.name].push(pkg);
    return acc;
  }, {});
  return Object
    .entries(tmp)
    .filter(([name, pkgs]) => pkgs.length > 1)
    .map(([name, pkgs]) => {
      pkgs = pkgs.sort((a, b) => a.path.length - b.path.length);
      return {
        name,
        size: pkgs.slice(1).reduce((a, p) => a + p.size, 0),
        numFiles: pkgs.slice(1).reduce((a, p) => a + p.files.length, 0),
        packages: pkgs
      };
    });
}

function duplicate(analysis) {
  const dups = collectDups_(analysis.packages);
  return {
    type: 'duplicate',
    specs: copy_(analysis.specs),
    numPkgs: dups.reduce((a, d) => a + d.packages.length - 1, 0),
    size: dups.reduce((a, d) => a + d.size, 0),
    numFiles: dups.reduce((a, d) => a + d.numFiles, 0),
    duplicates: dups
  };
}

module.exports.duplicate = duplicate;
