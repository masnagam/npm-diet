// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const { promisify } = require('util');

const crypto = require('crypto');
const fs = require('fs');
const rimraf = promisify(require('rimraf'));
const mkdirp = promisify(require('mkdirp'));
const path = require('path');
const ora = require('ora');
const os = require('os');
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

async function makeTmpDir_() {
  for (;;) {
    const dirname = crypto.randomBytes(8).toString('hex');
    const tmpdir = path.join(os.tmpdir(), 'npm-diet', dirname);
    if (!fs.existsSync(tmpdir)) {
      await mkdirp(tmpdir);
      return tmpdir;
    }
  }
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
      const stats = fs.statSync(entryPath);
      if (stats.isFile()) {
        acc.push({
          path: path.relative(pkgPath, entryPath),
          size: stats.size
        });
        return acc;
      }
      if (stats.isDirectory()) {
        return collectFiles(entryPath, acc);
      }
      return acc;
    }, files);
  }
  return collectFiles(pkgPath, []);
}

function analyzePackage_(pkgPath) {
  const packageJson =
    JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json')));
  const name = packageJson.name;
  const version = packageJson.version;
  const files = collectFiles_(pkgPath);
  const size = files.reduce((acc, file) => acc + file.size, 0);
  return { name, version, size, files };
}

async function measure(specs) {
  specs = convertSpecs_(specs);

  const tmpdir = await makeTmpDir_();
  const execOpt = { cwd: tmpdir };
  const spinner = ora();
  try {
    spinner.start('Preparing a working dir for installing in temporal...');
    const init = await exec('npm init -y --scope=npm-diet', execOpt);

    const installArgs = computeInstallArgs_(specs);
    spinner.start(`Installing ${installArgs.join(' ')}...`);
    const install = await exec(sh`npm install ${installArgs}`, execOpt);

    spinner.start('Analyzing packages...');
    const ls = await exec('npm ls --parseable', execOpt);
    const pkgPaths = ls.stdout.trim().split(/\s+/);
    pkgPaths.shift();
    const numPkgs = pkgPaths.length;
    const packages = pkgPaths.map((pkgPath) => analyzePackage_(pkgPath));
    const size = packages.reduce((acc, pkg) => acc + pkg.size, 0);
    const numFiles = packages.reduce((acc, pkg) => acc + pkg.files.length, 0);

    return { type: 'measure', specs, numPkgs, size, numFiles, packages };
  } catch (error) {
    spinner.fail(error);
    return { specs, error };
  } finally {
    spinner.stop();
    await rimraf(tmpdir);
  }
}

module.exports = measure;
