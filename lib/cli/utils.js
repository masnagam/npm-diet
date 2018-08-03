// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const fs = require('fs');
const path = require('path');
const streamToString = require('stream-to-string');

async function readStringFromFileOrStdin(filepath) {
  if (filepath === undefined) {
    return await streamToString(process.stdin);
  }
  if (!fs.existsSync(filepath)) {
    throw new Error(`no such file: ${filepath}`);
  }
  return fs.readFileSync(filepath, { encoding: 'utf8' });
}

function convertDepsToSpecs(deps, pkgDir) {
  return Object.entries(deps).map(([name, detail]) => {
    if (detail.startsWith('file:')) {
      detail = path.resolve(pkgDir, detail.slice(5));
    }
    return `${name}@${detail}`;
  });
}

module.exports.readStringFromFileOrStdin = readStringFromFileOrStdin;
module.exports.convertDepsToSpecs = convertDepsToSpecs;
