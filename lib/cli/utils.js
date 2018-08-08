// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const { promisify } = require('util');

const fs = require('fs');
const mkdirp = promisify(require('mkdirp'));
const os = require('os');
const path = require('path');
const rimraf = promisify(require('rimraf'));
const streamToString = require('stream-to-string');

const readFile = promisify(fs.readFile);
const realpath = promisify(fs.realpath);
const exists = promisify(fs.exists);

function convertDepsToSpecs(deps, pkgDir) {
  return Object.entries(deps).map(([name, detail]) => {
    if (detail.startsWith('file:')) {
      detail = path.resolve(pkgDir, detail.slice(5));
    }
    return `${name}@${detail}`;
  });
}

async function makeWorkDir() {
  const tmpdir = await realpath(os.tmpdir());
  const workdir = path.join(tmpdir, 'npm-diet', process.pid.toString());
  if ((await exists(workdir))) {
    await rimraf(workdir);
  }
  await mkdirp(workdir);
  return workdir;
}

async function readStringFromFileOrStdin(filepath) {
  if (filepath === undefined) {
    return await streamToString(process.stdin);
  }
  if (!(await exists(filepath))) {
    throw new Error(`no such file: ${filepath}`);
  }
  return await readFile(filepath, { encoding: 'utf8' });
}

module.exports.convertDepsToSpecs = convertDepsToSpecs;
module.exports.makeWorkDir = makeWorkDir;
module.exports.readStringFromFileOrStdin = readStringFromFileOrStdin;
