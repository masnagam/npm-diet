// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const crypto = require('crypto');
const del = require('del');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const ora = require('ora');
const os = require('os');
const { exec } = require('child_process');

function makeTmpDir_() {
  for (;;) {
    const dirname = crypto.randomBytes(8).toString('hex');
    const tmpdir = path.join(os.tmpdir(), 'npm-diet', dirname);
    if (!fs.existsSync(tmpdir)) {
      mkdirp.sync(tmpdir);
      return tmpdir;
    }
  }
}

function asyncExec_(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
      return err ? reject(err) : resolve({ stdout, stderr });
    });
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
  const name = path.basename(pkgPath);
  const packageJson =
    JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json')));
  const files = collectFiles_(pkgPath);
  const size = files.reduce((acc, file) => acc + file.size, 0);
  return { name, size, files, packageJson };
}

async function measure(names) {
  const subject = `npm install ${names.join(' ')}`;
  const tmpdir = makeTmpDir_();
  const spinner = ora();
  try {

    spinner.start(
      `Preparing a working dir for installing in temporal...`);
    const init = await asyncExec_(
      `npm init -y --scope=npm-diet`, { cwd: tmpdir });

    spinner.start(`Installing packages for analysis...`);
    const install =
      await asyncExec_(`npm install ${names.join(' ')}`, { cwd: tmpdir });
    const ls = await asyncExec_(`npm ls --parseable`, { cwd: tmpdir });
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
    spinner.error(error);
    return { title, error };
  } finally {
    spinner.stop();
    await del(tmpdir, { force: true });
  }
}

module.exports = measure;
