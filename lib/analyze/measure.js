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

const { promisify } = require('util');

const fs = require('fs');
const path = require('path');
const exec = promisify(require('child_process').exec);
const semver = require('semver');
const { sh } = require('puka');

function parseSpec_(spec) {
  // parse [<@scope>/]<name>@<detail>
  let name, detail;
  const i = spec.indexOf('@', 1);
  if (i > 0) {
    name = spec.slice(0, i);
    detail = spec.slice(i + 1);
  } else {
    name = spec;
    detail = '*';
  }
  return { name, detail };
}

function normalizeSpecs_(specs) {
  let normalized = [];
  for (const spec of specs) {
    if (spec.name.startsWith('_')) {
      const name = spec.name.slice(1);
      const i = normalized.findIndex((s) => s.name === name);
      if (i < 0) {
        // TODO: print a warning message
      } else {
        normalized.splice(i, 1);  // remove the found package
      }
    } else {
      const name = spec.name
      if (normalized.find((s) => s.name === name)) {
        // TODO: print a warning message to notify of the duplicate
      } else {
        normalized.push(spec);
      }
    }
  }
  return normalized;
}
function convertSpecs_(specs) {
  specs = specs.map((spec) => parseSpec_(spec));
  return normalizeSpecs_(specs);
}

function computeInstallArgs_(specs) {
  return specs.map((spec) => {
    const range = semver.validRange(spec.detail);
    if (range === null) {
      return spec.detail
    }
    if (range === '*') {
      return spec.name;
    }
    return `${spec.name}@${range}`;
  });
}

function collectFiles_(pkgPath) {
  function collectFiles(dir, files) {
    return fs.readdirSync(dir).reduce((acc, entry) => {
      if (entry === 'node_modules') {
        return acc;
      }
      const entryPath = path.join(dir, entry);
      const stats = fs.lstatSync(entryPath);
      if (stats.isSymbolicLink()) {
        return acc;
      }
      if (stats.isDirectory()) {
        return collectFiles(entryPath, acc);
      }
      acc.push({
        path: path.relative(pkgPath, entryPath),
        size: stats.size
      });
      return acc;
    }, files);
  }
  return collectFiles(pkgPath, []);
}

function analyzePackage_(pkgPath, dir) {
  const packageJson =
    JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json')));
  const name = packageJson.name;
  const version = packageJson.version;
  const files = collectFiles_(pkgPath);
  const size = files.reduce((acc, file) => acc + file.size, 0);
  return { name, version, size, files, path: path.relative(dir, pkgPath) };
}

async function measure(specs, workdir, emitter) {
  emitter.emit('start');

  specs = convertSpecs_(specs);
  const installArgs = computeInstallArgs_(specs);
  const execOpt = { cwd: workdir };

  emitter.emit('prepare');
  const init = await exec('npm init -y --scope=npm-diet', execOpt);

  emitter.emit('install', installArgs);
  const install = await exec(sh`npm install ${installArgs}`, execOpt);

  emitter.emit('analyze');
  const ls = await exec('npm ls --parseable', execOpt);
  const pkgPaths = ls.stdout.trim().split(/\s+/);
  pkgPaths.shift();
  const numPkgs = pkgPaths.length;
  const packages = pkgPaths.map((p) => analyzePackage_(p, workdir));
  const size = packages.reduce((acc, pkg) => acc + pkg.size, 0);
  const numFiles = packages.reduce((acc, pkg) => acc + pkg.files.length, 0);

  emitter.emit('done');
  return { type: 'measure', specs, numPkgs, size, numFiles, packages };
}

module.exports.measure = measure;

// istanbul ignore else
if (process.env.NODE_ENV === 'test') {
  module.exports.parseSpec_ = parseSpec_;
  module.exports.normalizeSpecs_ = normalizeSpecs_;
  module.exports.convertSpecs_ = convertSpecs_;
  module.exports.computeInstallArgs_ = computeInstallArgs_;
  module.exports.collectFiles_ = collectFiles_;
  module.exports.analyzePackage_ = analyzePackage_;
}
