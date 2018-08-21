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
