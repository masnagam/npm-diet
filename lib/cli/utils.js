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
