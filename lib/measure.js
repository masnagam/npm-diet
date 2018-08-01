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
  const name = path.basename(pkgPath);
  const packageJson =
    JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json')));
  const files = collectFiles_(pkgPath);
  const size = files.reduce((acc, file) => acc + file.size, 0);
  return { name, size, files, packageJson };
}

function getPackageName_(spec) {
  // parse [<@scope>/]<name>@<version-specifier>
  const i = spec.indexOf('@', 1);
  if (i > 0) {
    spec = spec.slice(0, i);
  }
  return spec;
}

function normalizeSpecs_(specs) {
  let normalized = [];
  for (const spec of specs) {
    if (spec.startsWith('_')) {
      const name = getPackageName_(spec.slice(1));
      const i = normalized.findIndex((s) => getPackageName_(s) === name);
      if (i < 0) {
        // TODO: print a warning message
      } else {
        normalized.splice(i, 1);
      }
    } else {
      const name = getPackageName_(spec);
      if (normalized.find((s) => getPackageName_(s) === name)) {
        // TODO: print a warning message to notify of the duplicate
      } else {
        normalized.push(spec);
      }
    }
  }
  return normalized;
}

async function measure(specs) {
  specs = normalizeSpecs_(specs);
  const subject = `npm install ${specs.join(' ')}`;
  const tmpdir = await makeTmpDir_();
  const spinner = ora();
  try {

    spinner.start(
      `Preparing a working dir for installing in temporal...`);
    const init = await exec(`npm init -y --scope=npm-diet`, { cwd: tmpdir });

    spinner.start(`Installing packages for analysis...`);
    const install =
      await exec(`npm install ${specs.join(' ')}`, { cwd: tmpdir });
    const ls = await exec(`npm ls --parseable`, { cwd: tmpdir });
    const pkgPaths = ls.stdout.trim().split(/\s+/);
    pkgPaths.shift();
    const numPkgs = pkgPaths.length;

    spinner.start(`Analyzing...`);
    const packages = pkgPaths.map((pkgPath) => analyzePackage_(pkgPath));
    const size = packages.reduce((acc, pkg) => acc + pkg.size, 0);
    const numFiles = packages.reduce((acc, pkg) => acc + pkg.files.length, 0);

    return {
      subject,
      metrics: { numPkgs, size, numFiles },
      details: { packages }
    };
  } catch (error) {
    spinner.fail(error);
    return { title, error };
  } finally {
    spinner.stop();
    await rimraf(tmpdir);
  }
}

module.exports = measure;
