// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const { promisify } = require('util');

const crypto = require('crypto');
const fs = require('fs');
const mkdirp = promisify(require('mkdirp'));
const os = require('os');
const path = require('path');
const streamToString = require('stream-to-string');

function convertDepsToSpecs(deps, pkgDir) {
  return Object.entries(deps).map(([name, detail]) => {
    if (detail.startsWith('file:')) {
      detail = path.resolve(pkgDir, detail.slice(5));
    }
    return `${name}@${detail}`;
  });
}

async function makeWorkDir() {
  const tmpdir = fs.realpathSync(os.tmpdir());
  for (;;) {
    const dirname = crypto.randomBytes(8).toString('hex');
    const workdir = path.join(tmpdir, 'npm-diet', dirname);
    if (!fs.existsSync(workdir)) {
      await mkdirp(workdir);
      return workdir;
    }
  }
}

async function readStringFromFileOrStdin(filepath) {
  if (filepath === undefined) {
    return await streamToString(process.stdin);
  }
  if (!fs.existsSync(filepath)) {
    throw new Error(`no such file: ${filepath}`);
  }
  return fs.readFileSync(filepath, { encoding: 'utf8' });
}

module.exports.convertDepsToSpecs = convertDepsToSpecs;
module.exports.makeWorkDir = makeWorkDir;
module.exports.readStringFromFileOrStdin = readStringFromFileOrStdin;
