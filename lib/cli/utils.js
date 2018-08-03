// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const fs = require('fs');
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

module.exports.readStringFromFileOrStdin = readStringFromFileOrStdin;
