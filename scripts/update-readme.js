// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

(async () => {

const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const exec = promisify(require('child_process').exec);

const content = fs.readFileSync(
  path.join(__dirname, 'README.md.in'), { encoding: 'utf8' });

const lines = content.split('\n');

for (const line of lines) {
  if (line.startsWith('@@')) {
    const cmd = line.slice(2).trim();
    const { stdout } = await exec(cmd);
    const results = stdout.trimEnd().split('\n');
    for (const result of results) {
      console.log(result.trimEnd());
    }
  } else {
    console.log(line.trimEnd());
  }
}

})();
